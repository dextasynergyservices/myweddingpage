import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { files, category, type } = await request.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!category || !type) {
      return NextResponse.json(
        { error: "Category and type are required" },
        { status: 400 }
      );
    }

    // Validate that all files have the required Cloudinary response data
    for (const file of files) {
      if (!file.secure_url || !file.public_id) {
        return NextResponse.json(
          { error: "Invalid file data - missing secure_url or public_id" },
          { status: 400 }
        );
      }
    }

    // Check user's upload limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json(
        { error: "User plan not found" },
        { status: 400 }
      );
    }

    // Count existing media
    const existingPhotos = await prisma.galleryMedia.count({
      where: {
        userId: session.user.id,
        type: "PHOTO",
      },
    });

    const existingVideos = await prisma.galleryMedia.count({
      where: {
        userId: session.user.id,
        type: "VIDEO",
      },
    });

    // Check if upload would exceed limits
    const newPhotos = type === "PHOTO" ? files.length : 0;
    const newVideos = type === "VIDEO" ? files.length : 0;

    if (existingPhotos + newPhotos > user.plan.max_photos) {
      return NextResponse.json(
        { error: "Photo upload limit exceeded" },
        { status: 400 }
      );
    }

    if (existingVideos + newVideos > user.plan.max_videos) {
      return NextResponse.json(
        { error: "Video upload limit exceeded" },
        { status: 400 }
      );
    }

    // Create database records for the uploaded files
    const savedMedia = [];

    for (const file of files) {
      const mediaItem = await prisma.galleryMedia.create({
        data: {
          url: file.secure_url,
          type: type as "PHOTO" | "VIDEO",
          category: category as "before" | "during" | "after",
          userId: session.user.id,
        },
      });

      savedMedia.push(mediaItem);
    }

    return NextResponse.json(savedMedia);
  } catch (error) {
    console.error("Error saving media metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
