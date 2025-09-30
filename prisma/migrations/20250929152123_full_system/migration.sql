-- CreateEnum
CREATE TYPE "public"."FileKind" AS ENUM ('PDF', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "mem_id" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Publication" (
    "pub_id" SERIAL NOT NULL,
    "pub_title" TEXT NOT NULL,
    "pub_description" TEXT NOT NULL,
    "pub_year" INTEGER NOT NULL,
    "pub_status" INTEGER NOT NULL,
    "pub_type" INTEGER NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("pub_id")
);

-- CreateTable
CREATE TABLE "public"."Participation" (
    "part_id" SERIAL NOT NULL,
    "pub_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "co_name" TEXT,
    "part_status" INTEGER NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("part_id")
);

-- CreateTable
CREATE TABLE "public"."Member" (
    "mem_id" SERIAL NOT NULL,
    "mem_fname" TEXT NOT NULL,
    "mem_lname" TEXT NOT NULL,
    "mem_phone" TEXT NOT NULL,
    "mem_type" INTEGER NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("mem_id")
);

-- CreateTable
CREATE TABLE "public"."Manage" (
    "manage_id" SERIAL NOT NULL,
    "manage_detail" TEXT NOT NULL,
    "manage_date" TIMESTAMP(3) NOT NULL,
    "manage_type" INTEGER NOT NULL,
    "pub_id" INTEGER NOT NULL,

    CONSTRAINT "Manage_pkey" PRIMARY KEY ("manage_id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "file_id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_mime" TEXT NOT NULL DEFAULT 'application/pdf',
    "file_ext" TEXT NOT NULL DEFAULT 'pdf',
    "file_size" INTEGER NOT NULL,
    "checksum" TEXT,
    "kind" "public"."FileKind" NOT NULL DEFAULT 'PDF',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "pub_id" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "public"."Record" (
    "record_id" SERIAL NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "public"."User"("user_email");

-- CreateIndex
CREATE INDEX "Participation_user_id_idx" ON "public"."Participation"("user_id");

-- CreateIndex
CREATE INDEX "Participation_pub_id_idx" ON "public"."Participation"("pub_id");

-- CreateIndex
CREATE UNIQUE INDEX "File_checksum_key" ON "public"."File"("checksum");

-- CreateIndex
CREATE INDEX "File_pub_id_uploaded_at_idx" ON "public"."File"("pub_id", "uploaded_at");

-- CreateIndex
CREATE INDEX "File_user_id_uploaded_at_idx" ON "public"."File"("user_id", "uploaded_at");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_created_at_idx" ON "public"."AuditLog"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_mem_id_fkey" FOREIGN KEY ("mem_id") REFERENCES "public"."Member"("mem_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participation" ADD CONSTRAINT "Participation_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "public"."Publication"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participation" ADD CONSTRAINT "Participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Manage" ADD CONSTRAINT "Manage_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "public"."Publication"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "public"."Publication"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
