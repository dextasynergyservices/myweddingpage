import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Find any active stream (not user-specific for public pages)
    const activeStream = await prisma.stream.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc", // Get the most recently updated active stream
      },
    });

    console.log("Public active stream API - Found stream:", activeStream);

    if (!activeStream) {
      console.log("Public active stream API - No active stream found");
      return NextResponse.json({ activeStream: null });
    }

    console.log("Public active stream API - Returning active stream");
    return NextResponse.json({ activeStream });
  } catch (error) {
    console.error("Error fetching public active stream:", error);
    return NextResponse.json({ error: "Error fetching active stream" }, { status: 500 });
  }
}
