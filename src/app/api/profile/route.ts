import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path to your prisma instance

// GET profile by email
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { user_email: email },
    include: { member: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    email: user.user_email,
    fname: user.member?.mem_fname || "",
    lname: user.member?.mem_lname || "",
    phone: user.member?.mem_phone || "",
  });
}

// PUT update profile
export async function PUT(req: Request) {
  const body = await req.json();
  const { email, fname, lname, phone, password } = body;

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { user_email: email },
    include: { member: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Update Member info
  if (user.member) {
    await prisma.member.update({
      where: { mem_id: user.mem_id },
      data: {
        mem_fname: fname,
        mem_lname: lname,
        mem_phone: phone,
        mem_type: 1, // testing
      },
    });
  } else {
    // Create member if missing
    const newMember = await prisma.member.create({
      data: {
        mem_fname: fname,
        mem_lname: lname,
        mem_phone: phone,
        mem_type: 1,
      },
    });

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { mem_id: newMember.mem_id },
    });
  }

  // Update password if provided (plain text)
  if (password && password.trim() !== "") {
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { user_password: password },
    });
  }

  return NextResponse.json({ success: true });
}

