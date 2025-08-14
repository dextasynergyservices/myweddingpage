import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        name: body.name,
        message: body.message,
        created_at: body.created_at,
        userId: user.id,
        weddingPageId: body.weddingPageId,
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id, approved } = await request.json();
    if (id === undefined || approved === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Well wish not found" }, { status: 404 });
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing well wish ID" }, { status: 400 });
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
