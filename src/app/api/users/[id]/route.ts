// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // ✅ params is async in Next 15
) {
  const { id } = await ctx.params; // ✅ await it
  const viewerId = await getCurrentUserId();
  if (!viewerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetId = Number(id);
  if (!Number.isInteger(targetId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // who is viewing?
  const viewer = await prisma.user.findUnique({
    where: { user_id: viewerId },
    include: { member: true },
  });
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const viewerRole = viewer.member?.mem_type ?? 2; // default professor if missing

  // who is target?
  const target = await prisma.user.findUnique({
    where: { user_id: targetId },
    include: { member: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const targetRole = target.member?.mem_type ?? 2;

  // Role rules:
  // admin (0) -> can view anyone
  // staff (1) -> can view only professors (2)
  // professor (2) -> can view only themself
  const canView =
    viewerRole === 0 ||
    (viewerRole === 1 && targetRole === 2) ||
    (viewerRole === 2 && targetId === viewerId);

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // publications where target is owner (part_status=0) and pub_status=1 (public)
  const pubs = await prisma.publication.findMany({
    where: {
      pub_status: 1,
      participations: {
        some: { user_id: targetId, part_status: 0 },
      },
    },
    select: { pub_id: true, pub_title: true, pub_year: true },
    orderBy: { pub_year: "desc" },
  });

  return NextResponse.json({
    id: target.user_id,
    email: target.user_email,
    fname: target.member?.mem_fname ?? "",
    lname: target.member?.mem_lname ?? "",
    phone: target.member?.mem_phone ?? "",
    memType: target.member?.mem_type ?? null,
    publications: pubs.map((p) => ({
      id: p.pub_id,
      title: p.pub_title,
      year: p.pub_year,
      link: `/pub_details?id=${p.pub_id}`,
    })),
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetId = Number(params.id);
  if (!Number.isInteger(targetId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Who is viewing?
  const viewer = await prisma.user.findUnique({
    where: { user_id: viewerId },
    include: { member: true },
  });
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const viewerRole = viewer.member?.mem_type ?? 2; // 0 admin, 1 staff, 2 professor

  // Who is target?
  const target = await prisma.user.findUnique({
    where: { user_id: targetId },
    include: { member: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const targetRole = target.member?.mem_type ?? 2;

  // Permission matrix:
  // - admin (0): can edit anyone
  // - staff (1): can edit professors (2) only
  // - professor (2): can edit themselves only (optional rule)
  const canEdit =
    viewerRole === 0 ||
    (viewerRole === 1 && targetRole === 2) ||
    (viewerRole === 2 && targetId === viewerId);

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const fname = String(body?.fname ?? "").trim();
  const lname = String(body?.lname ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const password = typeof body?.password === "string" ? body.password.trim() : "";

  // Update member fields (create if missing)
  if (target.member) {
    await prisma.member.update({
      where: { mem_id: target.mem_id! },
      data: {
        mem_fname: fname || target.member.mem_fname,
        mem_lname: lname || target.member.mem_lname,
        mem_phone: phone || target.member.mem_phone,
      },
    });
  } else {
    const newMember = await prisma.member.create({
      data: {
        mem_fname: fname || "",
        mem_lname: lname || "",
        mem_phone: phone || "",
        mem_type: 2, // default to professor if creating fresh; adjust if needed
      },
    });
    await prisma.user.update({
      where: { user_id: target.user_id },
      data: { mem_id: newMember.mem_id },
    });
  }

  // Update password (plain text) if provided
  if (password) {
    await prisma.user.update({
      where: { user_id: target.user_id },
      data: { user_password: password },
    });
  }

  return NextResponse.json({ success: true });
}
