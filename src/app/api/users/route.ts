// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

/* ========= GET /api/users =========
   List users for Admin/Staff table with filters.
   - Admin (mem_type=0): see Staff (1) + Professors (2)
   - Staff (mem_type=1): see Professors (2) only
   - Professor (mem_type=2): 403
*/
export async function GET(req: Request) {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const viewer = await prisma.user.findUnique({
    where: { user_id: viewerId },
    include: { member: true },
  });
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const viewerRole = viewer.member?.mem_type ?? 2; // default professor
  if (viewerRole === 2) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const first = url.searchParams.get("first")?.trim() || "";
  const last = url.searchParams.get("last")?.trim() || "";
  const role = url.searchParams.get("role")?.trim() || ""; // "Professor" | "Officer" | ""

  // optional role filter -> mem_type
  let roleMemTypeFilter: number[] | undefined = undefined;
  if (role === "Professor") roleMemTypeFilter = [2];
  else if (role === "Officer") roleMemTypeFilter = [1];

  // enforce viewer scope
  const allowedTypes = viewerRole === 0 ? [1, 2] : [2];

  const users = await prisma.user.findMany({
    where: {
      member: {
        mem_type: {
          in: roleMemTypeFilter ?? allowedTypes,
        },
        ...(first ? { mem_fname: { contains: first, mode: "insensitive" } } : {}),
        ...(last ? { mem_lname: { contains: last, mode: "insensitive" } } : {}),
      },
    },
    include: { member: true },
    orderBy: [{ user_id: "asc" }],
  });

  const result = users.map((u) => {
    const memType = u.member?.mem_type ?? 2;
    const roleLabel = memType === 2 ? "Professor" : memType === 1 ? "Officer" : "Admin";
    return {
      id: u.user_id,
      fname: u.member?.mem_fname ?? "",
      lname: u.member?.mem_lname ?? "",
      email: u.user_email,
      role: roleLabel as "Professor" | "Officer" | "Admin",
    };
  });

  return NextResponse.json(result);
}

/* ========= POST /api/users =========
   Create a new user (Admin-only).
   Body: { fname, lname, email, password, role: "Officer" | "Professor" }
   - Stores password in plain text (per your configuration).
   - Creates Member then User; sets mem_type based on role.
*/
const ROLE_TO_MEMTYPE: Record<string, 1 | 2> = {
  Officer: 1,      // Staff
  Professor: 2,
};

export async function POST(req: Request) {
  const adminId = await getCurrentUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { user_id: adminId },
    include: { member: true },
  });
  if (!admin || (admin.member?.mem_type ?? 2) !== 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const fname = String(body?.fname ?? "").trim();
  const lname = String(body?.lname ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const phone = body?.phone ? String(body.phone).trim() : null; // NEW
  const role = String(body?.role ?? "Officer"); // "Officer" | "Professor"

  if (!fname || !lname || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const memType = role === "Professor" ? 2 : 1;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          mem_fname: fname,
          mem_lname: lname,
          mem_phone: phone ?? "",   // NEW
          mem_type: memType,
        },
      });

      const user = await tx.user.create({
        data: {
          user_email: email,
          user_password: password, // plain text (as requested)
          mem_id: member.mem_id,
        },
        select: { user_id: true, user_email: true },
      });

      return { user, member };
    });

    return NextResponse.json({
      id: created.user.user_id,
      email: created.user.user_email,
      fname,
      lname,
      phone: phone ?? "",
      memType,
    }, { status: 201 });
  } catch (e: any) {
    if (String(e?.message || "").includes("Unique") || String(e?.message || "").includes("unique")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    console.error("Create user failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

