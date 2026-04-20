/**
 * Curated Google Fonts library for wedding templates
 * Organized by category with metadata for dynamic loading
 */

import type { FontCategory, FontWeight } from "@/types/customization";

// ============================================================================
// FONT TYPES
// ============================================================================

export interface FontDefinition {
  family: string; // Font family name
  displayName: string; // Human-readable name
  category: FontCategory; // Font category
  weights: FontWeight[]; // Available weights
  subsets: string[]; // Character subsets (latin, latin-ext, etc.)
  previewText: string; // Sample text for preview
  googleFontId: string; // Google Fonts API identifier
  fallback: string; // CSS fallback stack
  description: string; // Brief description of font
  bestFor: string[]; // Use cases (e.g., "headings", "body", "accent")
  popular?: boolean; // Featured font
}

// ============================================================================
// SERIF FONTS (Elegant, Traditional, Formal)
// ============================================================================

const SERIF_FONTS: FontDefinition[] = [
  {
    family: "Playfair Display",
    displayName: "Playfair Display",
    category: "serif",
    weights: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin", "latin-ext"],
    previewText: "Together Forever",
    googleFontId: "Playfair+Display",
    fallback: "serif",
    description: "Elegant and sophisticated serif perfect for headings",
    bestFor: ["headings", "titles"],
    popular: true,
  },
  {
    family: "Cormorant",
    displayName: "Cormorant",
    category: "serif",
    weights: ["300", "400", "500", "600", "700"],
    subsets: ["latin", "latin-ext"],
    previewText: "Our Love Story",
    googleFontId: "Cormorant",
    fallback: "serif",
    description: "Classic serif with vintage charm",
    bestFor: ["headings", "body"],
    popular: true,
  },
  {
    family: "Cinzel",
    displayName: "Cinzel",
    category: "serif",
    weights: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin", "latin-ext"],
    previewText: "Eternal Love",
    googleFontId: "Cinzel",
    fallback: "serif",
    description: "Roman-inspired serif with timeless elegance",
    bestFor: ["headings", "titles"],
  },
  {
    family: "Lora",
    displayName: "Lora",
    category: "serif",
    weights: ["400", "500", "600", "700"],
    subsets: ["latin", "latin-ext"],
    previewText: "Forever Begins Today",
    googleFontId: "Lora",
    fallback: "serif",
    description: "Modern serif with gentle curves",
    bestFor: ["body", "headings"],
    popular: true,
  },
  {
    family: "Libre Baskerville",
    displayName: "Libre Baskerville",
    category: "serif",
    weights: ["400", "700"],
    subsets: ["latin", "latin-ext"],
    previewText: "A Beautiful Beginning",
    googleFontId: "Libre+Baskerville",
    fallback: "serif",
    description: "Traditional serif with excellent readability",
    bestFor: ["body", "headings"],
  },
  {
    family: "Crimson Text",
    displayName: "Crimson Text",
    category: "serif",
    weights: ["400", "600", "700"],
    subsets: ["latin", "latin-ext"],
    previewText: "The Perfect Day",
    googleFontId: "Crimson+Text",
    fallback: "serif",
    description: "Classic book serif for body text",
    bestFor: ["body"],
  },
  {
    family: "EB Garamond",
    displayName: "EB Garamond",
    category: "serif",
    weights: ["400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "Happily Ever After",
    googleFontId: "EB+Garamond",
    fallback: "serif",
    description: "Timeless Garamond with refined details",
    bestFor: ["body", "headings"],
  },
  {
    family: "Merriweather",
    displayName: "Merriweather",
    category: "serif",
    weights: ["300", "400", "700", "900"],
    subsets: ["latin", "latin-ext"],
    previewText: "Love Always Wins",
    googleFontId: "Merriweather",
    fallback: "serif",
    description: "Sturdy serif designed for screen reading",
    bestFor: ["body"],
  },
];

// ============================================================================
// SANS-SERIF FONTS (Modern, Clean, Contemporary)
// ============================================================================

const SANS_SERIF_FONTS: FontDefinition[] = [
  {
    family: "Inter",
    displayName: "Inter",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "Our Journey Together",
    googleFontId: "Inter",
    fallback: "sans-serif",
    description: "Modern sans-serif with excellent readability",
    bestFor: ["body", "headings"],
    popular: true,
  },
  {
    family: "Montserrat",
    displayName: "Montserrat",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "Two Hearts, One Love",
    googleFontId: "Montserrat",
    fallback: "sans-serif",
    description: "Geometric sans-serif with urban elegance",
    bestFor: ["headings", "body"],
    popular: true,
  },
  {
    family: "Open Sans",
    displayName: "Open Sans",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "Celebrate Love",
    googleFontId: "Open+Sans",
    fallback: "sans-serif",
    description: "Friendly and neutral sans-serif",
    bestFor: ["body"],
    popular: true,
  },
  {
    family: "Lato",
    displayName: "Lato",
    category: "sans-serif",
    weights: ["300", "400", "700", "900"],
    subsets: ["latin", "latin-ext"],
    previewText: "Love is in the Air",
    googleFontId: "Lato",
    fallback: "sans-serif",
    description: "Warm and approachable sans-serif",
    bestFor: ["body", "headings"],
  },
  {
    family: "Raleway",
    displayName: "Raleway",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "Forever & Always",
    googleFontId: "Raleway",
    fallback: "sans-serif",
    description: "Elegant thin sans-serif",
    bestFor: ["headings"],
  },
  {
    family: "Poppins",
    displayName: "Poppins",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "A Love Story",
    googleFontId: "Poppins",
    fallback: "sans-serif",
    description: "Geometric with friendly curves",
    bestFor: ["headings", "body"],
    popular: true,
  },
  {
    family: "Nunito",
    displayName: "Nunito",
    category: "sans-serif",
    weights: ["300", "400", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "Begin Forever",
    googleFontId: "Nunito",
    fallback: "sans-serif",
    description: "Rounded sans-serif with warmth",
    bestFor: ["body", "headings"],
  },
  {
    family: "Outfit",
    displayName: "Outfit",
    category: "sans-serif",
    weights: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
    previewText: "The Big Day",
    googleFontId: "Outfit",
    fallback: "sans-serif",
    description: "Modern geometric sans-serif",
    bestFor: ["headings"],
  },
];

// ============================================================================
// SCRIPT FONTS (Handwritten, Elegant, Romantic)
// ============================================================================

const SCRIPT_FONTS: FontDefinition[] = [
  {
    family: "Dancing Script",
    displayName: "Dancing Script",
    category: "script",
    weights: ["400", "500", "600", "700"],
    subsets: ["latin", "latin-ext"],
    previewText: "With Love",
    googleFontId: "Dancing+Script",
    fallback: "cursive",
    description: "Flowing and romantic script",
    bestFor: ["accent"],
    popular: true,
  },
  {
    family: "Great Vibes",
    displayName: "Great Vibes",
    category: "script",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "Forever Yours",
    googleFontId: "Great+Vibes",
    fallback: "cursive",
    description: "Elegant calligraphy script",
    bestFor: ["accent"],
    popular: true,
  },
  {
    family: "Parisienne",
    displayName: "Parisienne",
    category: "script",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "Love Always",
    googleFontId: "Parisienne",
    fallback: "cursive",
    description: "Delicate and feminine script",
    bestFor: ["accent"],
  },
  {
    family: "Allura",
    displayName: "Allura",
    category: "script",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "True Love",
    googleFontId: "Allura",
    fallback: "cursive",
    description: "Bold calligraphic script",
    bestFor: ["accent"],
  },
  {
    family: "Alex Brush",
    displayName: "Alex Brush",
    category: "script",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "Just Married",
    googleFontId: "Alex+Brush",
    fallback: "cursive",
    description: "Brush-style script",
    bestFor: ["accent"],
    popular: true,
  },
  {
    family: "Sacramento",
    displayName: "Sacramento",
    category: "script",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "Say I Do",
    googleFontId: "Sacramento",
    fallback: "cursive",
    description: "Monoline script with personality",
    bestFor: ["accent"],
  },
  {
    family: "Tangerine",
    displayName: "Tangerine",
    category: "script",
    weights: ["400", "700"],
    subsets: ["latin"],
    previewText: "Happily Ever After",
    googleFontId: "Tangerine",
    fallback: "cursive",
    description: "Thin elegant script",
    bestFor: ["accent"],
  },
  {
    family: "Satisfy",
    displayName: "Satisfy",
    category: "script",
    weights: ["400"],
    subsets: ["latin"],
    previewText: "Our Wedding",
    googleFontId: "Satisfy",
    fallback: "cursive",
    description: "Casual handwritten script",
    bestFor: ["accent"],
  },
];

// ============================================================================
// DISPLAY FONTS (Decorative, Unique, Statement)
// ============================================================================

const DISPLAY_FONTS: FontDefinition[] = [
  {
    family: "Italiana",
    displayName: "Italiana",
    category: "display",
    weights: ["400"],
    subsets: ["latin"],
    previewText: "Elegant Affair",
    googleFontId: "Italiana",
    fallback: "serif",
    description: "Modern display with flair",
    bestFor: ["headings"],
  },
  {
    family: "Bodoni Moda",
    displayName: "Bodoni Moda",
    category: "display",
    weights: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin", "latin-ext"],
    previewText: "Grand Celebration",
    googleFontId: "Bodoni+Moda",
    fallback: "serif",
    description: "High-contrast display serif",
    bestFor: ["headings"],
    popular: true,
  },
  {
    family: "Yeseva One",
    displayName: "Yeseva One",
    category: "display",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "Special Day",
    googleFontId: "Yeseva+One",
    fallback: "serif",
    description: "Decorative vintage display",
    bestFor: ["headings"],
  },
  {
    family: "Abril Fatface",
    displayName: "Abril Fatface",
    category: "display",
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
    previewText: "Love Wins",
    googleFontId: "Abril+Fatface",
    fallback: "serif",
    description: "Bold display with impact",
    bestFor: ["headings"],
  },
  {
    family: "Cardo",
    displayName: "Cardo",
    category: "display",
    weights: ["400", "700"],
    subsets: ["latin", "latin-ext"],
    previewText: "Timeless Romance",
    googleFontId: "Cardo",
    fallback: "serif",
    description: "Classic book typography",
    bestFor: ["headings", "body"],
  },
];

// ============================================================================
// COMBINED FONT LIBRARY
// ============================================================================

export const FONT_LIBRARY: FontDefinition[] = [
  ...SERIF_FONTS,
  ...SANS_SERIF_FONTS,
  ...SCRIPT_FONTS,
  ...DISPLAY_FONTS,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all fonts
 */
export const getAllFonts = (): FontDefinition[] => {
  return FONT_LIBRARY;
};

/**
 * Get fonts by category
 */
export const getFontsByCategory = (category: FontCategory): FontDefinition[] => {
  return FONT_LIBRARY.filter((font) => font.category === category);
};

/**
 * Get popular fonts
 */
export const getPopularFonts = (): FontDefinition[] => {
  return FONT_LIBRARY.filter((font) => font.popular === true);
};

/**
 * Get font by family name
 */
export const getFontByFamily = (family: string): FontDefinition | undefined => {
  return FONT_LIBRARY.find((font) => font.family.toLowerCase() === family.toLowerCase());
};

/**
 * Get fonts suitable for specific use case
 */
export const getFontsForUse = (use: string): FontDefinition[] => {
  return FONT_LIBRARY.filter((font) => font.bestFor.includes(use));
};

/**
 * Search fonts by name or description
 */
export const searchFonts = (query: string): FontDefinition[] => {
  const lowercaseQuery = query.toLowerCase();
  return FONT_LIBRARY.filter(
    (font) =>
      font.family.toLowerCase().includes(lowercaseQuery) ||
      font.displayName.toLowerCase().includes(lowercaseQuery) ||
      font.description.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Get recommended font pairings
 */
export const getRecommendedPairings = (
  headingFont: string
): { body: FontDefinition[]; accent: FontDefinition[] } => {
  const heading = getFontByFamily(headingFont);
  if (!heading) {
    return {
      body: getFontsForUse("body").slice(0, 3),
      accent: getFontsForUse("accent").slice(0, 3),
    };
  }

  // If heading is serif, recommend sans-serif for body
  // If heading is sans-serif, recommend serif or same sans-serif
  const bodyCategory = heading.category === "serif" ? "sans-serif" : "sans-serif";

  return {
    body: getFontsByCategory(bodyCategory).slice(0, 3),
    accent: getFontsForUse("accent").slice(0, 3),
  };
};

/**
 * Get font categories
 */
export const getFontCategories = (): FontCategory[] => {
  return ["serif", "sans-serif", "script", "display"];
};

/**
 * Get font count by category
 */
export const getFontCountByCategory = (): Record<FontCategory, number> => {
  const counts: Record<string, number> = {};
  FONT_LIBRARY.forEach((font) => {
    counts[font.category] = (counts[font.category] || 0) + 1;
  });
  return counts as Record<FontCategory, number>;
};
