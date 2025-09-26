// src/app/api/publication/route.ts

import { NextResponse } from "next/server";
// import path from "node:path";
// import fs from "node:fs/promises";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function splitName(input: string): { fname: string; lname: string } | null {
  if (!input) return null;
  const normalized = input.replace(/_/g, " ").trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ");
  if (parts.length < 2) return null;
  const lname = parts.pop() as string;
  const fname = parts.join(" ");
  return { fname, lname };
}

export async function GET() {
  try {
    const publications = await prisma.publication.findMany({
      where: { pub_status: 1 }, // ← only Public
      orderBy: { pub_id: "desc" },
      include: { participations: { include: { user: true } } },
    });

    const typeMap: Record<number, "journal" | "international"> = {
      0: "journal",
      1: "international",
    };

    const result = publications.map((pub: any) => {
      const authors =
        pub.participations
          ?.map((p: any) => p.user?.user_email)
          .filter((e: any): e is string => Boolean(e)) ?? [];

      const desc = pub.pub_description ?? "";
      const summary =
        desc.length > 160 ? `${desc.slice(0, 160)}…` : desc || "—";

      const type = typeMap[pub.pub_type as number] ?? "unknown";

      return {
        id: pub.pub_id,
        title: pub.pub_title,
        authors: authors.length ? authors.join(", ") : "Unknown Author",
        date: String(pub.pub_year),
        summary,
        type,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/publication error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const uid = await getCurrentUserId();
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- 1. การสร้าง S3 Client แบบไดนามิก ---
  // ตรวจสอบว่าเราอยู่ในโหมด Local (มี S3_ENDPOINT) หรือไม่
  const isDevelopment = !!process.env.S3_ENDPOINT;

  // ตั้งค่าพื้นฐานสำหรับ S3 Client
  const s3Config: {
    region: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    credentials?: { accessKeyId: string; secretAccessKey: string; };
  } = {
    region: process.env.AWS_REGION!,
  };

  // ถ้าเป็น Local (MinIO) ให้กำหนดค่า endpoint และ credentials จาก .env
  if (isDevelopment) {
    s3Config.endpoint = process.env.S3_ENDPOINT!;
    s3Config.forcePathStyle = true;
    s3Config.credentials = {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    };
  }
  // ถ้าเป็น Production บน AWS, SDK จะใช้ IAM Role ที่ผูกกับ ECS Task โดยอัตโนมัติ
  // จึงไม่จำเป็นต้องใส่ credentials ในโค้ด

  const s3Client = new S3Client(s3Config);

  try {
    const form = await req.formData();

    const pub_title = String(form.get("pub_title") ?? "");
    const pub_description = String(form.get("pub_description") ?? "");
    const pub_year = Number(form.get("pub_year") ?? NaN);
    const pub_type = Number(form.get("pub_type") ?? NaN);
    const pub_status = Number(form.get("pub_status") ?? 0);

    if (!pub_title.trim())
      return NextResponse.json(
        { error: "pub_title is required" },
        { status: 400 }
      );
    if (!pub_description.trim())
      return NextResponse.json(
        { error: "pub_description is required" },
        { status: 400 }
      );
    if (!Number.isInteger(pub_year))
      return NextResponse.json(
        { error: "pub_year must be an integer" },
        { status: 400 }
      );
    if (!Number.isInteger(pub_type))
      return NextResponse.json(
        { error: "pub_type must be an integer" },
        { status: 400 }
      );

    const coAuthorsRaw = form.getAll("co_authors[]").map(String);

    const file = form.get("file") as unknown as File | null;
    if (!file)
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 }
      );
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Save file to /public/uploads
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const checksum = crypto.createHash("sha256").update(buf).digest("hex");
    const sanitizedTitle = pub_title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // ลบอักขระพิเศษ ยกเว้นตัวอักษร, ตัวเลข, เว้นวรรค, ขีด
      .replace(/\s+/g, "-") // แทนที่เว้นวรรคด้วยขีด
      .slice(0, 50); // จำกัดความยาวเพื่อไม่ให้ชื่อไฟล์ยาวเกินไป

    // 2. สร้าง path และชื่อไฟล์ใหม่: user_id/sanitized-title-year.pdf
    const fileName = `${uid}/${sanitizedTitle}-${pub_year}.pdf`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName, // <-- ใช้ fileName ที่สร้างขึ้นใหม่
      Body: buf,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // --- 4. สร้าง URL ของไฟล์บน S3 ---
    let fileUrl: string;
    if (isDevelopment) {
      // สร้าง URL สำหรับ Local (MinIO)
      // ผลลัพธ์: http://localhost:9000/my-local-bucket/path/to/file.pdf (เมื่อเข้าจากภายนอก)
      fileUrl = `${process.env.S3_ENDPOINT!.replace('minio:9000', 'localhost:9000')}/${process.env.S3_BUCKET_NAME}/${fileName}`;
    } else {
      // สร้าง URL สำหรับ Production (AWS S3)
      // ผลลัพธ์: https://bucket-name.s3.region.amazonaws.com/path/to/file.pdf
      fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }
    // const uploadsDir = path.join(process.cwd(), "public", "uploads");
    // await fs.mkdir(uploadsDir, { recursive: true });
    // const fileName = `${checksum}.pdf`;
    // const filePath = path.join(uploadsDir, fileName);
    // await fs.writeFile(filePath, buf);
    // const fileUrl = `/uploads/${fileName}`;

    const created = await prisma.$transaction(async (tx: any) => {
      // 1) Publication
      const publication = await tx.publication.create({
        data: {
          pub_title,
          pub_description,
          pub_year,
          pub_type,
          pub_status,
        },
      });

      // 2) Main author participation (owner)
      await tx.participation.create({
        data: {
          pub_id: publication.pub_id,
          user_id: uid,
          co_name: null,
          part_status: 0,
        },
      });

      // 3) Co-authors
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
          const u = await tx.user.findFirst({
            where: { mem_id: member.mem_id },
          });
          if (u) {
            await tx.participation.create({
              data: {
                pub_id: publication.pub_id,
                user_id: u.user_id,
                co_name: null,
                part_status: 1,
              },
            });
            continue;
          }
        }

        await tx.participation.create({
          data: {
            pub_id: publication.pub_id,
            user_id: null,
            co_name: `${name.fname}_${name.lname}`,
            part_status: 1,
          },
        });
      }

      // 4) File row
      await tx.file.create({
        data: {
          file_name: file.name,
          file_url: fileUrl,
          file_mime: file.type,
          file_ext: "pdf",
          file_size: buf.byteLength,
          checksum,
          user_id: uid,
          pub_id: publication.pub_id,
          kind: "PDF",
        },
      });

      return publication;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Create publication failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}