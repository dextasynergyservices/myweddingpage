import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { commentSchema } from "@/lib/validators";
import { sanitizeBasicHTML } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

// Apply rate limiting to comments (20 requests per hour per user)
const commentsRateLimit = rateLimit({
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many comment requests. Please try again later.",
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { userId: user.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch well wishes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch well wishes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await commentsRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name: rawName,
      message: rawMessage,
      created_at,
      weddingPageId,
    } = body;

    // Sanitize inputs to prevent XSS attacks
    const name = rawName ? sanitizeBasicHTML(rawName) : "";
    const message = rawMessage ? sanitizeBasicHTML(rawMessage) : "";

    // Validate with Zod schema
    const validationResult = commentSchema.safeParse({
      name,
      message,
      weddingPageId: weddingPageId || "",
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path[0]?.toString() || "unknown",
        message: err.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const comment = await prisma.comment.create({
      data: {
        name: validatedData.name,
        message: validatedData.message,
        created_at: created_at,
        userId: user.id,
        weddingPageId: validatedData.weddingPageId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to create well wish:", error);
    return NextResponse.json(
      {
        error: "Failed to create well wish",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await commentsRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id, approved } = await request.json();
    if (id === undefined || approved === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Well wish not found" },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id, userId: user.id },
      data: { approved },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Failed to update well wish:", error);
    return NextResponse.json(
      {
        error: "Failed to update well wish",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await commentsRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing well wish ID" },
        { status: 400 }
      );
    }

    await prisma.comment.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete well wish:", error);
    return NextResponse.json(
      {
        error: "Failed to delete well wish",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
