import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.userId) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, and userId are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Create the received gift record
    const receivedGift = await prisma.receivedGift.create({
      data: {
        name: body.name,
        amount: body.amount ? parseFloat(body.amount) : null,
        message: body.message || null,
        contactEmail: body.email,
        contactPhone: body.phone,
        userId: body.userId,
        date: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cash gift submitted successfully",
        gift: receivedGift,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit cash gift:", error);
    return NextResponse.json(
      {
        error: "Failed to submit cash gift",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
