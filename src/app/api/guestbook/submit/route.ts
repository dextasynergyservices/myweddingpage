import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, message, guestName } = body;

    // Validation
    if (!streamId || !message) {
      return NextResponse.json({ error: "Stream ID and message are required" }, { status: 400 });
    }

    // Validate message length (max 500 characters)
    if (message.length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Check if stream exists
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Create guestbook entry
    const entry = await prisma.guestbookEntry.create({
      data: {
        streamId,
        message: message.trim(),
        guestName: guestName ? guestName.trim() : null,
      },
    });

    // Create activity event
    await prisma.activityEvent.create({
      data: {
        streamId,
        type: "guestbook_posted",
        count: 1,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Error submitting guestbook entry:", error);
    return NextResponse.json({ error: "Failed to submit guestbook entry" }, { status: 500 });
  }
}
