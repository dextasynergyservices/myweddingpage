import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const gifts = await prisma.gift.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(gifts);
  } catch (error) {
    console.error("Failed to fetch gifts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch gifts",
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
    if (!body.name || !body.description || body.price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const gift = await prisma.gift.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        link: body.link || null,
        image: body.image || null,
        userId: user.id,
      },
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error) {
    console.error("Failed to create gift:", error);
    return NextResponse.json(
      {
        error: "Failed to create gift",
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

    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing gift ID" }, { status: 400 });
    }

    const existingGift = await prisma.gift.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingGift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    const updatedGift = await prisma.gift.update({
      where: { id, userId: user.id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        link: data.link || null,
        image: data.image || null,
      },
    });

    return NextResponse.json(updatedGift);
  } catch (error) {
    console.error("Failed to update gift:", error);
    return NextResponse.json(
      {
        error: "Failed to update gift",
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
      return NextResponse.json({ error: "Missing gift ID" }, { status: 400 });
    }

    await prisma.gift.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gift:", error);
    return NextResponse.json(
      {
        error: "Failed to delete gift",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
