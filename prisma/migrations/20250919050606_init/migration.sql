-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    "user_username" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "mem_id" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Publication" (
    "pub_id" SERIAL NOT NULL,
    "pub_title" TEXT NOT NULL,
    "pub_year" INTEGER NOT NULL,
    "pub_status" INTEGER NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("pub_id")
);

-- CreateTable
CREATE TABLE "public"."Participation" (
    "part_id" SERIAL NOT NULL,
    "pub_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "part_status" INTEGER NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("part_id")
);

-- CreateTable
CREATE TABLE "public"."Member" (
    "mem_id" SERIAL NOT NULL,
    "mem_fname" TEXT NOT NULL,
    "mem_lname" TEXT NOT NULL,
    "mem_phone" TEXT NOT NULL,
    "mem_email" TEXT NOT NULL,
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
    "file_attach" TEXT NOT NULL,
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

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_mem_id_fkey" FOREIGN KEY ("mem_id") REFERENCES "public"."Member"("mem_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participation" ADD CONSTRAINT "Participation_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "public"."Publication"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participation" ADD CONSTRAINT "Participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Manage" ADD CONSTRAINT "Manage_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "public"."Publication"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "public"."Publication"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
