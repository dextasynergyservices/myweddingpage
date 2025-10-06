/**
 * Environment Variable Validator
 *
 * Validates required environment variables at application startup.
 * Prevents runtime errors by catching configuration issues early.
 *
 * Features:
 * - Required variable validation
 * - Format validation (URLs, emails, keys)
 * - Length validation
 * - Environment-specific checks
 * - Detailed error reporting
 *
 * @module env-validator
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checked: number;
  missing: string[];
  invalid: string[];
}

/**
 * Environment variable configuration
 */
interface EnvVarConfig {
  name: string;
  required: boolean;
  validation?: (value: string) => boolean;
  validationMessage?: string;
  minLength?: number;
  environments?: ("development" | "production" | "test")[];
}

/**
 * Environment variable definitions
 */
const envVarDefinitions: EnvVarConfig[] = [
  // Database
  {
    name: "DATABASE_URL",
    required: true,
    validation: (val) => val.startsWith("postgresql://") || val.startsWith("postgres://"),
    validationMessage: "DATABASE_URL must be a valid PostgreSQL connection string",
  },

  // NextAuth
  {
    name: "NEXTAUTH_SECRET",
    required: true,
    minLength: 32,
    validationMessage: "NEXTAUTH_SECRET must be at least 32 characters",
  },
  {
    name: "NEXTAUTH_URL",
    required: false,
    validation: (val) => val.startsWith("http://") || val.startsWith("https://"),
    validationMessage: "NEXTAUTH_URL must be a valid URL",
    environments: ["production"],
  },

  // JWT
  {
    name: "JWT_SECRET",
    required: true,
    minLength: 16,
    validationMessage: "JWT_SECRET must be at least 16 characters",
  },

  // CSRF Protection (Phase 2)
  {
    name: "CSRF_SECRET",
    required: true,
    minLength: 32,
    validationMessage: "CSRF_SECRET must be at least 32 characters for security",
  },

  // reCAPTCHA v2
  {
    name: "NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2",
    required: false,
  },
  {
    name: "RECAPTCHA_SECRET_KEY_V2",
    required: false,
  },

  // reCAPTCHA v3
  {
    name: "NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3",
    required: false,
  },
  {
    name: "RECAPTCHA_SECRET_KEY_V3",
    required: false,
  },

  // Email Service
  {
    name: "RESEND_API_KEY",
    required: true,
    validation: (val) => val.startsWith("re_"),
    validationMessage: "RESEND_API_KEY must start with 're_'",
  },
  {
    name: "EMAIL_FROM",
    required: true,
    validation: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    validationMessage: "EMAIL_FROM must be a valid email address",
  },

  // Payment Providers
  {
    name: "PAYSTACK_SECRET_KEY",
    required: true,
    validation: (val) => val.startsWith("sk_"),
    validationMessage: "PAYSTACK_SECRET_KEY must start with 'sk_'",
  },
  {
    name: "STRIPE_SECRET_KEY",
    required: false,
    validation: (val) => val.startsWith("sk_"),
    validationMessage: "STRIPE_SECRET_KEY must start with 'sk_'",
  },

  // Cloudinary
  {
    name: "CLOUDINARY_CLOUD_NAME",
    required: true,
  },
  {
    name: "CLOUDINARY_API_KEY",
    required: true,
  },
  {
    name: "CLOUDINARY_API_SECRET",
    required: true,
  },
  {
    name: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    required: true,
  },
  {
    name: "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
    required: true,
  },

  // OpenAI (for AI features)
  {
    name: "OPENAI_API_KEY",
    required: false,
    validation: (val) => val.startsWith("sk-"),
    validationMessage: "OPENAI_API_KEY must start with 'sk-'",
  },

  // Twilio (for WhatsApp)
  {
    name: "TWILIO_ACCOUNT_SID",
    required: false,
  },
  {
    name: "TWILIO_AUTH_TOKEN",
    required: false,
  },
  {
    name: "TWILIO_WHATSAPP_NUMBER",
    required: false,
  },

  // Public App URL
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: true,
    validation: (val) => val.startsWith("http://") || val.startsWith("https://"),
    validationMessage: "NEXT_PUBLIC_APP_URL must be a valid URL",
  },

  // Cron Job Secret
  {
    name: "CRON_SECRET",
    required: false,
    minLength: 16,
    validationMessage: "CRON_SECRET should be at least 16 characters",
    environments: ["production"],
  },

  // Google OAuth (optional)
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
  },

  // Canva API (optional)
  {
    name: "CANVA_CLIENT_ID",
    required: false,
  },
  {
    name: "CANVA_CLIENT_SECRET",
    required: false,
  },

  // Unsplash API (optional)
  {
    name: "UNSPLASH_ACCESS_KEY",
    required: false,
  },
];

/**
 * Get current environment
 */
function getCurrentEnvironment(): "development" | "production" | "test" {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") return "production";
  if (env === "test") return "test";
  return "development";
}

/**
 * Validate a single environment variable
 */
