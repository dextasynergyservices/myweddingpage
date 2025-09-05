import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with selected template
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userTemplates: {
          where: { isSelected: true },
          include: {
            template: {
              include: {
                sections: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
        weddingPages: {
          where: { is_live: true },
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get selected template or the one specified
    const selectedTemplate = templateId
      ? user.userTemplates.find((ut) => ut.templateId === templateId)?.template
      : user.userTemplates[0]?.template;

    if (!selectedTemplate) {
      return NextResponse.json({ error: "No template selected" }, { status: 404 });
    }

    // Get user data for dynamic content
    const userData = {
      brideName: user.brideName || "Bride",
      groomName: user.groomName || "Groom",
      weddingDate: user.weddingDate?.toISOString() || new Date().toISOString(),
      venue: user.weddingPages[0]?.venue || "Venue",
      welcomeMessage: user.weddingPages[0]?.welcomeMessage || "Welcome to our wedding",
    };

    return NextResponse.json({
      template: selectedTemplate,
      userData,
    });
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
