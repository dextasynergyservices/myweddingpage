/**
 * Admin Middleware Utility
 * Provides reusable admin authentication and authorization
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Session } from "next-auth";

/**
 * Check if the current session has admin privileges
 */
export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session || !session.user) {
    return false;
  }

  return session.user.role === "ADMIN";
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Middleware function to protect admin routes
 * Returns error response if not admin, or null if authorized
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authError = await requireAdmin();
 *   if (authError) return authError;
 *
 *   // Your admin-only logic here
 *   return NextResponse.json({ data: "admin data" });
 * }
 * ```
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json(
      {
        error: "Unauthorized - Authentication required",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }

  if (!isAdmin(session)) {
    return NextResponse.json(
      {
        error: "Forbidden - Admin access required",
        code: "ADMIN_REQUIRED",
        message: "You do not have permission to access this resource",
      },
      { status: 403 }
    );
  }

  return null; // Authorized
}

/**
 * Higher-order function to wrap admin route handlers
 * Automatically checks admin status before executing handler
 *
 * @example
 * ```typescript
 * export const GET = withAdmin(async (request, session) => {
 *   // session is guaranteed to be admin here
 *   return NextResponse.json({ data: "admin data" });
 * });
 * ```
 */
export function withAdmin(
  handler: (
    request: NextRequest,
    session: Session
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        {
          error: "Forbidden - Admin access required",
          code: "ADMIN_REQUIRED",
          message: "You do not have permission to access this resource",
        },
        { status: 403 }
      );
    }

    return handler(request, session);
  };
}

/**
 * Check if a user has admin role by user ID
 * Useful for checking admin status without session
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { default: prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Get admin user by session
 * Returns the admin user object or null
 */
export async function getAdminUser(): Promise<{
  id: string;
  email: string;
  role: string;
} | null> {
  const session = await getSession();

  if (!session || !session.user || !isAdmin(session)) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email || "",
    role: session.user.role || "USER",
  };
}

/**
 * Audit log for admin actions
 * Records admin actions to security log
 */
export async function logAdminAction(
  action: string,
  details: Record<string, unknown>,
  session?: Session | null
) {
  const { logSecurityEvent } = await import("@/lib/security-logger");

  const adminSession = session || (await getSession());

  if (!adminSession || !adminSession.user) {
    console.warn("Attempted to log admin action without session");
    return;
  }

  // Ensure metadata.admin is always present and normalize resource keys
  const normalized: Record<string, unknown> = { ...(details || {}) };

  // Normalize plan keys if present in different shapes
  try {
    // helpers to pull string-like values safely from unknown shapes
    const getStringLike = (
      obj: Record<string, unknown> | undefined,
      k: string
    ): string | undefined => {
      if (!obj) return undefined;
      const v = obj[k];
      if (v === undefined || v === null) return undefined;
      if (typeof v === "string") return v;
      if (typeof v === "number") return String(v);
      if (typeof v === "object") {
        const o = v as Record<string, unknown>;
        if (typeof o.id === "string") return o.id;
        if (typeof o.name === "string") return o.name;
      }
      return undefined;
    };

    const getNested = (
      obj: Record<string, unknown> | undefined,
      path: string[]
    ): string | undefined => {
      let cur: unknown = obj;
      for (const p of path) {
        if (!cur || typeof cur !== "object") return undefined;
        cur = (cur as Record<string, unknown>)[p];
      }
      if (typeof cur === "string") return cur;
      if (typeof cur === "number") return String(cur);
      return undefined;
    };

    const planId =
      getStringLike(details, "planId") ||
      getStringLike(details, "plan_id") ||
      getNested(details, ["plan", "id"]);
    const planName =
      getStringLike(details, "planName") ||
      getStringLike(details, "name") ||
      getNested(details, ["plan", "name"]);

    if (planId) normalized.planId = planId;
    if (planName) normalized.planName = planName;
  } catch {
    // ignore normalization errors
  }

  normalized.admin = normalized.admin || {
    id: adminSession.user.id,
    email: adminSession.user.email || null,
    role: adminSession.user.role || null,
  };

  const created = await logSecurityEvent({
    eventType: "ADMIN_ACTION",
    severity: "MEDIUM",
    userId: adminSession.user.id,
    ipAddress: "server",
    message: action,
    metadata: normalized,
  });

  return created;
}

const adminMiddleware = {
  isAdmin,
  requireAdmin,
  withAdmin,
  isUserAdmin,
  getAdminUser,
  getSession,
  logAdminAction,
};

export default adminMiddleware;
