import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json({ error: "User plan not found" }, { status: 400 });
    }

    const photoCount = await prisma.galleryMedia.count({
      where: {
        userId: session.user.id,
        type: "PHOTO",
      },
    });

    const videoCount = await prisma.galleryMedia.count({
      where: {
        userId: session.user.id,
        type: "VIDEO",
      },
    });

    return NextResponse.json({
      currentCount: {
        photos: photoCount,
        videos: videoCount,
      },
      maxLimits: {
        photos: user.plan.max_photos,
        videos: user.plan.max_videos,
      },
    });
  } catch (error) {
    console.error("Error fetching user limits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
