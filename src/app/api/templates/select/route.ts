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

    // Guard: prevent changing template if one is already selected and differs
    const existingSelected = await prisma.userTemplate.findFirst({
      where: { userId: user.id, isSelected: true },
      include: { template: { include: { sections: { orderBy: { order: "asc" } } } } },
    });

    if (existingSelected && existingSelected.templateId !== templateId) {
      return NextResponse.json(
        {
          error: "A template has already been selected and cannot be changed.",
          userTemplate: existingSelected,
        },
        { status: 400 }
      );
    }

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
      if (!userTemplate.isSelected) {
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
      }
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
