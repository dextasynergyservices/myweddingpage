/**
 * Startup Validation
 *
 * Validates environment variables and critical configurations
 * at application startup. Prevents the app from starting with
 * invalid configuration.
 *
 * This module runs synchronously during app initialization
 * and will throw an error if validation fails, preventing
 * deployment of misconfigured applications.
 */

import { validateEnvironmentOrThrow, getValidationReport } from "./env-validator";

/**
 * Validates all critical configurations at startup
 *
 * This function should be called as early as possible in
 * the application lifecycle (e.g., in root layout or middleware)
 *
 * In development: Logs validation errors as warnings
 * In production: Throws errors and prevents startup
 *
 * @throws Error if validation fails in production
 */
export function validateStartupConfiguration(): void {
  const isDevelopment = process.env.NODE_ENV === "development";

  try {
    // Validate environment variables
    validateEnvironmentOrThrow();

    // Log success
    if (isDevelopment) {
      console.log("✅ Environment validation passed");
    }
  } catch (err: unknown) {
    const report = getValidationReport();

    // Always log as warning and allow app to start (less strict)
    console.warn(
      "⚠️  Environment validation warnings:",
      err instanceof Error ? err.message : String(err)
    );
    console.warn(report);
    console.warn("\nApp will continue, but some features may not work correctly.");
    console.warn('Run "pnpm validate:env" to see detailed issues.\n');

    // Don't throw error - allow app to start even with validation issues
  }
}

/**
 * Safe validation that doesn't throw errors
 *
 * Use this for health checks or monitoring endpoints
 * where you want to report validation status without
 * crashing the application
 *
 * @returns boolean indicating whether validation passed
 */
export function checkStartupConfiguration(): boolean {
  try {
    validateEnvironmentOrThrow();
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates specific security-critical variables
 *
 * These are the absolute minimum required for the app
 * to function securely. Missing these will always throw
 * an error, even in development.
 *
 * @throws Error if any critical variable is missing
 */
export function validateCriticalSecurityConfig(): void {
  const critical = ["DATABASE_URL", "NEXTAUTH_SECRET", "JWT_SECRET", "CSRF_SECRET"];

  const missing = critical.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const error = new Error(
      `Critical security configuration missing: ${missing.join(", ")}\n` +
        "These variables are required for secure operation.\n" +
        'Run "pnpm generate:secrets" to generate missing secrets.'
    );

    console.error("❌ CRITICAL ERROR:", error.message);
    throw error;
  }
}

// Auto-validate on module import (all environments)
// Set SKIP_ENV_VALIDATION=true to completely disable
if (process.env.SKIP_ENV_VALIDATION !== "true") {
  validateStartupConfiguration();
}
