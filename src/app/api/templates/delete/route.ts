import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
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

    const userTemplate = await prisma.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId,
        },
      },
    });

    if (!userTemplate) {
      return NextResponse.json({ error: "Template not found for user" }, { status: 404 });
    }

    // Only allow deletion if it is the selected template
    if (!userTemplate.isSelected) {
      return NextResponse.json({ error: "Template is not selected" }, { status: 400 });
    }

    await prisma.userTemplate.delete({ where: { id: userTemplate.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
