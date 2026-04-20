/**
 * Color utility functions for validation, conversion, and accessibility checks
 */

import {
  RGBColor,
  HSLColor,
  ColorValidationResult,
  ContrastCheckResult,
} from "@/types/customization";

// ============================================================================
// COLOR VALIDATION
// ============================================================================

/**
 * Validates a hex color code
 * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) formats
 */
export function isValidHex(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Validates an RGB color string
 * Supports: "rgb(255, 255, 255)" or "255, 255, 255"
 */
export function isValidRGB(color: string): boolean {
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const simpleRgbRegex = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/;

  const match = color.match(rgbRegex) || color.match(simpleRgbRegex);
  if (!match) return false;

  const [, r, g, b] = match;
  return parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255;
}

/**
 * Validates an HSL color string
 * Supports: "hsl(360, 100%, 100%)" or "360, 100%, 100%"
 */
export function isValidHSL(color: string): boolean {
  const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
  const simpleHslRegex = /^(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%$/;

  const match = color.match(hslRegex) || color.match(simpleHslRegex);
  if (!match) return false;

  const [, h, s, l] = match;
  return parseInt(h) <= 360 && parseInt(s) <= 100 && parseInt(l) <= 100;
}

/**
 * Validates any color format and returns validation result
 */
export function validateColor(color: string): ColorValidationResult {
  if (!color || typeof color !== "string") {
    return {
      valid: false,
      error: "Color must be a non-empty string",
    };
  }

  const trimmedColor = color.trim();

  // Check hex format
  if (isValidHex(trimmedColor)) {
    return {
      valid: true,
      format: "hex",
      normalized: normalizeHex(trimmedColor),
    };
  }

  // Check RGB format
  if (isValidRGB(trimmedColor)) {
    const rgb = parseRGB(trimmedColor);
    return {
      valid: true,
      format: "rgb",
      normalized: rgbToHex(rgb),
    };
  }

  // Check HSL format
  if (isValidHSL(trimmedColor)) {
    const hsl = parseHSL(trimmedColor);
    const rgb = hslToRgb(hsl);
    return {
      valid: true,
      format: "hsl",
      normalized: rgbToHex(rgb),
    };
  }

  return {
    valid: false,
    error: "Invalid color format. Use hex (#RRGGBB), rgb(r, g, b), or hsl(h, s%, l%)",
  };
}

// ============================================================================
// COLOR PARSING
// ============================================================================

/**
 * Normalizes a hex color to 6-digit format with uppercase
 */
export function normalizeHex(hex: string): string {
  hex = hex.replace("#", "");

  // Expand 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  return "#" + hex.toUpperCase();
}

/**
 * Parses RGB string to RGBColor object
 */
export function parseRGB(color: string): RGBColor {
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const simpleRgbRegex = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/;

  const match = color.match(rgbRegex) || color.match(simpleRgbRegex);
  if (!match) throw new Error("Invalid RGB format");

  const [, r, g, b] = match;
  return {
    r: parseInt(r),
    g: parseInt(g),
    b: parseInt(b),
  };
}

/**
 * Parses HSL string to HSLColor object
 */
export function parseHSL(color: string): HSLColor {
  const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
  const simpleHslRegex = /^(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%$/;

  const match = color.match(hslRegex) || color.match(simpleHslRegex);
  if (!match) throw new Error("Invalid HSL format");

  const [, h, s, l] = match;
  return {
    h: parseInt(h),
    s: parseInt(s),
    l: parseInt(l),
  };
}

/**
 * Parses hex string to RGBColor object
 */
export function hexToRgb(hex: string): RGBColor {
  const normalized = normalizeHex(hex).replace("#", "");

  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
}

// ============================================================================
// COLOR CONVERSION
// ============================================================================

/**
 * Converts RGB to hex
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return "#" + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts hex to HSL
 */
export function hexToHsl(hex: string): HSLColor {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Converts HSL to hex
 */
export function hslToHex(hsl: HSLColor): string {
  return rgbToHex(hslToRgb(hsl));
}

// ============================================================================
// COLOR MANIPULATION
// ============================================================================

/**
 * Lightens a color by a percentage
 */
export function lighten(color: string, percent: number): string {
  const hsl = hexToHsl(color);
  hsl.l = Math.min(100, hsl.l + percent);
  return hslToHex(hsl);
}

/**
 * Darkens a color by a percentage
 */
export function darken(color: string, percent: number): string {
  const hsl = hexToHsl(color);
  hsl.l = Math.max(0, hsl.l - percent);
  return hslToHex(hsl);
}

/**
 * Adjusts saturation of a color
 */
export function saturate(color: string, percent: number): string {
  const hsl = hexToHsl(color);
  hsl.s = Math.min(100, Math.max(0, hsl.s + percent));
  return hslToHex(hsl);
}

// ============================================================================
// ACCESSIBILITY
// ============================================================================

/**
 * Calculates relative luminance of a color
 * Based on WCAG 2.0 formula
 */
export function getLuminance(color: string): number {
  const rgb = hexToRgb(color);

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors
 * Based on WCAG 2.0 formula
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if contrast meets WCAG standards
 */
export function checkContrast(foreground: string, background: string): ContrastCheckResult {
  const ratio = getContrastRatio(foreground, background);

  const wcagAA = ratio >= 4.5; // WCAG AA for normal text
  const wcagAAA = ratio >= 7; // WCAG AAA for normal text

  let recommendation: string | undefined;
  if (!wcagAA) {
    recommendation = "Poor contrast. Consider using darker text or lighter background.";
  } else if (!wcagAAA) {
    recommendation = "Good contrast, but could be improved for better accessibility.";
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA,
    wcagAAA,
    recommendation,
  };
}

/**
 * Suggests an accessible text color for a given background
 */
export function suggestTextColor(background: string): string {
  const luminance = getLuminance(background);
  // If background is light, use dark text; if dark, use light text
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
