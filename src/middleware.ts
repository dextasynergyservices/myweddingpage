import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { csrfMiddleware, isCSRFExempt } from "@/lib/csrf";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;

    // CSRF Protection for API routes (only for state-changing methods)
    if (req.nextUrl.pathname.startsWith("/api")) {
      const method = req.method?.toUpperCase();
      const isStateChanging =
        method && ["POST", "PUT", "DELETE", "PATCH"].includes(method);

      // Only apply CSRF to state-changing requests on non-exempt paths
      if (isStateChanging && !isCSRFExempt(req as NextRequest)) {
        const csrfError = await csrfMiddleware(req as NextRequest);
        if (csrfError) {
          return csrfError;
        }
      }
    }

    // Check ADMIN role for admin API routes
    if (req.nextUrl.pathname.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Add restrictive Content-Security-Policy for preview pages to harden iframe previews
    if (req.nextUrl.pathname.startsWith("/admin/templates/preview")) {
      // CSP: allow same-origin scripts/styles and allow same-origin framing (so iframe previews work);
      // keep images restricted to self or data:, and connections to self only.
      const csp =
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self';";
      return NextResponse.next({ headers: { "Content-Security-Policy": csp } });
    }

    // NOTE: session ping experiment removed to avoid auth redirect loops. We intentionally
    // do not attempt to update Session.lastAccessedAt here so that existing auth behavior
    // remains unchanged.

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/templates/:path*",
    "/api/user/:path*",
    "/api/admin/:path*",
    "/api/wedding-pages/:path*",
    "/api/upload-image",
    "/api/template-sections/:path*",
  ],
};
