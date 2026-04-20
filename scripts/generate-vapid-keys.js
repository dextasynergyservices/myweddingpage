/**
 * VAPID Key Generator for Push Notifications
 * Generate VAPID keys for web push notifications
 * Run with: node scripts/generate-vapid-keys.js
 */

const webPush = require("web-push");
const fs = require("fs");
const path = require("path");

console.log("🔑 Generating VAPID keys for Push Notifications...\n");

// Generate VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();

console.log("✅ VAPID keys generated successfully!\n");
console.log("📋 Add these to your .env.local file:\n");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey);
console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
console.log("   1. NEVER commit the private key to version control");
console.log("   2. The public key can be safely shared with clients");
console.log(
  "   3. Generate new keys for each environment (dev, staging, prod)"
);
console.log("   4. Store private keys securely (use secrets management)");

// Optionally save to a file (for reference, not for production)
const envExample = `
# PWA Push Notification Keys (Web Push)
# Public key - safe to expose to clients
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}

# Private key - KEEP SECRET, never commit to git
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}

# Email for VAPID (mailto: URI)
VAPID_SUBJECT=mailto:your-email@example.com
`;

const outputPath = path.join(__dirname, "../.env.vapid.example");
fs.writeFileSync(outputPath, envExample.trim());

console.log(`\n📄 Example saved to: ${outputPath}`);
console.log("   Copy these values to your .env.local file");
