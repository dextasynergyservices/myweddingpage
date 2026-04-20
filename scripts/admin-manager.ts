#!/usr/bin/env tsx
/**
 * Admin Management Script
 * CLI tool to promote/demote users to/from admin role
 *
 * Usage:
 *   pnpm admin:promote <email>
 *   pnpm admin:demote <email>
 *   pnpm admin:list
 *   pnpm admin:check <email>
 */

import { PrismaClient } from "../src/generated/prisma";

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
 * Promote a user to admin role
 */
async function promoteToAdmin(email: string): Promise<void> {
  try {
    info(`Searching for user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        groomName: true,
        brideName: true,
      },
    });

    if (!user) {
      error(`User not found: ${email}`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      warning(`User ${email} is already an admin!`);
      return;
    }

    info(`Found user: ${user.groomName || user.brideName || email}`);
    info("Promoting to admin...");

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    success(`User ${email} has been promoted to ADMIN! 🎉`);
    info(`User ID: ${user.id}`);
  } catch (err) {
    error(
      `Failed to promote user: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}

/**
 * Demote an admin to regular user
 */
async function demoteFromAdmin(email: string): Promise<void> {
  try {
    info(`Searching for user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        groomName: true,
        brideName: true,
      },
    });

    if (!user) {
      error(`User not found: ${email}`);
      process.exit(1);
    }

    if (user.role !== "ADMIN") {
      warning(`User ${email} is not an admin!`);
      return;
    }

    // Count remaining admins
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount === 1) {
      error("Cannot demote the last admin! Promote another user first.");
      process.exit(1);
    }

    info(`Found user: ${user.groomName || user.brideName || email}`);
    info("Demoting from admin...");

    await prisma.user.update({
      where: { email },
      data: { role: "USER" },
    });

    success(`User ${email} has been demoted to USER`);
    info(`Remaining admins: ${adminCount - 1}`);
  } catch (err) {
    error(
      `Failed to demote user: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}

/**
 * List all admin users
 */
async function listAdmins(): Promise<void> {
  try {
    info("Fetching all admin users...\n");

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        created_at: true,
      },
      orderBy: { created_at: "asc" },
    });

    if (admins.length === 0) {
      warning("No admin users found!");
      info("Use 'pnpm admin:promote <email>' to promote a user to admin");
      return;
    }

    log(`\n${"=".repeat(80)}`, "cyan");
    log("ADMIN USERS", "bright");
    log(`${"=".repeat(80)}\n`, "cyan");

    admins.forEach((admin, index) => {
      const name =
        [admin.groomName, admin.brideName].filter(Boolean).join(" & ") || "N/A";

      log(`${index + 1}. ${name}`, "bright");
      log(`   Email:      ${admin.email}`, "cyan");
      log(`   User ID:    ${admin.id}`, "cyan");
      log(`   Created:    ${admin.created_at.toLocaleDateString()}`, "cyan");
      log("");
    });

    success(`Total admins: ${admins.length}`);
  } catch (err) {
    error(
      `Failed to list admins: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}

/**
 * Check if a user is an admin
 */
async function checkAdmin(email: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        groomName: true,
        brideName: true,
        created_at: true,
      },
    });

    if (!user) {
      error(`User not found: ${email}`);
      process.exit(1);
    }

    const name =
      [user.groomName, user.brideName].filter(Boolean).join(" & ") || "N/A";

    log(`\n${"=".repeat(60)}`, "cyan");
    log("USER INFORMATION", "bright");
    log(`${"=".repeat(60)}\n`, "cyan");

    log(`Name:     ${name}`, "cyan");
    log(`Email:    ${user.email}`, "cyan");
    log(`User ID:  ${user.id}`, "cyan");
    log(`Role:     ${user.role}`, user.role === "ADMIN" ? "green" : "yellow");
    log(`Created:  ${user.created_at.toLocaleDateString()}`, "cyan");
    log("");

    if (user.role === "ADMIN") {
      success("This user is an ADMIN ✅");
    } else {
      info("This user is a regular USER");
      info(`Use 'pnpm admin:promote ${email}' to promote to admin`);
    }
  } catch (err) {
    error(
      `Failed to check user: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  log(`\n${"=".repeat(80)}`, "cyan");
  log("ADMIN MANAGEMENT CLI", "bright");
  log(`${"=".repeat(80)}\n`, "cyan");

  log("USAGE:", "bright");
  log("  pnpm admin:promote <email>   - Promote user to admin", "green");
  log("  pnpm admin:demote <email>    - Demote admin to user", "yellow");
  log("  pnpm admin:list              - List all admin users", "blue");
  log("  pnpm admin:check <email>     - Check user's admin status", "cyan");
  log("");

  log("EXAMPLES:", "bright");
  log("  pnpm admin:promote eeyuren1@gmail.com");
  log("  pnpm admin:demote eeyuren1@gmail.com");
  log("  pnpm admin:list");
  log("  pnpm admin:check eeyuren1@gmail.com");
  log("");
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];

  try {
    switch (command) {
      case "promote":
        if (!email) {
          error("Email required!");
          info("Usage: pnpm admin:promote <email>");
          process.exit(1);
        }
        await promoteToAdmin(email);
        break;

      case "demote":
        if (!email) {
          error("Email required!");
          info("Usage: pnpm admin:demote <email>");
          process.exit(1);
        }
        await demoteFromAdmin(email);
        break;

      case "list":
        await listAdmins();
        break;

      case "check":
        if (!email) {
          error("Email required!");
          info("Usage: pnpm admin:check <email>");
          process.exit(1);
        }
        await checkAdmin(email);
        break;

      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;

      default:
        warning("Invalid command!");
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    error(
      `Command failed: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the CLI
main();
