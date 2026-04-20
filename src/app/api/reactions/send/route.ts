import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, type, guestName } = body;

    // Validation
    if (!streamId || !type) {
      return NextResponse.json(
        { error: "Stream ID and reaction type are required" },
        { status: 400 }
      );
    }

    // Validate reaction type
    const validTypes = ["heart", "clap", "fire", "tada"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
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

    // Create reaction
    const reaction = await prisma.reaction.create({
      data: {
        streamId,
        type,
        guestName: guestName || null,
      },
    });

    // Create activity event (batched - will aggregate similar events)
    await prisma.activityEvent.create({
      data: {
        streamId,
        type: "reaction_sent",
        count: 1,
        metadata: { reactionType: type },
      },
    });

    return NextResponse.json({
      success: true,
      reaction,
    });
  } catch (error) {
    console.error("Error sending reaction:", error);
    return NextResponse.json(
      { error: "Failed to send reaction" },
      { status: 500 }
    );
  }
}
