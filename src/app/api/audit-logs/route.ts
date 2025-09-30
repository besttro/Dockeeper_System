// app/api/audit-logs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

const ROLE_LABEL: Record<number, "Admin" | "Officer" | "Professor"> = {
  0: "Admin",
  1: "Officer",
  2: "Professor",
};

export async function GET() {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const viewer = await prisma.user.findUnique({
    where: { user_id: viewerId },
    include: { member: true },
  });
  const role = viewer?.member?.mem_type ?? 2;
  if (role !== 0) {
    // Admin-only
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Latest 1000 login logs (adjust as you like)
  const logs = await prisma.auditLog.findMany({
    where: { action: "login" },
    orderBy: { created_at: "desc" },
    take: 1000,
    include: {
      user: {
        include: { member: true },
      },
    },
  });

  const rows = logs.map(l => {
    const mem = l.user.member;
    const name = `${mem?.mem_fname ?? ""} ${mem?.mem_lname ?? ""}`.trim() || "(unknown)";
    const memType = mem?.mem_type ?? 2;
    return {
      name,
      email: l.user.user_email,
      role: ROLE_LABEL[memType],
      action: l.action,
      timeISO: l.created_at.toISOString(),
    };
  });

  return NextResponse.json(rows);
}
