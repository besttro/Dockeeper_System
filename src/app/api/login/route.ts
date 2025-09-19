import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { user_email: email },
  });

  if (user && user.user_password === password) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}
