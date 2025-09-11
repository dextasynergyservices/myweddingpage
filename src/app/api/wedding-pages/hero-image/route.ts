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

    const { heroImage } = await request.json();

    if (!heroImage) {
      return NextResponse.json({ error: "Hero image URL is required" }, { status: 400 });
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

    // Update the wedding page with the hero image
    const updatedWeddingPage = await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        hero_image: heroImage,
      },
    });

    return NextResponse.json({
      success: true,
      heroImage: updatedWeddingPage.hero_image,
    });
  } catch (error) {
    console.error("Error saving hero image:", error);
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

    // Remove the hero image
    const updatedWeddingPage = await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        hero_image: null,
      },
    });

    return NextResponse.json({
      success: true,
      heroImage: updatedWeddingPage.hero_image,
    });
  } catch (error) {
    console.error("Error removing hero image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
