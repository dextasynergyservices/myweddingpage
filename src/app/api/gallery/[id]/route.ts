import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find the media item
    const mediaItem = await prisma.galleryMedia.findUnique({
      where: { id },
    });

    if (!mediaItem) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check if the user owns this media item
    if (mediaItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract public ID from Cloudinary URL
    const urlParts = mediaItem.url.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];

    // Delete from Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: mediaItem.type === "VIDEO" ? "video" : "image",
        invalidate: true,
      });
    }

    // Delete from database
    await prisma.galleryMedia.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
