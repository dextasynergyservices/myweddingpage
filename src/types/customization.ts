/**
 * Type definitions for PageBuilder customization system
 * Supports preset themes and custom user color/font preferences
 */

// ============================================================================
// COLOR TYPES
// ============================================================================

/**
 * Supported color format types
 */
export type ColorFormat = "hex" | "rgb" | "hsl";

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * HSL color representation
 */
export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * User's custom color scheme for their wedding template
 * All colors can be stored as hex strings for simplicity
 */
export interface ColorScheme {
  // Theme colors
  primary: string; // Main brand color (e.g., "#E8B4B8" - rose)
  secondary: string; // Complementary color (e.g., "#A8C4A8" - sage)
  accent: string; // Highlight color (e.g., "#F4D06F" - gold)

  // UI colors
  background: string; // Page background (e.g., "#FEFCFB" - cream)
  text: string; // Main text color (e.g., "#2D2D2D" - dark gray)

  // Button colors
  buttonPrimary: string; // Primary button background
  buttonPrimaryText: string; // Primary button text
  buttonPrimaryHover: string; // Primary button hover state

  buttonSecondary: string; // Secondary button background
  buttonSecondaryText: string; // Secondary button text
  buttonSecondaryHover: string; // Secondary button hover state
}

// ============================================================================
// FONT TYPES
// ============================================================================

/**
 * Font category for organization
 */
export type FontCategory =
  | "serif"
  | "sans-serif"
  | "script"
  | "display"
  | "monospace";

/**
 * Font weight options
 */
export type FontWeight = "300" | "400" | "500" | "600" | "700" | "800" | "900";

/**
 * Individual font configuration
 */
export interface FontConfig {
  family: string; // Font family name (e.g., "Playfair Display")
  category: FontCategory; // Font category
  weights: FontWeight[]; // Available weights
  googleFont: boolean; // Whether it's a Google Font
  fallback: string; // CSS fallback (e.g., "serif")
}

/**
 * User's font scheme for their wedding template
 */
export interface FontScheme {
  heading: string; // Font for headings/titles (e.g., "Playfair Display")
  body: string; // Font for body text (e.g., "Inter")
  script: string; // Font for decorative/script text (e.g., "Dancing Script")
}

// ============================================================================
// PRESET THEME TYPES
// ============================================================================

/**
 * Template type that preset belongs to
 */
export type TemplateType = "elegance" | "bloom" | "luxe" | "vows";

/**
 * Preset theme with predefined colors and fonts
 */
export interface PresetTheme {
  id: string; // Unique preset ID (e.g., "romantic-rose")
  name: string; // Display name (e.g., "Romantic Rose")
  description: string; // Short description
  templateType?: TemplateType; // Optional: specific to template
  colors: ColorScheme; // Predefined color scheme
  fonts: FontScheme; // Predefined font scheme
  thumbnail?: string; // Optional: preview image URL
  popular?: boolean; // Featured/popular preset
}

// ============================================================================
// USER CUSTOMIZATION TYPES
// ============================================================================

/**
 * Customization mode - preset or fully custom
 */
export type CustomizationMode = "preset" | "custom";

/**
 * Complete user customization configuration
 * This is what gets stored in UserTemplate.colorScheme JSON field
 */
export interface UserCustomization {
  mode: CustomizationMode; // 'preset' or 'custom'
  presetId?: string; // ID of selected preset (if mode is 'preset')
  colors: ColorScheme; // User's color scheme (from preset or custom)
  fonts: FontScheme; // User's font scheme (from preset or custom)
  updatedAt: string; // ISO timestamp of last update
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request body for saving customization
 */
export interface SaveCustomizationRequest {
  templateId: string;
  customization: UserCustomization;
}

/**
 * Response from saving customization
 */
export interface SaveCustomizationResponse {
  success: boolean;
  userTemplate: {
    id: string;
    userId: string;
    templateId: string;
    colorScheme: UserCustomization;
    updatedAt: string;
  };
  message?: string;
}

/**
 * Response from fetching customization
 */
export interface GetCustomizationResponse {
  success: boolean;
  customization: UserCustomization | null;
  message?: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Color validation result
 */
export interface ColorValidationResult {
  valid: boolean;
  format?: ColorFormat;
  normalized?: string; // Normalized hex color
  error?: string;
}

/**
 * Contrast check result for accessibility
 */
export interface ContrastCheckResult {
  ratio: number; // Contrast ratio (e.g., 4.5)
  wcagAA: boolean; // Passes WCAG AA (4.5:1 for normal text)
  wcagAAA: boolean; // Passes WCAG AAA (7:1 for normal text)
  recommendation?: string; // Suggestion if contrast is poor
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default color scheme (neutral/elegant)
 */
export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  primary: "#E8B4B8",
  secondary: "#A8C4A8",
  accent: "#F4D06F",
  background: "#FEFCFB",
  text: "#2D2D2D",
  buttonPrimary: "#E8B4B8",
  buttonPrimaryText: "#FFFFFF",
  buttonPrimaryHover: "#D19FA3",
  buttonSecondary: "#A8C4A8",
  buttonSecondaryText: "#FFFFFF",
  buttonSecondaryHover: "#93AF93",
};

/**
 * Default font scheme
 */
export const DEFAULT_FONT_SCHEME: FontScheme = {
  heading: "Playfair Display",
  body: "Inter",
  script: "Dancing Script",
};

/**
 * Default user customization
 */
export const DEFAULT_CUSTOMIZATION: UserCustomization = {
  mode: "preset",
  presetId: "romantic-rose",
  colors: DEFAULT_COLOR_SCHEME,
  fonts: DEFAULT_FONT_SCHEME,
  updatedAt: new Date().toISOString(),
};
