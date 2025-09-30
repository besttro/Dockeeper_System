// app/api/me/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const uid = await getCurrentUserId();
  if (!uid) {
    return NextResponse.json({ loggedIn: false });
  }

  const user = await prisma.user.findUnique({
    where: { user_id: uid },
    include: { member: true },
  });

  if (!user) return NextResponse.json({ loggedIn: false });

  return NextResponse.json({
    loggedIn: true,
    email: user.user_email,
    fname: user.member?.mem_fname ?? "",
    lname: user.member?.mem_lname ?? "",
    memType: user.member?.mem_type ?? null, // <-- IMPORTANT
  });
}



