import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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
          where: { isSelected: true },
          include: {
            template: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const selectedTemplate = user.userTemplates[0];

    if (!selectedTemplate) {
      return NextResponse.json({ error: "No template selected" }, { status: 404 });
    }

    return NextResponse.json(selectedTemplate);
  } catch (error) {
    console.error("Failed to fetch user template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
