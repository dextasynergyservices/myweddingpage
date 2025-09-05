import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, set all user templates to not selected
    await prisma.userTemplate.updateMany({
      where: { userId: user.id },
      data: { isSelected: false },
    });

    // Check if user already has this template
    let userTemplate = await prisma.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId,
        },
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (userTemplate) {
      // Update existing template to be selected
      userTemplate = await prisma.userTemplate.update({
        where: { id: userTemplate.id },
        data: { isSelected: true },
        include: {
          template: {
            include: {
              sections: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    } else {
      // Create new template and set as selected
      userTemplate = await prisma.userTemplate.create({
        data: {
          userId: user.id,
          templateId,
          isSelected: true,
          colorScheme: {},
          content: {},
        },
        include: {
          template: {
            include: {
              sections: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(userTemplate);
  } catch (error) {
    console.error("Failed to select template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
