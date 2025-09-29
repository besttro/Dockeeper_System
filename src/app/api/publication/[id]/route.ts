// src/app/api/publication/[id]/route.ts

import { NextResponse } from "next/server";
// import path from "node:path";
// import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const STATUS_LABEL = { 0: "Pending", 1: "Public", 2: "Waiting for Edit" } as const;
const STATUS_VALUE = { Pending: 0, Public: 1, "Waiting for Edit": 2 } as const;

function splitName(input: string): { fname: string; lname: string } | null {
  if (!input) return null;
  const normalized = input.replace(/_/g, " ").trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ");
  if (parts.length < 2) return null;
  const lname = parts.pop() as string;
  const fname = parts.join(" ");
  return { fname, lname };
}

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

  const ownerParticipation = pub.participations.find((p: any) => p.part_status === 0 && p.user);
  const ownerEmail = ownerParticipation?.user?.user_email ?? null;

  const firstFile = pub.files[0] ?? null;

  return NextResponse.json({
    id: pub.pub_id,
    title: pub.pub_title,
    description: (pub as any).pub_description ?? "",
    year: pub.pub_year,
    type: pub.pub_type,
    status: STATUS_LABEL[pub.pub_status as 0 | 1 | 2] ?? "Pending",
    authors,
    ownerEmail,
    fileUrl: firstFile?.file_url ?? null,
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const ctype = req.headers.get("content-type") || "";

  // --------- CASE A: JSON body → staff/admin status update ----------
  if (ctype.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const newStatus = String(body?.status);
    if (!(newStatus in STATUS_VALUE)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    // you may add role checks here if needed
    const updated = await prisma.publication.update({
      where: { pub_id: id },
      data: { pub_status: STATUS_VALUE[newStatus as keyof typeof STATUS_VALUE] },
      select: { pub_id: true },
    });
    return NextResponse.json({ id: updated.pub_id, status: newStatus });
  }

  // --------- CASE B: multipart/form-data → author edits ----------
  if (ctype.includes("multipart/form-data")) {
    // ensure owner
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
    });

    const owner = await prisma.participation.findFirst({
      where: { pub_id: id, user_id: uid, part_status: 0 },
      select: { part_id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();
    const pub_title = String(form.get("pub_title") ?? "");
    const pub_description = String(form.get("pub_description") ?? "");
    const pub_year = Number(form.get("pub_year") ?? NaN);
    const pub_type = Number(form.get("pub_type") ?? NaN);

    if (!pub_title.trim()) return NextResponse.json({ error: "pub_title is required" }, { status: 400 });
    if (!pub_description.trim()) return NextResponse.json({ error: "pub_description is required" }, { status: 400 });
    if (!Number.isInteger(pub_year)) return NextResponse.json({ error: "pub_year must be an integer" }, { status: 400 });
    if (!Number.isInteger(pub_type)) return NextResponse.json({ error: "pub_type must be an integer" }, { status: 400 });

    const coAuthorsRaw = form.getAll("co_authors[]").map(String);

    // optional new file
    const file = form.get("file") as unknown as File | null;
    let newFileRecord = null;
    if (file) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      // 1) update publication fields
      const publication = await tx.publication.update({
        where: { pub_id: id },
        data: { pub_title, pub_description, pub_year, pub_type },
      });

      // 2) replace co-author participations (keep owner)
      await tx.participation.deleteMany({
        where: { pub_id: id, part_status: 1 },
      });

      for (const raw of coAuthorsRaw) {
        const name = splitName(raw);
        if (!name) continue;

        const member = await tx.member.findFirst({
          where: {
            mem_fname: { equals: name.fname, mode: "insensitive" },
            mem_lname: { equals: name.lname, mode: "insensitive" },
          },
        });

        if (member) {
          const u = await tx.user.findFirst({ where: { mem_id: member.mem_id } });
          if (u) {
            await tx.participation.create({
              data: { pub_id: id, user_id: u.user_id, co_name: null, part_status: 1 },
            });
            continue;
          }
        }

        await tx.participation.create({
          data: { pub_id: id, user_id: null, co_name: `${name.fname}_${name.lname}`, part_status: 1 },
        });
      }

      // 3) optional file replacement
      if (file) {
        const ab = await file.arrayBuffer();
        const buf = Buffer.from(ab);
        const checksum = crypto.createHash("sha256").update(buf).digest("hex");
        
        // สร้างชื่อไฟล์ที่สะอาดเหมือนใน POST route
        const sanitizedTitle = pub_title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 50);

        const fileName = `${uid}/${sanitizedTitle}-${pub_year}.pdf`;
        
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: fileName,
          Body: buf,
          ContentType: file.type,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // (Optional but recommended) ลบไฟล์เก่าออกจาก DB ก่อนเพิ่มไฟล์ใหม่
        await tx.file.deleteMany({ where: { pub_id: id } });

        newFileRecord = await tx.file.create({
          data: {
            file_name: file.name,
            file_url: fileUrl,
            file_mime: file.type,
            file_ext: "pdf",
            file_size: buf.byteLength,
            checksum,
            user_id: uid,
            pub_id: id,
            kind: "PDF",
          },
        });
        // --- END: แทนที่โค้ด fs ด้วย S3 ---
      }

      return publication;
    });

    return NextResponse.json({ id: updated.pub_id, ok: true, newFile: !!newFileRecord });
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // only owner can delete (adjust if staff/admin should too)
  const owner = await prisma.participation.findFirst({
    where: { pub_id: id, user_id: uid, part_status: 0 },
    select: { part_id: true },
  });
  if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
  });

  // collect files to remove from disk
  const files = await prisma.file.findMany({
    where: { pub_id: id },
    select: { file_url: true },
  });

  await prisma.$transaction(async (tx: any) => {
    await tx.file.deleteMany({ where: { pub_id: id } });
    await tx.participation.deleteMany({ where: { pub_id: id } });
    await tx.publication.delete({ where: { pub_id: id } });
  });

  // best-effort remove files from /public
  for (const f of files) {
    if (!f.file_url) continue;
    // file_url like /uploads/xxx.pdf
    try {
      // ดึง Key (path/to/file.pdf) ออกมาจาก URL เต็ม
      const url = new URL(f.file_url);
      const key = url.pathname.substring(1); // ลบ "/" ตัวแรกออก

      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      };
      
      await s3Client.send(new DeleteObjectCommand(deleteParams));

    } catch (error) {
      console.error(`Failed to delete file from S3: ${f.file_url}`, error);
    }
  }

  return NextResponse.json({ ok: true });
}