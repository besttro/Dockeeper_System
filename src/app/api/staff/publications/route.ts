// app/api/staff/publications/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

/** map int → label */
const STATUS_LABEL: Record<number, "Pending" | "Public" | "Waiting for Edit"> = {
  0: "Pending",
  1: "Public",
  2: "Waiting for Edit",
};

export async function GET() {
  // Optional: require login; optionally check staff/admin role here if you want
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pubs = await prisma.publication.findMany({
      orderBy: { pub_id: "desc" },
      include: {
        participations: {
          where: { part_status: 0 }, // owner only
          include: {
            user: {
              include: {
                member: true,
              },
            },
          },
        },
      },
    });

    const rows = pubs.map((p: any) => {
      const owner = p.participations?.[0];
      const fullName =
        owner?.user?.member
          ? `${owner.user.member.mem_fname} ${owner.user.member.mem_lname}`.trim()
          : owner?.user?.user_email ?? "—";

      return {
        id: p.pub_id,
        name: p.pub_title,
        status: STATUS_LABEL[p.pub_status as 0 | 1 | 2] ?? "Pending",
        professor: fullName,
      };
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/staff/publications error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch publications" },
      { status: 500 }
    );
  }
}
