import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { userId } = await request.json();

    // Verify the user can restore pages (either their own or admin)
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Cannot restore pages for another user." },
        { status: 403 }
      );
    }

    // Check if user has an active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscription_end: true,
        status: true,
        isInGracePeriod: true,
        gracePeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const now = new Date();
    const subscriptionEnd = user.subscription_end ? new Date(user.subscription_end) : null;

    // Check if user has active subscription or is within account retention period (30 days)
    const hasActiveSubscription = subscriptionEnd && subscriptionEnd.getTime() > now.getTime();
    const isWithinRetentionPeriod = user.gracePeriodEnd
      ? now.getTime() - new Date(user.gracePeriodEnd).getTime() < 30 * 24 * 60 * 60 * 1000
      : false;

    if (!hasActiveSubscription && !isWithinRetentionPeriod) {
      return NextResponse.json(
        {
          error:
            "Cannot restore pages. User must have active subscription or be within 30-day retention period.",
          details: {
            hasActiveSubscription,
            isWithinRetentionPeriod,
            subscriptionEnd: user.subscription_end,
            gracePeriodEnd: user.gracePeriodEnd,
          },
        },
        { status: 400 }
      );
    }

    // Find soft-deleted wedding pages for this user
    const softDeletedPages = await prisma.weddingPage.findMany({
      where: {
        userId,
        deleted_at: { not: null },
        deletion_reason: "subscription_expired",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        deleted_at: true,
      },
    });

    if (softDeletedPages.length === 0) {
      return NextResponse.json(
        {
          message: "No wedding pages to restore.",
          restoredCount: 0,
        },
        { status: 200 }
      );
    }

    // Restore the wedding pages
    const restoreResult = await prisma.weddingPage.updateMany({
      where: {
        userId,
        deleted_at: { not: null },
        deletion_reason: "subscription_expired",
      },
      data: {
        is_live: true, // Make pages live again
        deleted_at: null, // Remove soft delete
        deletion_reason: null, // Clear deletion reason
      },
    });

    // Reset grace period flags if user has active subscription
    if (hasActiveSubscription) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isInGracePeriod: false,
          gracePeriodStart: null,
          gracePeriodEnd: null,
        },
      });
    }

    // Log the restoration
    console.log(`Restored ${restoreResult.count} wedding pages for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${restoreResult.count} wedding page${restoreResult.count !== 1 ? "s" : ""}`,
      restoredCount: restoreResult.count,
      restoredPages: softDeletedPages.map((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
      })),
    });
  } catch (error) {
    console.error("Error restoring wedding pages:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check what pages can be restored
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Verify the user can check pages (either their own or admin)
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Cannot check pages for another user." },
        { status: 403 }
      );
    }

    // Find soft-deleted wedding pages for this user
    const softDeletedPages = await prisma.weddingPage.findMany({
      where: {
        userId,
        deleted_at: { not: null },
        deletion_reason: "subscription_expired",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        deleted_at: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      restorablePages: softDeletedPages,
      count: softDeletedPages.length,
    });
  } catch (error) {
    console.error("Error checking restorable wedding pages:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
