import { getCSRFTokenResponse } from "@/lib/csrf";

/**
 * GET /api/csrf-token
 *
 * Returns a CSRF token for client-side use
 * Sets the token in a secure HTTP-only cookie
 *
 * @returns JSON response with CSRF token
 */
export async function GET() {
  return await getCSRFTokenResponse();
}
