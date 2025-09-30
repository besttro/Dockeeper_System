import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // หมายเหตุ: mem_type: 1 คือสมมติว่าเป็น admin
  // Upsert จะสร้างข้อมูลถ้ายังไม่มี หรือไม่ทำอะไรเลยถ้ามีอยู่แล้ว (ป้องกันการสร้างซ้ำ)
  const adminMember = await prisma.member.upsert({
    where: { mem_id: 1 }, // ใช้ ID ที่คาดเดาได้ง่ายสำหรับ admin
    update: {},
    create: {
      mem_id: 1,
      mem_fname: 'Admin',
      mem_lname: 'Dockeeper',
      mem_phone: '0000000000',
      mem_type: 0, // 0 = Admin
    },
  })
  // console.log('Upserted Member:', adminMember);

  const adminUser = await prisma.user.upsert({
    where: { user_email: 'admin@dockeeper.com' },
    update: {},
    create: {
      user_email: 'admin@dockeeper.com',
      user_password: 'admindockeeper2025',
      mem_id: adminMember.mem_id,
    },
  })
  // console.log('Upserted User:', adminUser);

  console.log(`Created/Verified admin user: ${adminUser.user_email}`)
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
