import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("streamId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Get entries with pagination
    const [entries, total] = await Promise.all([
      prisma.guestbookEntry.findMany({
        where: { streamId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.guestbookEntry.count({
        where: { streamId },
      }),
    ]);

    return NextResponse.json({
      entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching guestbook entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch guestbook entries" },
      { status: 500 }
    );
  }
}
