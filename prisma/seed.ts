import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Order is important due to foreign key constraints!
  // 1. Member
  // 2. User (depends on Member)
  // 3. Publication
  // 4. Participation (depends on User, Publication)
  // 5. File (depends on User, Publication)

  console.log("Seeding Members...");
  await prisma.member.createMany({
    data: [
      {
        mem_id: 1,
        mem_fname: "Admin",
        mem_lname: "Dockeeper",
        mem_phone: "0000000000",
        mem_type: 0,
      },
      {
        mem_id: 2,
        mem_fname: "Jane",
        mem_lname: "Officer",
        mem_phone: "0111111111",
        mem_type: 1,
      },
      {
        mem_id: 3,
        mem_fname: "Somsak",
        mem_lname: "Jaidee",
        mem_phone: "0812345678",
        mem_type: 2,
      },
      {
        mem_id: 4,
        mem_fname: "Malee",
        mem_lname: "Meedee",
        mem_phone: "0898765432",
        mem_type: 2,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding Users...");
  await prisma.user.createMany({
    data: [
      {
        user_id: 1,
        user_email: "admin@dockeeper.com",
        user_password: "admindockeeper2025",
        mem_id: 1,
      },
      {
        user_id: 2,
        user_email: "officer@dockeeper.com",
        user_password: "officerpassword",
        mem_id: 2,
      },
      {
        user_id: 3,
        user_email: "somsak.j@psu.ac.th",
        user_password: "prof1password",
        mem_id: 3,
      },
      {
        user_id: 4,
        user_email: "malee.m@psu.ac.th",
        user_password: "prof2password",
        mem_id: 4,
      },
    ],
    skipDuplicates: true,
  });
  // ⚠️ Important: Passwords are in plain text. For a real app, they should be hashed!

  console.log("Seeding Publications...");
  await prisma.publication.createMany({
    data: [
      {
        pub_id: 1,
        pub_title: "A Publication",
        pub_description: "A Publication Description",
        pub_year: 2025,
        pub_status: 0,
        pub_type: 0,
      },
      {
        pub_id: 2,
        pub_title: "B Publication",
        pub_description: "B Publication Description",
        pub_year: 2024,
        pub_status: 1,
        pub_type: 1,
      },
      {
        pub_id: 3,
        pub_title: "C Publication",
        pub_description: "C Publication Description",
        pub_year: 2023,
        pub_status: 2,
        pub_type: 1,
      },
      {
        pub_id: 4,
        pub_title: "D Publication",
        pub_description: "D Publication Description",
        pub_year: 2023,
        pub_status: 1,
        pub_type: 0,
      },
      {
        pub_id: 5,
        pub_title: "E Publication",
        pub_description: "E Publication Description",
        pub_year: 2025,
        pub_status: 1,
        pub_type: 0,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding Participations...");
  await prisma.participation.createMany({
    data: [
      { part_id: 1, pub_id: 1, user_id: 3, co_name: null, part_status: 0 },
      { part_id: 2, pub_id: 1, user_id: 4, co_name: null, part_status: 1 },
      {
        part_id: 3,
        pub_id: 1,
        user_id: null,
        co_name: "Somchai_Jaidee",
        part_status: 1,
      },
      { part_id: 4, pub_id: 2, user_id: 3, co_name: null, part_status: 0 },
      { part_id: 5, pub_id: 3, user_id: 3, co_name: null, part_status: 0 },
      { part_id: 6, pub_id: 4, user_id: 4, co_name: null, part_status: 0 },
      { part_id: 7, pub_id: 4, user_id: 3, co_name: null, part_status: 1 },
      { part_id: 8, pub_id: 5, user_id: 4, co_name: null, part_status: 0 },
      {
        part_id: 9,
        pub_id: 5,
        user_id: null,
        co_name: "Jindapol_Kohkarnue",
        part_status: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding Files...");
  await prisma.file.createMany({
    data: [
      {
        file_id: 1,
        file_name: "A.pdf",
        file_url:
          "https://test-dockeeper-bucket.s3.us-west-2.amazonaws.com/3/a-publication-2025.pdf",
        file_mime: "application/pdf",
        file_ext: "pdf",
        file_size: 15898,
        checksum:
          "2d9c15052fe10e378b7b7e87d2405eaf9e794c4e9172dba67db2f760aaa65cf9",
        kind: "PDF",
        uploaded_at: new Date("2025-09-30T15:03:20.351Z"),
        user_id: 3,
        pub_id: 1,
      },
      {
        file_id: 2,
        file_name: "B.pdf",
        file_url:
          "https://test-dockeeper-bucket.s3.us-west-2.amazonaws.com/3/b-publication-2024.pdf",
        file_mime: "application/pdf",
        file_ext: "pdf",
        file_size: 16015,
        checksum:
          "7e3dc52659fa807e0a0c592ed57ef20f0bd6af3fb3d64ef76a8f32c20a4c5ea8",
        kind: "PDF",
        uploaded_at: new Date("2025-09-30T15:03:50.671Z"),
        user_id: 3,
        pub_id: 2,
      },
      {
        file_id: 3,
        file_name: "C.pdf",
        file_url:
          "https://test-dockeeper-bucket.s3.us-west-2.amazonaws.com/3/c-publication-2023.pdf",
        file_mime: "application/pdf",
        file_ext: "pdf",
        file_size: 16024,
        checksum:
          "1edb720f4cb9d441d38190e3aa6da22484eac1b6e80b1857c72a35a509c0fd4e",
        kind: "PDF",
        uploaded_at: new Date("2025-09-30T15:04:22.933Z"),
        user_id: 3,
        pub_id: 3,
      },
      {
        file_id: 4,
        file_name: "D.pdf",
        file_url:
          "https://test-dockeeper-bucket.s3.us-west-2.amazonaws.com/4/d-publication-2023.pdf",
        file_mime: "application/pdf",
        file_ext: "pdf",
        file_size: 15993,
        checksum:
          "afc76673725fc77503214b86680b80560da597f430353653f554b3ef3949aec2",
        kind: "PDF",
        uploaded_at: new Date("2025-09-30T15:09:15.594Z"),
        user_id: 4,
        pub_id: 4,
      },
      {
        file_id: 5,
        file_name: "E.pdf",
        file_url:
          "https://test-dockeeper-bucket.s3.us-west-2.amazonaws.com/4/e-publication-2025.pdf",
        file_mime: "application/pdf",
        file_ext: "pdf",
        file_size: 15958,
        checksum:
          "c35de91334e11998619e7a3c16948d92459933efd4856cd3541a7d386eb06483",
        kind: "PDF",
        uploaded_at: new Date("2025-09-30T15:09:45.483Z"),
        user_id: 4,
        pub_id: 5,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`\nSeeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });