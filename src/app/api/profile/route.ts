// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// GET current user's profile (from session)
export async function GET() {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { user_id: uid },
    select: {
      user_email: true,
      mem_id: true,
      member: { select: { mem_fname: true, mem_lname: true, mem_phone: true, mem_type: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    email: user.user_email,
    fname: user.member?.mem_fname ?? "",
    lname: user.member?.mem_lname ?? "",
    phone: user.member?.mem_phone ?? "",
    mem_type: user.member?.mem_type ?? null,
  });
}

// PUT update current user's profile (from session)
// NOTE: stores password as PLAIN TEXT if provided.
export async function PUT(req: Request) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fname, lname, phone, password } = await req.json();

  if (!fname || !lname) {
    return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.findUnique({
      where: { user_id: uid },
      select: { user_id: true, mem_id: true },
    });
    if (!user) throw new Error("User not found");

    // Upsert Member
    if (user.mem_id) {
      await tx.member.update({
        where: { mem_id: user.mem_id },
        data: {
          mem_fname: fname,
          mem_lname: lname,
          mem_phone: phone ?? "",
        },
      });
    } else {
      const newMember = await tx.member.create({
        data: {
          mem_fname: fname,
          mem_lname: lname,
          mem_phone: phone ?? "",
          mem_type: 1,
        },
      });
      await tx.user.update({
        where: { user_id: uid },
        data: { mem_id: newMember.mem_id },
      });
    }

    // Update password if provided (PLAIN TEXT)
    if (typeof password === "string" && password.trim() !== "") {
      await tx.user.update({
        where: { user_id: uid },
        data: { user_password: password.trim() },
      });
    }

    return true;
  });

  return NextResponse.json({ success: !!updated });
}

