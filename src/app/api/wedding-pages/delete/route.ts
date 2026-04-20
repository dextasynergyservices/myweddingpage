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

    const { brideName, groomName } = await req.json();

    if (!brideName || !groomName) {
      return NextResponse.json(
        { error: "Bride name and groom name are required for confirmation" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        weddingPages: {
          where: { is_live: true },
          orderBy: { created_at: "desc" },
          take: 1,
        },
        userTemplates: {
          where: { isSelected: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the names match
    const userBrideName = user.brideName?.toLowerCase().trim();
    const userGroomName = user.groomName?.toLowerCase().trim();
    const providedBrideName = brideName.toLowerCase().trim();
    const providedGroomName = groomName.toLowerCase().trim();

    if (
      userBrideName !== providedBrideName ||
      userGroomName !== providedGroomName
    ) {
      return NextResponse.json(
        {
          error:
            "Names do not match. Please enter the correct bride and groom names.",
        },
        { status: 400 }
      );
    }

    const weddingPage = user.weddingPages[0];
    const userTemplate = user.userTemplates[0];

    if (!weddingPage) {
      return NextResponse.json(
        { error: "No published wedding page found" },
        { status: 404 }
      );
    }

    // Delete all related data in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete media uploads
      await tx.mediaUpload.deleteMany({
        where: { weddingPageId: weddingPage.id },
      });

      // Delete comments
      await tx.comment.deleteMany({
        where: { weddingPageId: weddingPage.id },
      });

      // Delete wedding page
      await tx.weddingPage.delete({
        where: { id: weddingPage.id },
      });

      // Delete user template if it exists
      if (userTemplate) {
        await tx.userTemplate.delete({
          where: { id: userTemplate.id },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Wedding page and template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting wedding page:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}
