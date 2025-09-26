// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // TODO: replace with your real password hashing + verification
  const user = await prisma.user.findUnique({ where: { user_email: email } });
  if (!user || user.user_password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({ uid: user.user_id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const res = NextResponse.json({ ok: true });
  // HttpOnly cookie
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

