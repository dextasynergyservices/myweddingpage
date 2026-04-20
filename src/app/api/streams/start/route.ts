import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Start all streams for this user
    await prisma.stream.updateMany({
      where: { userId: session.user.id },
      data: { isActive: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting streams:", error);
    return NextResponse.json(
      { error: "Error starting streams" },
      { status: 500 }
    );
  }
}
