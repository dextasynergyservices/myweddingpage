import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGO API CALLED ===");
    const session = await getServerSession(authOptions);
    console.log("Logo API - Session:", session);
    console.log("Logo API - User ID:", session?.user?.id);
    console.log("Logo API - User Email:", session?.user?.email);

    if (!session || !session.user.id) {
      console.log("Logo API - No session or user ID found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logoUrl, logoAlt } = await request.json();
    console.log("Logo API - Request body:", { logoUrl, logoAlt });

    if (!logoUrl) {
      console.log("Logo API - No logo URL provided, returning 400");
      return NextResponse.json({ error: "Logo URL is required" }, { status: 400 });
    }

    // Get the user's wedding page
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { weddingPages: true },
    });

    console.log("Logo API - User found:", !!user);
    console.log("Logo API - User wedding pages:", user?.weddingPages?.length || 0);

    if (!user || !user.weddingPages.length) {
      console.log("Logo API - No user or wedding pages found, returning 404");
      return NextResponse.json({ error: "No wedding page found" }, { status: 404 });
    }

    const weddingPage = user.weddingPages[0];
    console.log("Logo API - Wedding page ID:", weddingPage.id);

    // Update the wedding page with the logo URL
    const updateData = {
      logo_url: logoUrl,
      logo_alt: logoAlt || "Wedding Logo",
    };
    console.log("Logo API - Updating wedding page with data:", updateData);

    const updatedWeddingPage = await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: updateData,
    });

    console.log("Logo API - Wedding page updated successfully:", updatedWeddingPage);

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
