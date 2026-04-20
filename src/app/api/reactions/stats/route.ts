import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json({ error: "Stream ID is required" }, { status: 400 });
    }

    // Get all reactions for this stream
    const reactions = await prisma.reaction.findMany({
      where: { streamId },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate by type
    const stats = reactions.reduce(
      (acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get recent reactions for animation
    const recentReactions = reactions.slice(0, 10);

    return NextResponse.json({
      total: reactions.length,
      stats,
      recentReactions,
    });
  } catch (error) {
    console.error("Error fetching reaction stats:", error);
    return NextResponse.json({ error: "Failed to fetch reaction stats" }, { status: 500 });
  }
}
