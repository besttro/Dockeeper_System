// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

function getClientIp(req: Request) {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  // In dev this may be null; that's fine.
  return req.headers.get("x-real-ip") ?? null;
}

export async function POST(req: Request) {
  // Parse and validate body
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  // Look up user (and member -> role)
  const user = await prisma.user.findUnique({
    where: { user_email: email },
    include: { member: true },
  });

  // NOTE: plain-text compare, per your setup (no bcrypt)
  if (!user || user.user_password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create JWT
  const token = await new SignJWT({ uid: user.user_id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  // Write audit log (best-effort; don't fail login if this throws)
  try {
    await prisma.auditLog.create({
      data: {
        user_id: user.user_id,
        action: "login",
        ip: getClientIp(req),
        user_agent: req.headers.get("user-agent") ?? null,
      },
    });
  } catch (e) {
    // Optional: console.warn("Failed to write audit log:", e);
  }

  // Build response and set cookie
  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.user_id,
      email: user.user_email,
      fname: user.member?.mem_fname ?? "",
      lname: user.member?.mem_lname ?? "",
      memType: user.member?.mem_type ?? null, // 0=admin,1=staff,2=professor
    },
  });

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}


