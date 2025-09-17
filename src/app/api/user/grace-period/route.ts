import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscription_end: true,
        isInGracePeriod: true,
        gracePeriodStart: true,
        gracePeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if subscription has actually expired
    const now = new Date();
    const subscriptionEnd = user.subscription_end ? new Date(user.subscription_end) : null;

    if (!subscriptionEnd || subscriptionEnd.getTime() > now.getTime()) {
      return NextResponse.json({ error: "Subscription is still active" }, { status: 400 });
    }

    // Check if grace period is already active
    if (user.isInGracePeriod && user.gracePeriodEnd) {
      const gracePeriodEnd = new Date(user.gracePeriodEnd);
      if (gracePeriodEnd.getTime() > now.getTime()) {
        return NextResponse.json({
          message: "Grace period already active",
          gracePeriodEnd: user.gracePeriodEnd,
        });
      }
    }

    // Activate grace period (3 days from now)
    const gracePeriodStart = now;
    const gracePeriodEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isInGracePeriod: true,
        gracePeriodStart,
        gracePeriodEnd,
      },
      select: {
        id: true,
        gracePeriodStart: true,
        gracePeriodEnd: true,
        isInGracePeriod: true,
      },
    });

    // Log the expiration event
    await prisma.expirationLog.create({
      data: {
        userId,
        expiredAt: gracePeriodStart,
        subscriptionEnd: subscriptionEnd,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Grace period activated",
      gracePeriod: {
        start: updatedUser.gracePeriodStart,
        end: updatedUser.gracePeriodEnd,
        isActive: updatedUser.isInGracePeriod,
      },
    });
  } catch (error) {
    console.error("Error activating grace period:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET endpoint to check grace period status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscription_end: true,
        isInGracePeriod: true,
        gracePeriodStart: true,
        gracePeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const subscriptionEnd = user.subscription_end ? new Date(user.subscription_end) : null;
    const gracePeriodEnd = user.gracePeriodEnd ? new Date(user.gracePeriodEnd) : null;

    // Calculate subscription status
    let status = "active";
    let graceDaysLeft = 0;

    if (subscriptionEnd && subscriptionEnd.getTime() <= now.getTime()) {
      // Subscription has expired
      if (user.isInGracePeriod && gracePeriodEnd) {
        graceDaysLeft = Math.max(
          0,
          Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        status = graceDaysLeft > 0 ? "grace-period" : "deletion-pending";
      } else {
        status = "just-expired";
        graceDaysLeft = 3; // Default grace period
      }
    }

    return NextResponse.json({
      status,
      graceDaysLeft,
      gracePeriod: {
        isActive: user.isInGracePeriod,
        start: user.gracePeriodStart,
        end: user.gracePeriodEnd,
      },
      subscription: {
        end: user.subscription_end,
        isExpired: subscriptionEnd ? subscriptionEnd.getTime() <= now.getTime() : false,
      },
    });
  } catch (error) {
    console.error("Error checking grace period status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