function validateEnvVar(config: EnvVarConfig): {
  valid: boolean;
  error?: string;
  warning?: string;
} {
  const value = process.env[config.name];

  // Check if variable exists
  if (!value || value.trim() === "") {
    if (config.required) {
      return {
        valid: false,
        error: `Missing required environment variable: ${config.name}`,
      };
    }
    return { valid: true }; // Optional variable can be missing
  }

  // Check minimum length
  if (config.minLength && value.length < config.minLength) {
    return {
      valid: false,
      error: `${config.name} must be at least ${config.minLength} characters (current: ${value.length})`,
    };
  }

  // Run custom validation
  if (config.validation && !config.validation(value)) {
    return {
      valid: false,
      error: config.validationMessage || `Invalid value for ${config.name}`,
    };
  }

  return { valid: true };
}

/**
 * Validate all environment variables
 *
 * @returns Validation result
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];
  const invalid: string[] = [];
  let checked = 0;

  const currentEnv = getCurrentEnvironment();

  for (const config of envVarDefinitions) {
    // Skip if not required for current environment
    if (config.environments && !config.environments.includes(currentEnv)) {
      continue;
    }

    checked++;
    const result = validateEnvVar(config);

    if (!result.valid) {
      if (result.error) {
        errors.push(result.error);
        if (!process.env[config.name]) {
          missing.push(config.name);
        } else {
          invalid.push(config.name);
        }
      }
    }

    if (result.warning) {
      warnings.push(result.warning);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checked,
    missing,
    invalid,
  };
}

/**
 * Validate and throw if invalid
 *
 * Use this at application startup to ensure all required env vars are set
 *
 * @throws Error if validation fails
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    const errorMessage = [
      "❌ Environment validation failed!",
      "",
      `Checked: ${result.checked} variables`,
      `Missing: ${result.missing.length}`,
      `Invalid: ${result.invalid.length}`,
      "",
      "Errors:",
      ...result.errors.map((err) => `  - ${err}`),
    ].join("\n");

    throw new Error(errorMessage);
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️ Environment warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  console.log(`✅ Environment validation passed (${result.checked} variables checked)`);
}

/**
 * Get validation report as string
 *
 * @returns Formatted validation report
 */
export function getValidationReport(): string {
  const result = validateEnvironment();
  const currentEnv = getCurrentEnvironment();

  const lines = [
    "=".repeat(60),
    "Environment Variable Validation Report",
    "=".repeat(60),
    "",
    `Environment: ${currentEnv}`,
    `Checked: ${result.checked} variables`,
    `Status: ${result.valid ? "✅ PASSED" : "❌ FAILED"}`,
    "",
  ];

  if (result.errors.length > 0) {
    lines.push(`Errors (${result.errors.length}):`);
    result.errors.forEach((error) => lines.push(`  ❌ ${error}`));
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push(`Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning) => lines.push(`  ⚠️ ${warning}`));
    lines.push("");
  }

  if (result.missing.length > 0) {
    lines.push(`Missing Variables (${result.missing.length}):`);
    result.missing.forEach((name) => lines.push(`  - ${name}`));
    lines.push("");
  }

  if (result.invalid.length > 0) {
    lines.push(`Invalid Variables (${result.invalid.length}):`);
    result.invalid.forEach((name) => lines.push(`  - ${name}`));
    lines.push("");
  }

  if (result.valid) {
    lines.push("✅ All required environment variables are properly configured!");
  } else {
    lines.push("❌ Please fix the errors above before running the application.");
  }

  lines.push("=".repeat(60));

  return lines.join("\n");
}

/**
 * Check service connectivity
 *
 * Tests connections to external services
 */
export async function checkServiceConnectivity(): Promise<{
  database: boolean;
  email: boolean;
  cloudinary: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let database = false;
  let email = false;
  let cloudinary = false;

  // Test database connection
  try {
    const { PrismaClient } = await import("@/generated/prisma");
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    database = true;
  } catch (error) {
    errors.push(
      `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Test email service (Resend)
  try {
    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "test@example.com",
          to: "test@resend.dev", // Resend test email
          subject: "Connection Test",
          html: "<p>Test</p>",
        }),
      });

      // Even if email fails to send, API connection is verified
      email = response.status !== 401 && response.status !== 403;

      if (!email) {
        errors.push("Email service authentication failed - check RESEND_API_KEY");
      }
    }
  } catch (error) {
    errors.push(
      `Email service connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Test Cloudinary (just check if credentials are set)
  try {
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary = true;
    } else {
      errors.push("Cloudinary credentials not configured");
    }
  } catch (error) {
    errors.push(
      `Cloudinary check failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return {
    database,
    email,
    cloudinary,
    errors,
  };
}

/**
 * Generate a secure random secret
 *
 * Helper for generating secrets for env vars
 *
 * @param length - Length of secret (default: 32)
 * @returns Random hex string
 */
export function generateSecret(length: number = 32): string {
  // Use dynamic require wrapped in try-catch for Next.js compatibility
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    return crypto.randomBytes(length).toString("hex");
  } catch {
    // Fallback to basic random string if crypto not available
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }
}

const envValidatorFunctions = {
  validateEnvironment,
  validateEnvironmentOrThrow,
  getValidationReport,
  checkServiceConnectivity,
  generateSecret,
};

export default envValidatorFunctions;
