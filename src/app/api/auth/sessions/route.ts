/**
 * Session Management API
 *
 * Provides endpoints for managing user sessions:
 * - List active sessions
 * - Terminate specific session
 * - Terminate all sessions
 *
 * Requires authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  getActiveSessions,
  terminateSession,
  terminateAllSessions,
  detectSessionHijacking,
} from "@/lib/session-security";

/**
 * GET /api/auth/sessions
 *
 * Get all active sessions for the authenticated user
 *
 * Query parameters:
 * - action: 'list' (default) | 'check-security'
 *
 * Returns:
 * {
 *   sessions: Array<SessionMetadata>,
 *   currentSessionToken: string,
 *   count: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";

    if (action === "check-security") {
      // Check for session hijacking patterns
      const securityCheck = await detectSessionHijacking(session.user.id);

      return NextResponse.json({
        suspicious: securityCheck.suspicious,
        reasons: securityCheck.reasons,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: List active sessions
    const sessions = await getActiveSessions(session.user.id);

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        sessionToken: s.sessionToken.substring(0, 10) + "...", // Partial token for security
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastAccessedAt: s.lastAccessedAt,
        expiresAt: s.expiresAt,
        isCurrent: s.sessionToken === (session as { sessionToken?: string }).sessionToken,
      })),
      currentSessionToken:
        ((session as { sessionToken?: string }).sessionToken?.substring(0, 10) || "") + "...",
      count: sessions.length,
    });
  } catch (error) {
    console.error("Session list error:", error);
    return NextResponse.json({ error: "Failed to retrieve sessions" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/sessions
 *
 * Terminate session(s)
 *
 * Query parameters:
 * - action: 'terminate-one' | 'terminate-all'
 * - sessionToken: Token to terminate (for 'terminate-one')
 *
 * Body (optional):
 * {
 *   keepCurrent: boolean  // Keep current session when terminating all
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const sessionToken = searchParams.get("sessionToken");

    if (action === "terminate-one") {
      // Terminate specific session
      if (!sessionToken) {
        return NextResponse.json({ error: "sessionToken is required" }, { status: 400 });
      }

      await terminateSession(sessionToken, "User requested termination");

      return NextResponse.json({
        success: true,
        message: "Session terminated",
      });
    }

    if (action === "terminate-all") {
      // Terminate all sessions
      const body = await request.json().catch(() => ({}));
      const keepCurrent = body.keepCurrent !== false; // Default to true

      const count = await terminateAllSessions(
        session.user.id,
        keepCurrent ? (session as { sessionToken?: string }).sessionToken : undefined
      );

      return NextResponse.json({
        success: true,
        message: keepCurrent
          ? `Terminated ${count} other sessions`
          : `Terminated all ${count} sessions`,
        count,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use terminate-one or terminate-all" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Session termination error:", error);
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
  }
}
