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
      const isStateChanging = method && ["POST", "PUT", "DELETE", "PATCH"].includes(method);

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
