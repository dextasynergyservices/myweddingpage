import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

/**
 * Get current user's live wedding page information
 * Returns slug and other page details needed for sharing/streaming
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's live wedding page
    const weddingPage = await prisma.weddingPage.findFirst({
      where: {
        userId: session.user.id,
        is_live: true,
        deleted_at: null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        is_live: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!weddingPage) {
      return NextResponse.json(
        { error: "No live wedding page found" },
        { status: 404 }
      );
    }

    // Construct full wedding page URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pageUrl = `${baseUrl}/${weddingPage.slug}`;

    console.log("📋 Wedding page info:", {
      slug: weddingPage.slug,
      baseUrl,
      fullUrl: pageUrl,
    });

    return NextResponse.json({
      slug: weddingPage.slug,
      title: weddingPage.title,
      url: pageUrl,
      isLive: weddingPage.is_live,
    });
  } catch (error) {
    console.error("Error fetching wedding page info:", error);
    return NextResponse.json(
      { error: "Failed to fetch wedding page information" },
      { status: 500 }
    );
  }
}
