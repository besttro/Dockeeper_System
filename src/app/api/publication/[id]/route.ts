// src/app/api/publication/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

const STATUS_LABEL = { 0: "Pending", 1: "Public", 2: "Waiting for Edit" } as const;
const STATUS_VALUE = { Pending: 0, Public: 1, "Waiting for Edit": 2 } as const;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const pub = await prisma.publication.findUnique({
    where: { pub_id: id },
    include: {
      participations: { include: { user: { include: { member: true } } } },
      files: true,
    },
  });
  if (!pub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const authors =
    pub.participations
      .map((p: any) =>
        p.user?.member
          ? `${p.user.member.mem_fname ?? ""} ${p.user.member.mem_lname ?? ""}`.trim()
          : p.co_name ?? null
      )
      .filter(Boolean) as string[];

  const firstFile = pub.files[0] ?? null;

  return NextResponse.json({
    id: pub.pub_id,
    title: pub.pub_title,
    description: (pub as any).pub_description ?? "",
    year: pub.pub_year,
    type: pub.pub_type,
    status: STATUS_LABEL[pub.pub_status as 0 | 1 | 2] ?? "Pending",
    authors,
    fileUrl: firstFile?.file_url ?? null,
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const newStatus = String(body?.status);
  if (!(newStatus in STATUS_VALUE)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.publication.update({
    where: { pub_id: id },
    data: { pub_status: STATUS_VALUE[newStatus as keyof typeof STATUS_VALUE] },
    select: { pub_id: true },
  });

  return NextResponse.json({ id: updated.pub_id, status: newStatus });
}



