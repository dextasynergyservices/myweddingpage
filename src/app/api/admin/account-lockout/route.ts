import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  unlockAccount,
  getLockoutHistory,
  getLoginAttemptHistory,
  checkLockoutStatus,
} from "@/lib/account-lockout";

/**
 * GET /api/admin/account-lockout
 *
 * Query lockout status, history, or login attempts
 * Admin only endpoint
 *
 * Query parameters:
 * - action: 'status' | 'lockout-history' | 'attempt-history'
 * - identifier: Email or IP address
 * - limit: Number of records (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");
    const identifier = searchParams.get("identifier");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!identifier) {
      return NextResponse.json({ error: "identifier parameter required" }, { status: 400 });
    }

    switch (action) {
      case "status": {
        // Check if email or IP is locked
        const [email, ipAddress] = identifier.includes("@") ? [identifier, ""] : ["", identifier];

        const status = await checkLockoutStatus(email || identifier, ipAddress || identifier);

        return NextResponse.json({ status });
      }

      case "lockout-history": {
        const history = await getLockoutHistory(identifier, limit);
        return NextResponse.json({ history, count: history.length });
      }

      case "attempt-history": {
        const attempts = await getLoginAttemptHistory(identifier, limit);
        return NextResponse.json({ attempts, count: attempts.length });
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid action. Use: status, lockout-history, or attempt-history",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Failed to query lockout data:", error);
    return NextResponse.json({ error: "Failed to query lockout data" }, { status: 500 });
  }
}

/**
 * POST /api/admin/account-lockout
 *
 * Unlock an account
 * Admin only endpoint
 *
 * Body:
 * - email: Email address to unlock
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const result = await unlockAccount(email, session.user.id || "admin");

    if (!result) {
      return NextResponse.json({ error: "Failed to unlock account" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Account ${email} has been unlocked`,
      unlockedCount: result.count,
    });
  } catch (error) {
    console.error("Failed to unlock account:", error);
    return NextResponse.json({ error: "Failed to unlock account" }, { status: 500 });
  }
}
