// app/api/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ loggedIn: false }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { user_id: uid },
    select: {
      user_email: true,
      member: { select: { mem_fname: true, mem_lname: true } },
    },
  });

  if (!user) return NextResponse.json({ loggedIn: false }, { status: 200 });

  return NextResponse.json({
    loggedIn: true,
    email: user.user_email,
    fname: user.member?.mem_fname ?? "",
    lname: user.member?.mem_lname ?? "",
  });
}

