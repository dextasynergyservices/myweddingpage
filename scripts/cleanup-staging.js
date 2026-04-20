#!/usr/bin/env node
/**
 * Cleanup staging directories older than a configured retention period.
 *
 * Usage:
 *   node scripts/cleanup-staging.js [--days=7] [--root=./staging]
 *
 * Environment variables:
 *   TEMPLATE_STAGING_ROOT - overrides root directory
 *   TEMPLATE_STAGING_RETENTION_DAYS - overrides retention days
 */

const fs = require("fs");
const path = require("path");

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const m = arg.match(/^--([a-zA-Z0-9_-]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  });
  return args;
}

async function run() {
  const args = parseArgs();
  const root =
    process.env.TEMPLATE_STAGING_ROOT ||
    args.root ||
    path.join(process.cwd(), "staging");
  const retentionDays = parseInt(
    process.env.TEMPLATE_STAGING_RETENTION_DAYS || args.days || "7",
    10
  );
  const now = Date.now();
  const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;

  if (!fs.existsSync(root)) {
    console.log(`Staging root does not exist: ${root}`);
    process.exit(0);
  }

  const entries = fs.readdirSync(root);
  let removed = 0;

  for (const name of entries) {
    const full = path.join(root, name);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const mtime = stat.mtime.getTime();
        if (mtime < cutoff) {
          // remove recursively
          fs.rmSync(full, { recursive: true, force: true });
          console.log(`Removed staging folder: ${full}`);
          removed++;
        }
      }
    } catch (err) {
      console.error(`Error processing ${full}:`, err.message || err);
    }
  }

  console.log(
    `Cleanup complete. Removed ${removed} folders older than ${retentionDays} days.`
  );
}

run().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
