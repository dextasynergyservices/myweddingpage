import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function weddingPageProtectionMiddleware(
  request: NextRequest,
  slug: string
) {
  try {
    // Find the wedding page
    const weddingPage = await prisma.weddingPage.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            subscription_end: true,
            isInGracePeriod: true,
            gracePeriodEnd: true,
          },
        },
      },
    });

    if (!weddingPage) {
      return NextResponse.json(
        { error: "Wedding page not found" },
        { status: 404 }
      );
    }

    // Check if page is soft deleted
    if (weddingPage.deleted_at) {
      return NextResponse.json(
        {
          error: "This wedding page is no longer available",
          message: "The page has been removed due to plan expiration",
        },
        { status: 410 } // 410 Gone
      );
    }

    const now = new Date();
    const user = weddingPage.user;

    // Check subscription status
    const subscriptionEnd = user.subscription_end
      ? new Date(user.subscription_end)
      : null;
    const isSubscriptionExpired = subscriptionEnd
      ? subscriptionEnd.getTime() <= now.getTime()
      : false;

    // If subscription is active, allow access
    if (!isSubscriptionExpired) {
      return null; // No restrictions
    }

    // Subscription has expired - check grace period
    if (user.isInGracePeriod && user.gracePeriodEnd) {
      const gracePeriodEnd = new Date(user.gracePeriodEnd);
      const isGracePeriodActive = gracePeriodEnd.getTime() > now.getTime();

      if (isGracePeriodActive) {
        // Grace period is active - allow read-only access with warning banner
        const daysLeft = Math.ceil(
          (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          status: "grace-period",
          graceDaysLeft: daysLeft,
          message: `This page is in grace period. ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left before deletion.`,
          restrictions: ["read-only", "no-editing"],
        };
      }
    }

    // Grace period has ended or never started - page should be deleted
    // This should be handled by the cron job, but as a safety net:
    await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        deleted_at: now,
        deletion_reason: "subscription_expired_safety_net",
      },
    });

    return NextResponse.json(
      {
        error: "This wedding page is no longer available",
        message: "The page has been removed due to plan expiration",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error in wedding page protection middleware:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to check if user can edit wedding pages
export async function canUserEditWeddingPage(userId: string): Promise<{
  canEdit: boolean;
  reason?: string;
  graceDaysLeft?: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_end: true,
        isInGracePeriod: true,
        gracePeriodEnd: true,
      },
    });

    if (!user) {
      return { canEdit: false, reason: "User not found" };
    }

    const now = new Date();
    const subscriptionEnd = user.subscription_end
      ? new Date(user.subscription_end)
      : null;
    const isSubscriptionExpired = subscriptionEnd
      ? subscriptionEnd.getTime() <= now.getTime()
      : false;

    // Active subscription - can edit
    if (!isSubscriptionExpired) {
      return { canEdit: true };
    }

    // Expired subscription - check grace period
    if (user.isInGracePeriod && user.gracePeriodEnd) {
      const gracePeriodEnd = new Date(user.gracePeriodEnd);
      const isGracePeriodActive = gracePeriodEnd.getTime() > now.getTime();
      const daysLeft = Math.ceil(
        (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (isGracePeriodActive) {
        return {
          canEdit: false,
          reason: "read-only-grace-period",
          graceDaysLeft: Math.max(0, daysLeft),
        };
      }
    }

    return {
      canEdit: false,
      reason: "subscription-expired",
    };
  } catch (error) {
    console.error("Error checking user edit permissions:", error);
    return { canEdit: false, reason: "error" };
  }
}

// API endpoint to check wedding page status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Find the wedding page
    const weddingPage = await prisma.weddingPage.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            subscription_end: true,
            isInGracePeriod: true,
            gracePeriodEnd: true,
          },
        },
      },
    });

    if (!weddingPage) {
      return NextResponse.json(
        { error: "Wedding page not found" },
        { status: 404 }
      );
    }

    // Check if page is soft deleted
    if (weddingPage.deleted_at) {
      return NextResponse.json(
        {
          error: "This wedding page is no longer available",
          message: "The page has been removed due to plan expiration",
        },
        { status: 410 }
      );
    }

    const now = new Date();
    const user = weddingPage.user;

    // Check subscription status
    const subscriptionEnd = user.subscription_end
      ? new Date(user.subscription_end)
      : null;
    const isSubscriptionExpired = subscriptionEnd
      ? subscriptionEnd.getTime() <= now.getTime()
      : false;

    // If subscription is active, allow access
    if (!isSubscriptionExpired) {
      return NextResponse.json({
        status: "active",
        restrictions: [],
        graceDaysLeft: 0,
        message: "Page is accessible",
      });
    }

    // Subscription has expired - check grace period
    if (user.isInGracePeriod && user.gracePeriodEnd) {
      const gracePeriodEnd = new Date(user.gracePeriodEnd);
      const isGracePeriodActive = gracePeriodEnd.getTime() > now.getTime();

      if (isGracePeriodActive) {
        // Grace period is active - allow read-only access with warning banner
        const daysLeft = Math.ceil(
          (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return NextResponse.json({
          status: "grace-period",
          graceDaysLeft: daysLeft,
          message: `This page is in grace period. ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left before deletion.`,
          restrictions: ["read-only", "no-editing"],
        });
      }
    }

    // Grace period has ended or never started - page should be deleted
    // This should be handled by the cron job, but as a safety net:
    await prisma.weddingPage.update({
      where: { id: weddingPage.id },
      data: {
        deleted_at: now,
        deletion_reason: "subscription_expired_safety_net",
      },
    });

    return NextResponse.json(
      {
        error: "This wedding page is no longer available",
        message: "The page has been removed due to plan expiration",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error checking wedding page protection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
