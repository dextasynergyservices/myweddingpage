import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX: Use select to exclude isActive temporarily
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            max_photos: true,
            max_videos: true,
            max_tabs: true,
            gradient: true,
            popular: true,
            created_at: true,
            // EXCLUDE isActive for now
          },
        },
      },
    });

    if (!user || !user.planId) {
      return NextResponse.json({ error: "User plan not found" }, { status: 404 });
    }

    // Get templates available for user's plan
    const planTemplates = await prisma.planTemplate.findMany({
      where: { planId: user.planId },
      include: {
        template: {
          include: {
            category: true,
            sections: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    const templates = planTemplates.map((pt) => pt.template);

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
