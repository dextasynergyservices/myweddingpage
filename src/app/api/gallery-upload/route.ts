import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// Maximum file sizes (adjust as needed)
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
  "video/3gpp",
  "video/3gpp2",
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("media") as File[];
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!category || !type) {
      return NextResponse.json(
        { error: "Category and type are required" },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    for (const file of files) {
      const isPhoto = type === "PHOTO";
      const supportedTypes = isPhoto
        ? SUPPORTED_IMAGE_TYPES
        : SUPPORTED_VIDEO_TYPES;
      const maxSize = isPhoto ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

      if (!supportedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type: ${file.type}. Supported types: ${supportedTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return NextResponse.json(
          {
            error: `File ${file.name} is too large. Maximum size: ${maxSizeMB}MB`,
          },
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

    // Upload files to Cloudinary and create database records
    const uploadedMedia = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary using promise-based approach
      const uploadResult = await new Promise<{
        secure_url?: string;
        [key: string]: unknown;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: type === "VIDEO" ? "video" : "image",
            public_id: file.name.split(".")[0],
            folder: "wedding-gallery",
            // Optional: Add quality optimization for images
            quality: type === "PHOTO" ? "auto:good" : undefined,
            // Optional: Add format preservation
            format: type === "PHOTO" ? undefined : "mp4", // Convert videos to mp4 for consistency
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(
                result as { secure_url?: string; [key: string]: unknown }
              );
            }
          }
        );

        // Write the buffer to the upload stream
        uploadStream.end(buffer);
      });

      if (!uploadResult || !uploadResult.secure_url) {
        console.error("Cloudinary upload failed for file:", file.name);
        continue;
      }

      // Create database record
      const mediaItem = await prisma.galleryMedia.create({
        data: {
          url: uploadResult.secure_url,
          type: type as "PHOTO" | "VIDEO",
          category: category as "before" | "during" | "after",
          userId: session.user.id,
        },
      });

      uploadedMedia.push(mediaItem);
    }

    return NextResponse.json(uploadedMedia);
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
