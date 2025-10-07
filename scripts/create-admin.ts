#!/usr/bin/env tsx
/**
 * Create Admin User Script
 * Creates a new admin user directly in the database
 *
 * Usage:
 *   pnpm admin:create
 */

import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message: string) {
  log(`❌ Error: ${message}`, "red");
}

function success(message: string) {
  log(`✅ ${message}`, "green");
}

function info(message: string) {
  log(`ℹ️  ${message}`, "blue");
}

function warning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

/**
 * Create readline interface for user input
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt user for input
 */
function prompt(question: string): Promise<string> {
  const rl = createInterface();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create a new admin user
 */
async function createAdminUser() {
  try {
    log(`\n${"=".repeat(80)}`, "cyan");
    log("CREATE ADMIN USER", "bright");
    log(`${"=".repeat(80)}\n`, "cyan");

    // Get user details
    const email = await prompt("Enter admin email: ");
    if (!email) {
      error("Email is required!");
      process.exit(1);
    }

    if (!isValidEmail(email)) {
      error("Invalid email format!");
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { email: true, role: true },
    });

    if (existingUser) {
      if (existingUser.role === "ADMIN") {
        warning(`User ${email} already exists and is already an admin!`);
        process.exit(0);
      } else {
        warning(`User ${email} already exists as a regular user.`);
        const promote = await prompt("Promote to admin? (y/n): ");
        if (promote.toLowerCase() === "y" || promote.toLowerCase() === "yes") {
          await prisma.user.update({
            where: { email },
            data: { role: "ADMIN" },
          });
          success(`User ${email} has been promoted to ADMIN! 🎉`);
          process.exit(0);
        } else {
          info("Operation cancelled.");
          process.exit(0);
        }
      }
    }

    const password = await prompt("Enter admin password: ");
    if (!password) {
      error("Password is required!");
      process.exit(1);
    }

    if (password.length < 8) {
      error("Password must be at least 8 characters long!");
      process.exit(1);
    }

    const groomName = await prompt("Enter groom name (optional): ");
    const brideName = await prompt("Enter bride name (optional): ");

    // Confirm details
    log("\n" + "=".repeat(60), "cyan");
    log("CONFIRM DETAILS:", "bright");
    log("=".repeat(60), "cyan");
    log(`Email:      ${email}`, "cyan");
    log(`Password:   ${"*".repeat(password.length)}`, "cyan");
    log(`Groom:      ${groomName || "N/A"}`, "cyan");
    log(`Bride:      ${brideName || "N/A"}`, "cyan");
    log(`Role:       ADMIN`, "green");
    log("=".repeat(60) + "\n", "cyan");

    const confirm = await prompt("Create this admin user? (y/n): ");
    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      info("Operation cancelled.");
      process.exit(0);
    }

    info("Creating admin user...");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        groomName: groomName || null,
        brideName: brideName || null,
        role: "ADMIN",
        emailVerified: new Date(), // Auto-verify admin user
      },
      select: {
        id: true,
        email: true,
        role: true,
        groomName: true,
        brideName: true,
      },
    });

    log("\n" + "=".repeat(80), "green");
    success("ADMIN USER CREATED SUCCESSFULLY! 🎉");
    log("=".repeat(80), "green");
    log(`\nUser ID:    ${newUser.id}`, "cyan");
    log(`Email:      ${newUser.email}`, "cyan");
    log(`Role:       ${newUser.role}`, "green");
    log(`Status:     Email Verified ✅`, "green");
    log("\n" + "=".repeat(80), "cyan");
    log("NEXT STEPS:", "bright");
    log("=".repeat(80), "cyan");
    log("1. Start the server:        pnpm dev", "yellow");
    log("2. Login at:                http://localhost:3000/login", "yellow");
    log("3. Access admin dashboard:  http://localhost:3000/dashboard/admin", "yellow");
    log("=".repeat(80) + "\n", "cyan");
  } catch (err) {
    error(`Failed to create admin user: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();
