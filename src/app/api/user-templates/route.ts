// src/app/api/user-templates/select/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; // adjust if you're not using next-auth

export async function POST(req: Request) {
  try {
    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Get current user (adjust if your auth is different)
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Unselect other templates for this user
    await prisma.userTemplate.updateMany({
      where: { userId },
      data: { isSelected: false },
    });

    // Upsert the selected template
    const userTemplate = await prisma.userTemplate.upsert({
      where: { userId_templateId: { userId, templateId } },
      update: { isSelected: true },
      create: {
        userId,
        templateId,
        colorScheme: {}, 
        content: {},
        isSelected: true,
      },
    });

    return NextResponse.json(userTemplate);
  } catch (error) {
    console.error("Failed to select template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
