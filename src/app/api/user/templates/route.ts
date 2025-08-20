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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userTemplates: {
          include: {
            template: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.userTemplates);
  } catch (error) {
    console.error("Failed to fetch user templates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, content, colorScheme } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has this template
    const existingTemplate = await prisma.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId
        }
      }
    });

    let userTemplate;
    if (existingTemplate) {
      // Update existing template
      userTemplate = await prisma.userTemplate.update({
        where: { id: existingTemplate.id },
        data: { content, colorScheme }
      });
    } else {
      // Create new template
      userTemplate = await prisma.userTemplate.create({
        data: {
          userId: user.id,
          templateId,
          content,
          colorScheme
        }
      });
    }

    return NextResponse.json(userTemplate);
  } catch (error) {
    console.error("Failed to save user template:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}