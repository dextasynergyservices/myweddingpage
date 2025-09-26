import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

/**
 * Validate that the URL is from our Cloudinary domain or a trusted source
 */
function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Allow Cloudinary URLs from our cloud
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudinaryCloudName && urlObj.hostname === `res.cloudinary.com`) {
      return urlObj.pathname.startsWith(`/${cloudinaryCloudName}/`);
    }

    // Allow other trusted domains (add more as needed)
    const trustedDomains = [
      "images.unsplash.com",
      "images.pexels.com",
      "via.placeholder.com",
      "placehold.co",
    ];

    return trustedDomains.includes(urlObj.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyImage } = await request.json();

    if (!storyImage) {
      return NextResponse.json({ error: "Story image URL is required" }, { status: 400 });
    }

    // Validate the image URL
    if (!validateImageUrl(storyImage)) {
      return NextResponse.json(
        {
          error:
            "Invalid image URL. Please use images from trusted sources or upload through our system.",
        },
        { status: 400 }
      );
    }

    // Get the user's wedding page
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { weddingPages: true },
    });

    if (!user || !user.weddingPages.length) {
      return NextResponse.json({ error: "No wedding page found" }, { status: 404 });
    }

    const weddingPage = user.weddingPages[0];

    // Update the wedding page with the story image
    const updatedWeddingPage = await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        story_image: storyImage,
      },
    });

    console.log("Story image updated:", {
      userId: session.user.id,
      weddingPageId: weddingPage.id,
      storyImage,
    });

    return NextResponse.json({
      success: true,
      storyImage: updatedWeddingPage.story_image,
    });
  } catch (error) {
    console.error("Error saving story image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's wedding page
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { weddingPages: true },
    });

    if (!user || !user.weddingPages.length) {
      return NextResponse.json({ error: "No wedding page found" }, { status: 404 });
    }

    const weddingPage = user.weddingPages[0];

    // Remove the story image
    const updatedWeddingPage = await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        story_image: null,
      },
    });

    return NextResponse.json({
      success: true,
      storyImage: updatedWeddingPage.story_image,
    });
  } catch (error) {
    console.error("Error removing story image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
