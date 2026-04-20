/**
 * PWA Icon Generator
 * Generates all required PWA icons from the logo
 * Run with: pnpm generate:icons
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Icon sizes to generate
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

const INPUT_LOGO = path.join(__dirname, "../public/logoicon.png");
const OUTPUT_DIR = path.join(__dirname, "../public/icons");

async function generateIcons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(INPUT_LOGO)) {
      console.error("❌ Logo not found at:", INPUT_LOGO);
      console.log("💡 Please ensure public/logoicon.png exists");
      process.exit(1);
    }

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log("🎨 Generating PWA icons from logo...\n");

    // Generate standard icons
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      await sharp(INPUT_LOGO)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Generate maskable icons (with safe zone padding)
    for (const size of MASKABLE_SIZES) {
      const paddedSize = Math.round(size * 1.2); // 20% padding
      const outputPath = path.join(
        OUTPUT_DIR,
        `icon-maskable-${size}x${size}.png`
      );

      await sharp(INPUT_LOGO)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .extend({
          top: Math.round((paddedSize - size) / 2),
          bottom: Math.round((paddedSize - size) / 2),
          left: Math.round((paddedSize - size) / 2),
          right: Math.round((paddedSize - size) / 2),
          background: { r: 99, g: 102, b: 241, alpha: 1 }, // theme color
        })
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon-maskable-${size}x${size}.png`);
    }

    console.log("\n🎉 All PWA icons generated successfully!");
    console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
    console.log("\n💡 Next steps:");
    console.log("   1. Review icons in public/icons/");
    console.log("   2. Test your PWA with: pnpm dev");
    console.log(
      "   3. Validate manifest at: https://manifest-validator.appspot.com/"
    );
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    process.exit(1);
  }
}

// Run the generator
generateIcons();
