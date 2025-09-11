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

    const { storyImage } = await request.json();

    if (!storyImage) {
      return NextResponse.json({ error: "Story image URL is required" }, { status: 400 });
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
