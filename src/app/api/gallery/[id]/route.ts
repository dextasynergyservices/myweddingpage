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
    console.log("Media URL:", mediaItem.url);

    // For URLs like: https://res.cloudinary.com/cloud/image/upload/v1234567/wedding-gallery/filename.jpg
    // We need to extract: wedding-gallery/filename (without extension)
    let publicId = "";

    if (mediaItem.url.includes("/upload/")) {
      const afterUpload = mediaItem.url.split("/upload/")[1];
      const parts = afterUpload.split("/");
      // Skip version if present (starts with 'v' followed by numbers)
      const startIndex = parts[0].match(/^v\d+$/) ? 1 : 0;
      const pathParts = parts.slice(startIndex);
      // Remove file extension from the last part
      const lastPart = pathParts[pathParts.length - 1];
      pathParts[pathParts.length - 1] = lastPart.split(".")[0];
      publicId = pathParts.join("/");
    } else {
      // Fallback to old method
      const urlParts = mediaItem.url.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      publicId = publicIdWithExtension.split(".")[0];
    }

    console.log("Extracted public ID:", publicId);

    // Delete from Cloudinary
    if (publicId) {
      try {
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
          resource_type: mediaItem.type === "VIDEO" ? "video" : "image",
          invalidate: true,
        });
        console.log("Cloudinary delete result:", cloudinaryResult);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete failed:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.galleryMedia.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
