import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("streamId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Get recent activity events
    const events = await prisma.activityEvent.findMany({
      where: { streamId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Format events for display (no fake names, just counts)
    const formattedEvents = events.map((event) => {
      let message = "";
      let icon = "";

      switch (event.type) {
        case "guest_joined":
          message =
            event.count === 1
              ? "1 guest joined the stream"
              : `${event.count} guests joined the stream`;
          icon = "👋";
          break;
        case "reaction_sent":
          const metadata = (event.metadata as { reactionType?: string }) || {};
          const reactionType = metadata.reactionType || "reaction";
          const emoji =
            {
              heart: "❤️",
              clap: "👏",
              fire: "🔥",
              tada: "🎉",
            }[reactionType] || "❤️";
          message =
            event.count === 1
              ? `Someone sent ${emoji}`
              : `${event.count} ${emoji} reactions sent`;
          icon = emoji;
          break;
        case "guestbook_posted":
          message =
            event.count === 1
              ? "New guestbook message"
              : `${event.count} new guestbook messages`;
          icon = "✍️";
          break;
        default:
          message = "Activity";
          icon = "📊";
      }

      return {
        id: event.id,
        message,
        icon,
        timestamp: event.createdAt,
        count: event.count,
      };
    });

    return NextResponse.json({
      events: formattedEvents,
      total: events.length,
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity feed" },
      { status: 500 }
    );
  }
}

// Track guest joins
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId } = body;

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Create activity event for guest join
    const event = await prisma.activityEvent.create({
      data: {
        streamId,
        type: "guest_joined",
        count: 1,
      },
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error tracking guest join:", error);
    return NextResponse.json(
      { error: "Failed to track guest join" },
      { status: 500 }
    );
  }
}
