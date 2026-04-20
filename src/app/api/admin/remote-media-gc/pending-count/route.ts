import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = await prisma.remoteMediaGC.count({
      where: { status: "pending" },
    });
    return NextResponse.json({ pending });
  } catch (err) {
    console.error("Failed to fetch pending remote media gc count:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
