import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const publications = await prisma.publication.findMany({
      include: {
        participations: {
          include: {
            user: true, // <-- This will pull user_email from User
          },
        },
      },
    });

    // Debug log: see actual data Prisma is returning
    console.log("PUBLICATIONS RAW:", JSON.stringify(publications, null, 2));

    const result = publications.map((pub) => {
      const authors =
        pub.participations
          ?.map((p) => p.user?.user_email)
          .filter((email): email is string => Boolean(email)) || [];

      return {
        id: pub.pub_id,
        title: pub.pub_title,
        authors: authors.length > 0 ? authors.join(", ") : "Unknown Author",
        date: pub.pub_year.toString(),
        summary: "This is a demo summary for testing API data.",
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch publications" },
      { status: 500 }
    );
  }
}


