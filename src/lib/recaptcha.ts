/**
 * Google reCAPTCHA Verification Utilities
 * Backend verification for reCAPTCHA v2 and v3 tokens
 */

export interface RecaptchaVerificationResponse {
  success: boolean;
  score?: number; // For v3 only (0.0 - 1.0)
  action?: string; // For v3 only
  challenge_ts?: string; // Timestamp of the challenge
  hostname?: string; // Hostname of the site
  "error-codes"?: string[]; // Error codes if verification failed
}

export interface RecaptchaValidationResult {
  success: boolean;
  score?: number;
  message?: string;
  errors?: string[];
}

/**
 * Verify reCAPTCHA v2 or v3 token with Google's API
 *
 * @param token - The reCAPTCHA response token from the client
 * @param version - Version of reCAPTCHA ("v2" or "v3")
 * @param expectedAction - Expected action name (for v3 only)
 * @param minScore - Minimum acceptable score for v3 (default: 0.5)
 * @returns Validation result
 *
 * @example
 * const result = await verifyRecaptcha(token, "v3", "submit_form", 0.7);
 * if (result.success) {
 *   // Proceed with form submission
 * }
 */
export async function verifyRecaptcha(
  token: string,
  version: "v2" | "v3" = "v3",
  expectedAction?: string,
  minScore: number = 0.5
): Promise<RecaptchaValidationResult> {
  // Validation checks
  if (!token || typeof token !== "string") {
    return {
      success: false,
      message: "reCAPTCHA token is required",
      errors: ["Missing or invalid token"],
    };
  }

  // Check if secret key is configured
  const secretKey =
    version === "v3" ? process.env.RECAPTCHA_SECRET_KEY_V3 : process.env.RECAPTCHA_SECRET_KEY_V2;

  if (!secretKey) {
    console.error(`reCAPTCHA ${version} secret key not configured`);
    return {
      success: false,
      message: "reCAPTCHA verification service not configured",
      errors: ["Server configuration error"],
    };
  }

  try {
    // Call Google's verification API
    const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error("reCAPTCHA verification request failed:", response.statusText);
      return {
        success: false,
        message: "Failed to verify reCAPTCHA",
        errors: ["Network error"],
      };
    }

    const data: RecaptchaVerificationResponse = await response.json();

    // Check if verification succeeded
    if (!data.success) {
      console.warn("reCAPTCHA verification failed:", data["error-codes"]);
      return {
        success: false,
        message: "reCAPTCHA verification failed",
        errors: data["error-codes"] || ["Unknown error"],
      };
    }

    // For v3, check score and action
    if (version === "v3") {
      const score = data.score ?? 0;

      // Validate action if provided
      if (expectedAction && data.action !== expectedAction) {
        console.warn(`reCAPTCHA action mismatch. Expected: ${expectedAction}, Got: ${data.action}`);
        return {
          success: false,
          score,
          message: "Invalid reCAPTCHA action",
          errors: ["Action mismatch"],
        };
      }

      // Check if score meets minimum threshold
      if (score < minScore) {
        console.warn(`reCAPTCHA score too low: ${score} (minimum: ${minScore})`);
        return {
          success: false,
          score,
          message: "reCAPTCHA score too low. Please try again.",
          errors: ["Low score - possible bot activity"],
        };
      }

      return {
        success: true,
        score,
        message: "reCAPTCHA verification successful",
      };
    }

    // For v2, just return success
    return {
      success: true,
      message: "reCAPTCHA verification successful",
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      message: "Failed to verify reCAPTCHA",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Verify reCAPTCHA v2 token (checkbox or invisible)
 *
 * @param token - The reCAPTCHA response token
 * @returns Validation result
 *
 * @example
 * const result = await verifyRecaptchaV2(token);
 * if (!result.success) {
 *   return res.status(400).json({ error: "Failed reCAPTCHA verification" });
 * }
 */
export async function verifyRecaptchaV2(token: string): Promise<RecaptchaValidationResult> {
  return verifyRecaptcha(token, "v2");
}

/**
 * Verify reCAPTCHA v3 token with action and score validation
 *
 * @param token - The reCAPTCHA response token
 * @param action - Expected action name
 * @param minScore - Minimum acceptable score (default: 0.5)
 * @returns Validation result
 *
 * @example
 * const result = await verifyRecaptchaV3(token, "submit_contact", 0.7);
 * if (!result.success) {
 *   return res.status(400).json({ error: result.message });
 * }
 */
export async function verifyRecaptchaV3(
  token: string,
  action: string,
  minScore: number = 0.5
): Promise<RecaptchaValidationResult> {
  return verifyRecaptcha(token, "v3", action, minScore);
}

/**
 * Middleware helper to verify reCAPTCHA from request body
 *
 * @param request - The Next.js request object
 * @param version - reCAPTCHA version
 * @param expectedAction - Expected action (for v3)
 * @param minScore - Minimum score (for v3)
 * @returns Validation result
 *
 * @example
 * const recaptchaResult = await verifyRecaptchaFromRequest(req, "v3", "register");
 * if (!recaptchaResult.success) {
 *   return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
 * }
 */
export async function verifyRecaptchaFromRequest(
  request: Request,
  version: "v2" | "v3" = "v3",
  expectedAction?: string,
  minScore?: number
): Promise<RecaptchaValidationResult> {
  try {
    const body = await request.json();
    const token = body.recaptchaToken || body.recaptcha_token || body.token;

    if (!token) {
      return {
        success: false,
        message: "reCAPTCHA token missing from request",
        errors: ["Missing token"],
      };
    }

    return verifyRecaptcha(token, version, expectedAction, minScore);
  } catch (error) {
    console.error("Error parsing request for reCAPTCHA:", error);
    return {
      success: false,
      message: "Invalid request format",
      errors: ["Failed to parse request"],
    };
  }
}

/**
 * Get recommended minimum score for different actions
 * Helps maintain consistent security standards across the app
 *
 * @param action - The action being performed
 * @returns Recommended minimum score
 *
 * @example
 * const minScore = getRecommendedMinScore("payment");
 * const result = await verifyRecaptchaV3(token, "payment", minScore);
 */
export function getRecommendedMinScore(action: string): number {
  const scoreMap: Record<string, number> = {
    // High-risk actions (stricter)
    payment: 0.7,
    register: 0.6,
    login: 0.5,
    password_reset: 0.6,

    // Medium-risk actions
    contact: 0.5,
    comment: 0.5,
    rsvp: 0.5,

    // Low-risk actions (more lenient)
    search: 0.3,
    view: 0.3,
    general: 0.5,
  };

  return scoreMap[action] || 0.5; // Default to 0.5
}

/**
 * Create a reCAPTCHA verification middleware
 * For use in API routes
 *
 * @param version - reCAPTCHA version
 * @param action - Expected action (for v3)
 * @param minScore - Minimum score (for v3)
 * @returns Middleware function
 *
 * @example
 * export async function POST(req: Request) {
 *   const recaptchaMiddleware = createRecaptchaMiddleware("v3", "register", 0.6);
 *   const recaptchaResult = await recaptchaMiddleware(req);
 *
 *   if (!recaptchaResult.success) {
 *     return NextResponse.json({ error: "reCAPTCHA failed" }, { status: 400 });
 *   }
 *
 *   // Continue with request handling...
 * }
 */
export function createRecaptchaMiddleware(
  version: "v2" | "v3" = "v3",
  action?: string,
  minScore?: number
) {
  return async (request: Request): Promise<RecaptchaValidationResult> => {
    return verifyRecaptchaFromRequest(request, version, action, minScore);
  };
}

/**
 * Default export with all verification functions
 */
const recaptchaUtils = {
  verifyRecaptcha,
  verifyRecaptchaV2,
  verifyRecaptchaV3,
  verifyRecaptchaFromRequest,
  getRecommendedMinScore,
  createRecaptchaMiddleware,
};

export default recaptchaUtils;
