/**
 * Font utilities for dynamic loading and CSS generation
 * Handles Google Fonts integration and CSS variable application
 */

import type { FontScheme, FontWeight } from "@/types/customization";
import type { FontDefinition } from "./font-library";
import { getFontByFamily } from "./font-library";

// ============================================================================
// GOOGLE FONTS LOADING
// ============================================================================

/**
 * Build Google Fonts URL for multiple fonts
 */
export const buildGoogleFontsUrl = (fonts: FontDefinition[]): string => {
  if (fonts.length === 0) return "";

  const families = fonts.map((font) => {
    const weights = font.weights.join(";");
    return `family=${font.googleFontId}:wght@${weights}`;
  });

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
};

/**
 * Font loading cache to prevent duplicate loads
 */
const loadedFonts = new Set<string>();

/**
 * Load Google Fonts dynamically with preload optimization
 */
export const loadGoogleFonts = (fonts: FontDefinition[]): Promise<void> => {
  return new Promise((resolve) => {
    // Filter out already loaded fonts
    const fontsToLoad = fonts.filter((font) => !loadedFonts.has(font.family));

    if (fontsToLoad.length === 0) {
      resolve();
      return;
    }

    // Check if fonts are already loaded
    const existingLink = document.querySelector(
      'link[data-font-loader="custom"]'
    );
    if (existingLink) {
      existingLink.remove();
    }

    const url = buildGoogleFontsUrl(fontsToLoad);

    // Create preload link for faster loading
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "style";
    preloadLink.href = url;
    document.head.appendChild(preloadLink);

    // Create stylesheet link with font-display: swap
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute("data-font-loader", "custom");

    // Handle load event
    link.onload = () => {
      fontsToLoad.forEach((font) => loadedFonts.add(font.family));
      resolve();
    };

    // Handle error
    link.onerror = () => {
      console.error(
        "Failed to load fonts:",
        fontsToLoad.map((f) => f.family)
      );
      resolve(); // Resolve anyway to prevent hanging
    };

    // Add to document head
    document.head.appendChild(link);
  });
};

/**
 * Load fonts from FontScheme (async version with preloading)
 */
export const loadFontsFromScheme = async (
  scheme: FontScheme
): Promise<void> => {
  const fonts: FontDefinition[] = [];

  // Get font definitions
  const headingFont = getFontByFamily(scheme.heading);
  const bodyFont = getFontByFamily(scheme.body);
  const scriptFont = getFontByFamily(scheme.script);

  if (headingFont) fonts.push(headingFont);
  if (bodyFont) fonts.push(bodyFont);
  if (scriptFont) fonts.push(scriptFont);

  // Load unique fonts
  const uniqueFonts = Array.from(
    new Map(fonts.map((font) => [font.family, font])).values()
  );

  await loadGoogleFonts(uniqueFonts);

  // Wait for fonts to actually be ready
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
};

/**
 * Preload a single font for preview (async with optimization)
 */
export const preloadFont = async (font: FontDefinition): Promise<void> => {
  if (loadedFonts.has(font.family)) {
    return; // Already loaded
  }

  const url = buildGoogleFontsUrl([font]);

  // Check if already loaded
  const existing = document.querySelector(
    `link[href="${url}"]`
  ) as HTMLLinkElement;
  if (existing) {
    loadedFonts.add(font.family);
    return;
  }

  // Create preload link
  const preloadLink = document.createElement("link");
  preloadLink.rel = "preload";
  preloadLink.as = "style";
  preloadLink.href = url;
  document.head.appendChild(preloadLink);

  // Create stylesheet link
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.setAttribute("data-font-preview", font.family);

  await new Promise<void>((resolve) => {
    link.onload = () => {
      loadedFonts.add(font.family);
      resolve();
    };
    link.onerror = () => {
      console.error("Failed to preload font:", font.family);
      resolve();
    };
    document.head.appendChild(link);
  });
};

/**
 * Clear font loading cache
 */
export const clearFontCache = (): void => {
  loadedFonts.clear();
};

// ============================================================================
// CSS VARIABLE GENERATION
// ============================================================================

/**
 * Generate CSS font family with fallback
 */
export const generateFontFamily = (font: FontDefinition): string => {
  return `"${font.family}", ${font.fallback}`;
};

/**
 * Apply font scheme to CSS variables
 */
export const applyFontSchemeToCss = (scheme: FontScheme): void => {
  const root = document.documentElement;

  // Get font definitions
  const headingFont = getFontByFamily(scheme.heading);
  const bodyFont = getFontByFamily(scheme.body);
  const scriptFont = getFontByFamily(scheme.script);

  // Apply to CSS variables
  if (headingFont) {
    root.style.setProperty("--font-heading", generateFontFamily(headingFont));
  }
  if (bodyFont) {
    root.style.setProperty("--font-body", generateFontFamily(bodyFont));
  }
  if (scriptFont) {
    root.style.setProperty("--font-script", generateFontFamily(scriptFont));
  }
};

/**
 * Generate complete CSS for font scheme
 */
export const generateFontCss = (scheme: FontScheme): string => {
  const headingFont = getFontByFamily(scheme.heading);
  const bodyFont = getFontByFamily(scheme.body);
  const scriptFont = getFontByFamily(scheme.script);

  let css = ":root {\n";

  if (headingFont) {
    css += `  --font-heading: ${generateFontFamily(headingFont)};\n`;
  }
  if (bodyFont) {
    css += `  --font-body: ${generateFontFamily(bodyFont)};\n`;
  }
  if (scriptFont) {
    css += `  --font-script: ${generateFontFamily(scriptFont)};\n`;
  }

  css += "}\n\n";

  // Add font classes
  css += "h1, h2, h3, h4, h5, h6 {\n";
  css += "  font-family: var(--font-heading);\n";
  css += "}\n\n";

  css += "body, p, div {\n";
  css += "  font-family: var(--font-body);\n";
  css += "}\n\n";

  css += ".font-script {\n";
  css += "  font-family: var(--font-script);\n";
  css += "}\n";

  return css;
};

