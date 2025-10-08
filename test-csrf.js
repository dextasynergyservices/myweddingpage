const crypto = require("crypto");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const secret = process.env.CSRF_SECRET || "fallback-secret";

console.log("CSRF_SECRET exists:", !!process.env.CSRF_SECRET);
console.log("Secret (first 20 chars):", secret.substring(0, 20) + "...");

// Generate a token
const tokenPart = crypto.randomBytes(32).toString("base64url");
const timestamp = Date.now();
const hmac = crypto.createHmac("sha256", secret);
hmac.update(`${tokenPart}.${timestamp}`);
const signature = hmac.digest("base64url");
const fullToken = `${tokenPart}.${timestamp}.${signature}`;

console.log("\n=== Token Generation ===");
console.log("Token part:", tokenPart.substring(0, 20) + "...");
console.log("Timestamp:", timestamp);
console.log("Signature:", signature.substring(0, 20) + "...");
console.log("Full token (first 50 chars):", fullToken.substring(0, 50) + "...");
console.log("Token parts count:", fullToken.split(".").length);

// Validate the token
console.log("\n=== Token Validation ===");
const parts = fullToken.split(".");
const [tokenPartValidate, timestampPartValidate, providedSignature] = parts;
const timestampValidate = parseInt(timestampPartValidate, 10);

const hmacValidate = crypto.createHmac("sha256", secret);
hmacValidate.update(`${tokenPartValidate}.${timestampValidate}`);
const expectedSignature = hmacValidate.digest("base64url");

const isValid = crypto.timingSafeEqual(
  Buffer.from(providedSignature),
  Buffer.from(expectedSignature)
);

console.log("Token is valid:", isValid);
console.log("Age (seconds):", Math.floor((Date.now() - timestampValidate) / 1000));
console.log("Expected signature:", expectedSignature.substring(0, 20) + "...");
console.log("Provided signature:", providedSignature.substring(0, 20) + "...");
console.log("Signatures match:", expectedSignature === providedSignature);
