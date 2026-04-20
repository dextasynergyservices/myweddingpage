import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await prisma.templateCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    });
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    console.error("Failed to load template categories:", err);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}

// Create a new category (ADMIN only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const description = body?.description ? String(body.description) : null;
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const created = await prisma.templateCategory.create({
      data: { name, description },
    });
    return NextResponse.json({ category: created });
  } catch (err: unknown) {
    console.error("Failed to create template category:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete a category by id (ADMIN only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const id = String(body?.id || "").trim();
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.templateCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to delete template category:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update a category (ADMIN only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const name = body?.name ? String(body.name).trim() : null;
    const description = body?.description ? String(body.description) : null;
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });
    if (!name)
      return NextResponse.json({ error: "name required" }, { status: 400 });
    const updated = await prisma.templateCategory.update({
      where: { id },
      data: { name, description },
    });
    return NextResponse.json({ category: updated });
  } catch (err: unknown) {
    console.error("Failed to update template category:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