// ============================================================================
// FONT PAIRING VALIDATION
// ============================================================================

/**
 * Check if font pairing is good
 * Good pairings: serif + sans-serif, display + sans-serif, etc.
 */
export const validateFontPairing = (
  heading: FontDefinition,
  body: FontDefinition
): {
  valid: boolean;
  recommendation?: string;
} => {
  // Same font is OK if it has multiple weights
  if (heading.family === body.family) {
    if (heading.weights.length >= 3) {
      return { valid: true };
    }
    return {
      valid: false,
      recommendation: "Try using different fonts for heading and body",
    };
  }

  // Serif + Sans-serif is classic
  if (
    (heading.category === "serif" && body.category === "sans-serif") ||
    (heading.category === "sans-serif" && body.category === "serif")
  ) {
    return { valid: true };
  }

  // Display + Sans-serif works well
  if (heading.category === "display" && body.category === "sans-serif") {
    return { valid: true };
  }

  // Script should not be used for headings or body (only accent)
  if (heading.category === "script" || body.category === "script") {
    return {
      valid: false,
      recommendation: "Script fonts are best used for accents only",
    };
  }

  // Same category is OK but not ideal
  if (heading.category === body.category) {
    return {
      valid: true,
      recommendation: "Consider mixing serif and sans-serif for contrast",
    };
  }

  return { valid: true };
};

/**
 * Get font pairing score (0-100)
 */
export const getFontPairingScore = (
  heading: FontDefinition,
  body: FontDefinition,
  accent: FontDefinition
): number => {
  let score = 50; // Base score

  // Bonus for classic pairings
  if (
    (heading.category === "serif" && body.category === "sans-serif") ||
    (heading.category === "sans-serif" && body.category === "serif")
  ) {
    score += 20;
  }

  // Bonus for display + sans-serif
  if (heading.category === "display" && body.category === "sans-serif") {
    score += 15;
  }

  // Bonus for script accent
  if (accent.category === "script") {
    score += 15;
  }

  // Penalty for script in heading/body
  if (heading.category === "script" || body.category === "script") {
    score -= 30;
  }

  // Penalty for all same category
  if (heading.category === body.category && body.category === accent.category) {
    score -= 10;
  }

  // Bonus for popular fonts
  if (heading.popular) score += 5;
  if (body.popular) score += 5;
  if (accent.popular) score += 5;

  return Math.max(0, Math.min(100, score));
};

// ============================================================================
// FONT LOADING HELPERS
// ============================================================================

/**
 * Check if a font is loaded
 */
export const isFontLoaded = (fontFamily: string): Promise<boolean> => {
  if (!document.fonts) {
    // Fallback for browsers without FontFace API
    return Promise.resolve(false);
  }

  return document.fonts.load(`16px "${fontFamily}"`).then(() => {
    return document.fonts.check(`16px "${fontFamily}"`);
  });
};

/**
 * Wait for fonts to load
 */
export const waitForFontsToLoad = (fonts: FontDefinition[]): Promise<void> => {
  const promises = fonts.map((font) => isFontLoaded(font.family));
  return Promise.all(promises).then(() => {});
};

/**
 * Get loaded fonts count
 */
export const getLoadedFontsCount = async (
  fonts: FontDefinition[]
): Promise<number> => {
  const results = await Promise.all(
    fonts.map((font) => isFontLoaded(font.family))
  );
  return results.filter((loaded) => loaded).length;
};

// ============================================================================
// FONT WEIGHT UTILITIES
// ============================================================================

/**
 * Get human-readable weight name
 */
export const getWeightName = (weight: FontWeight): string => {
  const names: Record<FontWeight, string> = {
    "300": "Light",
    "400": "Regular",
    "500": "Medium",
    "600": "Semi Bold",
    "700": "Bold",
    "800": "Extra Bold",
    "900": "Black",
  };
  return names[weight] || weight;
};

/**
 * Get recommended weight for use case
 */
export const getRecommendedWeight = (
  font: FontDefinition,
  useCase: "heading" | "body" | "accent"
): FontWeight => {
  const { weights } = font;

  switch (useCase) {
    case "heading":
      // Prefer bold weights (600-900)
      return (
        weights.find((w) => ["700", "800", "900"].includes(w)) ||
        weights[weights.length - 1]
      );

    case "body":
      // Prefer normal weights (400-500)
      return weights.find((w) => ["400", "500"].includes(w)) || weights[0];

    case "accent":
      // Use default weight
      return weights[0];

    default:
      return weights[0];
  }
};

// ============================================================================
// FONT FALLBACK STACKS
// ============================================================================

/**
 * Get system font fallback stack
 */
export const getSystemFontStack = (category: string): string => {
  const stacks: Record<string, string> = {
    serif: 'Georgia, "Times New Roman", Times, serif',
    "sans-serif":
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    script: '"Brush Script MT", cursive',
    display: 'Georgia, "Times New Roman", Times, serif',
    monospace: '"Courier New", Courier, monospace',
  };

  return stacks[category] || stacks["sans-serif"];
};

/**
 * Generate font stack with fallbacks
 */
export const generateFontStack = (font: FontDefinition): string => {
  return `"${font.family}", ${getSystemFontStack(font.category)}`;
};
