import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    // Create a properly typed where clause
    const whereClause: {
      userId: string;
      category?: "before" | "during" | "after";
      type?: "PHOTO" | "VIDEO";
    } = {
      userId: session.user.id,
    };

    if (category && category !== "all") {
      whereClause.category = category as "before" | "during" | "after";
    }

    if (type && type !== "all") {
      whereClause.type = type as "PHOTO" | "VIDEO";
    }

    const media = await prisma.galleryMedia.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching gallery media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
