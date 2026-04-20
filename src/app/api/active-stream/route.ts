import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's active stream
    const activeStream = await prisma.stream.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc", // Get the most recently updated active stream
      },
    });

    if (!activeStream) {
      return NextResponse.json({ activeStream: null });
    }

    return NextResponse.json({ activeStream });
  } catch (error) {
    console.error("Error fetching active stream:", error);
    return NextResponse.json(
      { error: "Error fetching active stream" },
      { status: 500 }
    );
  }
}
