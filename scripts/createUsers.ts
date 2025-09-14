import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt"

async function main() {
    const passwordHashed = await bcrypt.hash("password1234", 10);

    await prisma.user.create({
        data: {
            email: "admin@gmail.com",
            password: passwordHashed,
        },
    });

    console.log("User Created!!");
}

main();