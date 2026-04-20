import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Check if stream belongs to user
    const stream = await prisma.stream.findFirst({
      where: {
        id: streamId,
        userId: session.user.id,
      },
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Get or create summary
    let summary = await prisma.streamSummary.findUnique({
      where: { streamId },
    });

    if (!summary) {
      // Create initial summary
      summary = await prisma.streamSummary.create({
        data: {
          streamId,
          totalViewers: 0,
          peakViewers: 0,
          totalReactions: 0,
          totalGuestbook: 0,
        },
      });
    }

    // Get reaction breakdown
    const reactions = await prisma.reaction.findMany({
      where: { streamId },
    });

    const reactionBreakdown = reactions.reduce(
      (acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get guestbook entries
    const guestbookCount = await prisma.guestbookEntry.count({
      where: { streamId },
    });

    // Get recent guestbook entries
    const recentMessages = await prisma.guestbookEntry.findMany({
      where: { streamId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Update summary
    await prisma.streamSummary.update({
      where: { streamId },
      data: {
        totalReactions: reactions.length,
        totalGuestbook: guestbookCount,
        reactionBreakdown,
      },
    });

    return NextResponse.json({
      summary: {
        ...summary,
        totalReactions: reactions.length,
        totalGuestbook: guestbookCount,
        reactionBreakdown,
      },
      recentMessages,
      stream,
    });
  } catch (error) {
    console.error("Error fetching stream summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream summary" },
      { status: 500 }
    );
  }
}

// Update summary stats (called periodically during stream)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { streamId, currentViewers, streamStarted } = body;

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Get or create summary
    let summary = await prisma.streamSummary.findUnique({
      where: { streamId },
    });

    if (!summary) {
      summary = await prisma.streamSummary.create({
        data: {
          streamId,
          totalViewers: currentViewers || 0,
          peakViewers: currentViewers || 0,
          startedAt: streamStarted ? new Date() : null,
        },
      });
    } else {
      // Update peak viewers and total viewers
      const updates: {
        totalViewers?: number;
        peakViewers?: number;
        startedAt?: Date;
      } = {};

      if (currentViewers !== undefined) {
        updates.totalViewers = Math.max(summary.totalViewers, currentViewers);
        updates.peakViewers = Math.max(summary.peakViewers, currentViewers);
      }

      if (streamStarted && !summary.startedAt) {
        updates.startedAt = new Date();
      }

      await prisma.streamSummary.update({
        where: { streamId },
        data: updates,
      });
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Error updating stream summary:", error);
    return NextResponse.json(
      { error: "Failed to update stream summary" },
      { status: 500 }
    );
  }
}
