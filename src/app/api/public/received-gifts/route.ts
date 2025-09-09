import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received gift data:", body);

    // Validate required fields
    if (!body.name || (!body.giftId && !body.amount) || !body.userId) {
      console.log("Validation failed - missing required fields:", {
        name: body.name,
        giftId: body.giftId,
        amount: body.amount,
        userId: body.userId
      });
      return NextResponse.json({
        error: "Missing required fields",
        details: "Name, userId, and either giftId or amount are required"
      }, { status: 400 });
    }

    // Validate that the userId exists (wedding page owner)
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({
        error: "Invalid user ID",
        details: "The wedding page owner does not exist"
      }, { status: 400 });
    }

    // Create the received gift
    console.log("Creating received gift with data:", {
      name: body.name,
      giftId: body.giftId || null,
      amount: body.amount ? parseFloat(body.amount) : null,
      message: body.message || null,
      date: new Date(body.date || new Date()),
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      userId: body.userId,
    });

    const receivedGift = await prisma.receivedGift.create({
      data: {
        name: body.name,
        giftId: body.giftId || null,
        amount: body.amount ? parseFloat(body.amount) : null,
        message: body.message || null,
        date: new Date(body.date || new Date()),
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        userId: body.userId, // Wedding page owner's ID
      },
    });

    console.log("Successfully created received gift:", receivedGift);
    return NextResponse.json(receivedGift, { status: 201 });
  } catch (error) {
    console.error("Failed to create received gift:", error);
    return NextResponse.json(
      {
        error: "Failed to create received gift",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

