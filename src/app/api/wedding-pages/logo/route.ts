import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logoUrl, logoAlt } = await request.json();

    if (!logoUrl) {
      return NextResponse.json({ error: "Logo URL is required" }, { status: 400 });
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

    // Update the wedding page with the logo URL
    await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        logo_url: logoUrl,
        logo_alt: logoAlt || "Wedding Logo",
      },
    });

    return NextResponse.json({
      success: true,
      logoUrl: logoUrl,
      message: "Logo saved successfully",
    });
  } catch (error) {
    console.error("Error saving logo:", error);
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

    // Remove logo from the wedding page
    await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        logo_url: null,
        logo_alt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Logo removed successfully",
    });
  } catch (error) {
    console.error("Error removing logo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
