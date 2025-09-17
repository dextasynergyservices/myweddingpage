import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received API request with body:", body);

    const { name, message, slug } = body; // Changed to 'slug' for clarity

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Please enter a message" }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: "Slug is missing" }, { status: 400 });
    }

    // Get the wedding page using the slug (excluding deleted pages)
    const weddingPage = await prisma.weddingPage.findFirst({
      where: {
        slug: slug,
        deleted_at: null, // Only allow comments on non-deleted pages
      },
      select: { id: true, userId: true },
    });

    if (!weddingPage) {
      return NextResponse.json({ error: "Wedding page not found" }, { status: 404 });
    }

    // Create the comment in the database
    const comment = await prisma.comment.create({
      data: {
        name,
        message,
        weddingPageId: weddingPage.id,
        userId: weddingPage.userId,
        approved: false,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Get the wedding page using the slug (excluding deleted pages)
    const weddingPage = await prisma.weddingPage.findFirst({
      where: {
        slug: slug,
        deleted_at: null, // Only show comments for non-deleted pages
      },
      select: { id: true },
    });

    if (!weddingPage) {
      return NextResponse.json({ error: "Wedding page not found" }, { status: 404 });
    }

    // Fetch only approved comments for this wedding page
    const comments = await prisma.comment.findMany({
      where: {
        weddingPageId: weddingPage.id,
        approved: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
