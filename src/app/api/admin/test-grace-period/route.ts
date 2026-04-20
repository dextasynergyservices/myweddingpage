import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Quick diagnostic endpoint to test grace period logic
 * DELETE THIS FILE after testing is complete
 *
 * Usage: GET http://localhost:3001/api/admin/test-grace-period
 */
export async function GET() {
  try {
    const now = new Date();

    // SCENARIO 1: Find users with grace period but all pages deleted (SHOULD BE EMPTY AFTER FIX)
    const usersWithDeletedPages = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
      },
      include: {
        weddingPages: {
          select: {
            id: true,
            slug: true,
            deleted_at: true,
            deletion_reason: true,
          },
        },
      },
    });

    const scenario1Results = usersWithDeletedPages.map((user) => ({
      id: user.id,
      email: user.email,
      groomName: user.groomName,
      brideName: user.brideName,
      isInGracePeriod: user.isInGracePeriod,
      gracePeriodEnd: user.gracePeriodEnd,
      activePages: user.weddingPages.filter((p) => !p.deleted_at).length,
      deletedPages: user.weddingPages.filter((p) => p.deleted_at).length,
      totalPages: user.weddingPages.length,
    }));

    // SCENARIO 2: Users who SHOULD receive grace period emails (with active pages)
    const usersForReminders = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
        gracePeriodEnd: {
          gt: now,
        },
        weddingPages: {
          some: {
            deleted_at: null,
          },
        },
      },
      include: {
        weddingPages: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    const scenario2Results = usersForReminders.map((user) => {
      const gracePeriodEnd = user.gracePeriodEnd ? new Date(user.gracePeriodEnd) : null;
      const daysLeft = gracePeriodEnd
        ? Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: user.id,
        email: user.email,
        groomName: user.groomName,
        daysLeft,
        willReceiveEmail: daysLeft && [3, 2, 1].includes(daysLeft),
        gracePeriodEnd: user.gracePeriodEnd,
        activePagesCount: user.weddingPages.length,
        activePages: user.weddingPages.map((p) => ({
          slug: p.slug,
          title: p.title,
        })),
      };
    });

    // SCENARIO 3: Users with orphaned grace period flags (grace period ended but flag not reset)
    const orphanedFlags = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
        gracePeriodEnd: {
          lt: now,
        },
      },
      include: {
        weddingPages: {
          select: {
            id: true,
            deleted_at: true,
          },
        },
      },
    });

    const scenario3Results = orphanedFlags.map((user) => ({
      id: user.id,
      email: user.email,
      gracePeriodEnd: user.gracePeriodEnd,
      daysOverdue: user.gracePeriodEnd
        ? Math.floor(
            (now.getTime() - new Date(user.gracePeriodEnd).getTime()) / (1000 * 60 * 60 * 24)
          )
        : null,
      activePages: user.weddingPages.filter((p) => !p.deleted_at).length,
      deletedPages: user.weddingPages.filter((p) => p.deleted_at).length,
    }));

    // SCENARIO 4: All users with any grace period data
    const allGracePeriodUsers = await prisma.user.findMany({
      where: {
        OR: [{ isInGracePeriod: true }, { gracePeriodStart: { not: null } }],
      },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        subscription_end: true,
        gracePeriodStart: true,
        gracePeriodEnd: true,
        isInGracePeriod: true,
      },
    });

    return NextResponse.json({
      timestamp: now.toISOString(),
      summary: {
        totalUsersInGracePeriod: usersWithDeletedPages.length,
        usersWhoShouldReceiveEmails: scenario2Results.filter((r) => r.willReceiveEmail).length,
        usersWithOrphanedFlags: scenario3Results.length,
        usersWithNoActivePages: scenario1Results.filter((r) => r.activePages === 0).length,
      },
      status: {
        fixWorking:
          scenario1Results.filter((r) => r.activePages === 0).length === 0 &&
          scenario3Results.length === 0,
        message:
          scenario1Results.filter((r) => r.activePages === 0).length === 0 &&
          scenario3Results.length === 0
            ? "✅ Fix is working! No users with deleted pages in grace period."
            : "⚠️ Found issues - see details below",
      },
      scenarios: {
        scenario1_usersWithDeletedPagesButInGracePeriod: {
          description: "Users who have grace period flag but all pages deleted (SHOULD BE EMPTY)",
          count: scenario1Results.filter((r) => r.activePages === 0).length,
          users: scenario1Results.filter((r) => r.activePages === 0),
        },
        scenario2_usersShouldReceiveEmails: {
          description: "Users who should receive grace period reminder emails",
          count: scenario2Results.filter((r) => r.willReceiveEmail).length,
          users: scenario2Results.filter((r) => r.willReceiveEmail),
        },
        scenario3_orphanedFlags: {
          description: "Users with grace period ended but flags not reset (SHOULD BE EMPTY)",
          count: scenario3Results.length,
          users: scenario3Results,
        },
        scenario4_allGracePeriodData: {
          description: "All users with any grace period data",
          count: allGracePeriodUsers.length,
          users: allGracePeriodUsers,
        },
      },
    });
  } catch (error) {
    console.error("Error in grace period test:", error);
    return NextResponse.json(
      {
        error: "Failed to run grace period diagnostics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
