#!/usr/bin/env node
/**
 * Environment Validation Script
 *
 * Run this script before deployment to validate all environment variables
 *
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate:env
 */

// This file uses CommonJS for Node.js compatibility
const fs = require("fs");
const path = require("path");

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(colors[color] + message + colors.reset);
}

// Load environment variables
function loadEnv() {
  const envFiles = [".env.local", ".env"];

  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      log(`Loading ${file}...`, "cyan");
      const envContent = fs.readFileSync(envPath, "utf8");

      envContent.split("\n").forEach((line) => {
        const match = line.match(/^([^#][^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });

      return true;
    }
  }

  log("No .env.local or .env file found", "yellow");
  return false;
}

// Required environment variables
const requiredVars = [
  { name: "DATABASE_URL", minLength: 10 },
  { name: "NEXTAUTH_SECRET", minLength: 32 },
  { name: "JWT_SECRET", minLength: 16 },
  { name: "CSRF_SECRET", minLength: 32 },
  { name: "RESEND_API_KEY", startsWith: "re_" },
  { name: "EMAIL_FROM", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { name: "PAYSTACK_SECRET_KEY", startsWith: "sk_" },
  { name: "CLOUDINARY_CLOUD_NAME", minLength: 1 },
  { name: "CLOUDINARY_API_KEY", minLength: 1 },
  { name: "CLOUDINARY_API_SECRET", minLength: 1 },
  { name: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", minLength: 1 },
  { name: "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", minLength: 1 },
  { name: "NEXT_PUBLIC_APP_URL", pattern: /^https?:\/\/.+/ },
];

// Optional but recommended variables
const recommendedVars = [
  "CRON_SECRET",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3",
  "RECAPTCHA_SECRET_KEY_V3",
];

// Validate environment variables
function validateEnvironment() {
  log("\n" + "=".repeat(60), "cyan");
  log("Environment Variable Validation", "cyan");
  log("=".repeat(60) + "\n", "cyan");

  const errors = [];
  const warnings = [];
  let checked = 0;

  // Check required variables
  log("Checking required variables...", "blue");
  for (const varConfig of requiredVars) {
    checked++;
    const value = process.env[varConfig.name];

    if (!value || value.trim() === "") {
      errors.push(`❌ Missing: ${varConfig.name}`);
      continue;
    }

    // Check minimum length
    if (varConfig.minLength && value.length < varConfig.minLength) {
      errors.push(
        `❌ ${varConfig.name}: Too short (${value.length} chars, need ${varConfig.minLength})`
      );
      continue;
    }

    // Check starts with
    if (varConfig.startsWith && !value.startsWith(varConfig.startsWith)) {
      errors.push(
        `❌ ${varConfig.name}: Must start with '${varConfig.startsWith}'`
      );
      continue;
    }

    // Check pattern
    if (varConfig.pattern && !varConfig.pattern.test(value)) {
      errors.push(`❌ ${varConfig.name}: Invalid format`);
      continue;
    }

    log(`  ✓ ${varConfig.name}`, "green");
  }

  // Check recommended variables
  log("\nChecking recommended variables...", "blue");
  for (const varName of recommendedVars) {
    checked++;
    const value = process.env[varName];

    if (!value || value.trim() === "") {
      warnings.push(`⚠️  Missing (optional): ${varName}`);
    } else {
      log(`  ✓ ${varName}`, "green");
    }
  }

  // Print summary
  log("\n" + "=".repeat(60), "cyan");
  log("Summary", "cyan");
  log("=".repeat(60), "cyan");
  log(`Checked: ${checked} variables`);
  log(`Errors: ${errors.length}`, errors.length > 0 ? "red" : "green");
  log(`Warnings: ${warnings.length}`, warnings.length > 0 ? "yellow" : "green");

  if (errors.length > 0) {
    log("\n❌ ERRORS:", "red");
    errors.forEach((err) => log(err, "red"));
  }

  if (warnings.length > 0) {
    log("\n⚠️  WARNINGS:", "yellow");
    warnings.forEach((warn) => log(warn, "yellow"));
  }

  log("\n" + "=".repeat(60) + "\n", "cyan");

  if (errors.length === 0) {
    log("✅ All required environment variables are configured!", "green");
    return true;
  } else {
    log("❌ Please fix the errors above before deploying.", "red");
    return false;
  }
}

// Generate missing secrets
function generateSecrets() {
  const crypto = require("crypto");

  log("\n" + "=".repeat(60), "cyan");
  log("Generate Missing Secrets", "cyan");
  log("=".repeat(60) + "\n", "cyan");

  const secretVars = [
    { name: "NEXTAUTH_SECRET", length: 32 },
    { name: "JWT_SECRET", length: 32 },
    { name: "CSRF_SECRET", length: 32 },
    { name: "CRON_SECRET", length: 32 },
  ];

  const missing = secretVars.filter((v) => !process.env[v.name]);

  if (missing.length === 0) {
    log("All secrets are already configured.", "green");
    return;
  }

  log("Copy these to your .env.local file:\n", "yellow");

  for (const varConfig of missing) {
    const secret = crypto.randomBytes(varConfig.length).toString("hex");
    log(`${varConfig.name}=${secret}`, "cyan");
  }

  log("\n" + "=".repeat(60) + "\n", "cyan");
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  // Load environment variables
  loadEnv();

  // Handle commands
  if (args.includes("--generate-secrets") || args.includes("-g")) {
    generateSecrets();
    return;
  }

  // Validate environment
  const valid = validateEnvironment();

  if (args.includes("--strict")) {
    process.exit(valid ? 0 : 1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, generateSecrets };
