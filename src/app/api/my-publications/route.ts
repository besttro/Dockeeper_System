// app/api/my-publications/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

function statusLabel(n: number) {
  return n === 1 ? "Public" : n === 2 ? "Waiting for Edit" : "Pending";
}

export async function GET() {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pubs = await prisma.publication.findMany({
    where: { participations: { some: { user_id: uid, part_status: 0 } } },
    orderBy: { pub_id: "desc" },
    select: { pub_id: true, pub_title: true, pub_status: true, pub_year: true },
  });

  const result = pubs.map((p) => ({
    id: p.pub_id,
    name: p.pub_title,
    status: statusLabel(p.pub_status) as "Public" | "Pending" | "Waiting for Edit",
    year: p.pub_year,
  }));

  return NextResponse.json(result);
}

