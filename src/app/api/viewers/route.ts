import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return mock data since we don't have a real viewer tracking system
    // In a real application, you would fetch this from your database or analytics service
    const mockViewers = [
      {
        id: "1",
        name: "Sarah Johnson",
        joinTime: "14:30",
        device: "desktop" as const,
      },
      {
        id: "2",
        name: "Michael Brown",
        joinTime: "14:32",
        device: "mobile" as const,
      },
      {
        id: "3",
        name: "Lisa Davis",
        joinTime: "14:35",
        device: "tablet" as const,
      },
    ];

    return NextResponse.json(mockViewers);
  } catch (error) {
    console.error("Error fetching viewers:", error);
    return NextResponse.json({ error: "Error fetching viewers" }, { status: 500 });
  }
}
