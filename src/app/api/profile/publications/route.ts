// app/api/profile/publications/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // part_status = 0 => owner/author
    // pub_status   = 1 => public
    const pubs = await prisma.publication.findMany({
      where: {
        pub_status: 1,
        participations: {
          some: { user_id: uid, part_status: 0 },
        },
      },
      orderBy: { pub_id: "desc" },
      include: {
        participations: {
          include: { user: true },
        },
      },
    });

    const typeMap: Record<number, "journal" | "international"> = { 0: "journal", 1: "international" };

    const result = pubs.map((p: any) => {
      const authors =
        p.participations
          .map((pa: any) => pa.user?.user_email)
          .filter((x: any): x is string => Boolean(x)) ?? [];
      const desc = p.pub_description ?? "";
      const summary = desc.length > 160 ? `${desc.slice(0, 160)}…` : (desc || "—");

      return {
        id: p.pub_id,
        title: p.pub_title,
        authors: authors.length ? authors.join(", ") : "Unknown Author",
        year: p.pub_year,
        summary,
        type: typeMap[p.pub_type] ?? "unknown",
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/profile/publications error:", e);
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
