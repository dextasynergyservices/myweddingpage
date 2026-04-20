/**
 * Theme Preset Library
 * Professional color schemes and font combinations for wedding templates
 * Organized by template type: Elegance, Bloom, Luxe, Vows
 */

import { PresetTheme } from "@/types/customization";

// ============================================================================
// ELEGANCE TEMPLATE PRESETS
// Modern, sophisticated, and romantic
// ============================================================================

export const ELEGANCE_PRESETS: PresetTheme[] = [
  {
    id: "elegance-romantic-rose",
    name: "Romantic Rose",
    description:
      "Soft rose pink with sage green accents and warm gold highlights",
    templateType: "elegance",
    popular: true,
    colors: {
      primary: "#E8B4B8", // Soft rose pink
      secondary: "#A8C4A8", // Sage green
      accent: "#F4D06F", // Warm gold
      background: "#FEFCFB", // Warm white
      text: "#2D2D2D", // Charcoal
      buttonPrimary: "#E8B4B8",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#D19FA3",
      buttonSecondary: "#A8C4A8",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#93AF93",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
      script: "Dancing Script",
    },
  },
  {
    id: "elegance-navy-gold",
    name: "Navy & Gold",
    description: "Classic navy blue with luxurious gold and soft cream",
    templateType: "elegance",
    popular: true,
    colors: {
      primary: "#1A3A52", // Deep navy
      secondary: "#D4AF37", // Rich gold
      accent: "#E8DCC4", // Soft cream
      background: "#FAFAF8", // Off-white
      text: "#1A1A1A", // Deep black
      buttonPrimary: "#1A3A52",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#0F2A3F",
      buttonSecondary: "#D4AF37",
      buttonSecondaryText: "#1A1A1A",
      buttonSecondaryHover: "#C29D2F",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Lato",
      script: "Great Vibes",
    },
  },
  {
    id: "elegance-lavender-dreams",
    name: "Lavender Dreams",
    description: "Soft lavender with silver accents and pure white",
    templateType: "elegance",
    colors: {
      primary: "#B8A8D8", // Soft lavender
      secondary: "#C0C0C0", // Silver
      accent: "#E8D5F2", // Light lavender
      background: "#FFFFFF", // Pure white
      text: "#2D2D2D", // Charcoal
      buttonPrimary: "#B8A8D8",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#A393C7",
      buttonSecondary: "#C0C0C0",
      buttonSecondaryText: "#2D2D2D",
      buttonSecondaryHover: "#ADADAD",
    },
    fonts: {
      heading: "Cinzel",
      body: "Raleway",
      script: "Allura",
    },
  },
  {
    id: "elegance-sunset-glow",
    name: "Sunset Glow",
    description: "Warm coral with peach tones and soft gray",
    templateType: "elegance",
    colors: {
      primary: "#FF7F6A", // Coral
      secondary: "#FFB499", // Soft peach
      accent: "#FED8C9", // Light peach
      background: "#FFF9F7", // Warm white
      text: "#4A4A4A", // Medium gray
      buttonPrimary: "#FF7F6A",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#E96B57",
      buttonSecondary: "#FFB499",
      buttonSecondaryText: "#4A4A4A",
      buttonSecondaryHover: "#F5A085",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Source Sans Pro",
      script: "Pacifico",
    },
  },
  {
    id: "elegance-forest-green",
    name: "Forest Green",
    description: "Deep forest green with cream and warm copper",
    templateType: "elegance",
    colors: {
      primary: "#2C5F4F", // Forest green
      secondary: "#B87333", // Copper
      accent: "#F5E6D3", // Cream
      background: "#FDFBF7", // Warm white
      text: "#1A1A1A", // Deep black
      buttonPrimary: "#2C5F4F",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#1F4737",
      buttonSecondary: "#B87333",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#A25F28",
    },
    fonts: {
      heading: "Libre Baskerville",
      body: "Open Sans",
      script: "Alex Brush",
    },
  },
  {
    id: "elegance-classic-monochrome",
    name: "Classic Black & White",
    description: "Timeless black and white with silver accents",
    templateType: "elegance",
    colors: {
      primary: "#1A1A1A", // Deep black
      secondary: "#A8A8A8", // Medium gray
      accent: "#E8E8E8", // Light gray
      background: "#FFFFFF", // Pure white
      text: "#1A1A1A", // Deep black
      buttonPrimary: "#1A1A1A",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#0A0A0A",
      buttonSecondary: "#A8A8A8",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#8F8F8F",
    },
    fonts: {
      heading: "Montserrat",
      body: "Lato",
      script: "Tangerine",
    },
  },
  {
    id: "elegance-blush-champagne",
    name: "Blush & Champagne",
    description: "Delicate blush pink with champagne gold and ivory",
    templateType: "elegance",
    colors: {
      primary: "#F4C2C2", // Blush pink
      secondary: "#E8D5B7", // Champagne
      accent: "#FFF8F0", // Ivory
      background: "#FFFCF9", // Soft white
      text: "#3D3D3D", // Charcoal
      buttonPrimary: "#F4C2C2",
      buttonPrimaryText: "#3D3D3D",
      buttonPrimaryHover: "#E8AEAE",
      buttonSecondary: "#E8D5B7",
      buttonSecondaryText: "#3D3D3D",
      buttonSecondaryHover: "#D9C49D",
    },
    fonts: {
      heading: "Cormorant",
      body: "Lora",
      script: "Sacramento",
    },
  },
  {
    id: "elegance-burgundy-gold",
    name: "Burgundy & Gold",
    description: "Rich burgundy with antique gold and warm beige",
    templateType: "elegance",
    colors: {
      primary: "#6B1C3D", // Deep burgundy
      secondary: "#C9A45C", // Antique gold
      accent: "#EBE0D5", // Warm beige
      background: "#FBF8F5", // Soft beige
      text: "#2D2D2D", // Charcoal
      buttonPrimary: "#6B1C3D",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#551631",
      buttonSecondary: "#C9A45C",
      buttonSecondaryText: "#2D2D2D",
      buttonSecondaryHover: "#B8924B",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Crimson Text",
      script: "Birthstone",
    },
  },
];

// ============================================================================
// BLOOM TEMPLATE PRESETS
// Fresh, floral, and garden-inspired
// ============================================================================

export const BLOOM_PRESETS: PresetTheme[] = [
  {
    id: "bloom-garden-fresh",
    name: "Garden Fresh",
    description: "Vibrant pink with fresh green and soft yellow",
    templateType: "bloom",
    popular: true,
    colors: {
      primary: "#FF69B4", // Hot pink
      secondary: "#7FBA7A", // Fresh green
      accent: "#FFE5B4", // Soft yellow
      background: "#FFFEF9", // Cream white
      text: "#2D4A2B", // Dark green
      buttonPrimary: "#FF69B4",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#E555A0",
      buttonSecondary: "#7FBA7A",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#6BA666",
    },
    fonts: {
      heading: "Quicksand",
      body: "Nunito",
      script: "Satisfy",
    },
  },
  {
    id: "bloom-spring-meadow",
    name: "Spring Meadow",
    description: "Soft peach with mint green and buttercream",
    templateType: "bloom",
    popular: true,
    colors: {
      primary: "#FFB5A7", // Soft peach
      secondary: "#B8E6D5", // Mint green
      accent: "#FFF8DC", // Buttercream
      background: "#FFFFFE", // Soft white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#FFB5A7",
      buttonPrimaryText: "#3D3D3D",
      buttonPrimaryHover: "#F5A193",
      buttonSecondary: "#B8E6D5",
      buttonSecondaryText: "#3D3D3D",
      buttonSecondaryHover: "#A3D9C1",
    },
    fonts: {
      heading: "Josefin Sans",
      body: "Karla",
      script: "Kaushan Script",
    },
  },
  {
    id: "bloom-wildflower",
    name: "Wildflower",
    description: "Purple with orange accents and cream",
    templateType: "bloom",
    colors: {
      primary: "#9B59B6", // Purple
      secondary: "#FF8C42", // Warm orange
      accent: "#FFF5E6", // Cream
      background: "#FFFBF7", // Off-white
      text: "#4A4A4A", // Medium gray
      buttonPrimary: "#9B59B6",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#8541A2",
      buttonSecondary: "#FF8C42",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#E57733",
    },
    fonts: {
      heading: "Poppins",
      body: "Work Sans",
      script: "Courgette",
    },
  },
  {
    id: "bloom-cherry-blossom",
    name: "Cherry Blossom",
    description: "Soft pink with light purple and white",
    templateType: "bloom",
    colors: {
      primary: "#FFB7C5", // Cherry blossom pink
      secondary: "#E6B8FF", // Light purple
      accent: "#FFF0F5", // Lavender blush
      background: "#FFFFFF", // Pure white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#FFB7C5",
      buttonPrimaryText: "#3D3D3D",
      buttonPrimaryHover: "#F5A3B1",
      buttonSecondary: "#E6B8FF",
      buttonSecondaryText: "#3D3D3D",
      buttonSecondaryHover: "#D9A3F5",
    },
    fonts: {
      heading: "Questrial",
      body: "Assistant",
      script: "Cookie",
    },
  },
  {
    id: "bloom-tropical",
    name: "Tropical",
    description: "Teal with coral and sandy beige",
    templateType: "bloom",
    colors: {
      primary: "#008B8B", // Dark teal
      secondary: "#FF6B6B", // Coral
      accent: "#F5DEB3", // Sandy beige
      background: "#FFFEF9", // Warm white
      text: "#2D3D3D", // Dark gray
      buttonPrimary: "#008B8B",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#006767",
      buttonSecondary: "#FF6B6B",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#E55757",
    },
    fonts: {
      heading: "Comfortaa",
      body: "Muli",
      script: "Indie Flower",
    },
  },
  {
    id: "bloom-lavender-field",
    name: "Lavender Field",
    description: "Soft lavender with mauve and cream",
    templateType: "bloom",
    colors: {
      primary: "#CCA6D6", // Soft lavender
      secondary: "#D4A5A5", // Mauve
      accent: "#F5F0E8", // Cream
      background: "#FFFCF9", // Soft white
      text: "#4A4A4A", // Medium gray
      buttonPrimary: "#CCA6D6",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#B892C2",
      buttonSecondary: "#D4A5A5",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#C09191",
    },
    fonts: {
      heading: "Merriweather",
      body: "PT Sans",
      script: "Bad Script",
    },
  },
];

// ============================================================================
// LUXE TEMPLATE PRESETS
// Glamorous, luxurious, and sophisticated
// ============================================================================

export const LUXE_PRESETS: PresetTheme[] = [
  {
    id: "luxe-champagne-gold",
    name: "Champagne Gold",
    description: "Elegant champagne with rich gold and ivory",
    templateType: "luxe",
    popular: true,
    colors: {
      primary: "#F7E7CE", // Champagne
      secondary: "#D4AF37", // Rich gold
      accent: "#FFF8F0", // Ivory
      background: "#FFFBF5", // Soft cream
      text: "#2D2D2D", // Charcoal
      buttonPrimary: "#D4AF37",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#C29D2F",
      buttonSecondary: "#F7E7CE",
      buttonSecondaryText: "#2D2D2D",
      buttonSecondaryHover: "#E8D7B8",
    },
    fonts: {
      heading: "Didot",
      body: "Avenir",
      script: "Allura",
    },
  },
  {
    id: "luxe-emerald-gold",
    name: "Emerald & Gold",
    description: "Deep emerald green with luxurious gold",
    templateType: "luxe",
    popular: true,
    colors: {
      primary: "#046F4A", // Emerald green
      secondary: "#FFD700", // Pure gold
      accent: "#F5F5DC", // Beige
      background: "#FFFEF9", // Warm white
      text: "#1A1A1A", // Deep black
      buttonPrimary: "#046F4A",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#035337",
      buttonSecondary: "#FFD700",
      buttonSecondaryText: "#1A1A1A",
      buttonSecondaryHover: "#E5C200",
    },
    fonts: {
      heading: "Bodoni Moda",
      body: "Futura",
      script: "Parisienne",
    },
  },
  {
    id: "luxe-midnight-silver",
    name: "Midnight Silver",
    description: "Deep midnight blue with metallic silver",
    templateType: "luxe",
    colors: {
      primary: "#191970", // Midnight blue
      secondary: "#C0C0C0", // Silver
      accent: "#E8E8E8", // Light silver
      background: "#FAFAFA", // Light gray
      text: "#1A1A1A", // Deep black
      buttonPrimary: "#191970",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#0F0F50",
      buttonSecondary: "#C0C0C0",
      buttonSecondaryText: "#1A1A1A",
      buttonSecondaryHover: "#ADADAD",
    },
    fonts: {
      heading: "Cinzel",
      body: "Lato",
      script: "Great Vibes",
    },
  },
  {
    id: "luxe-rose-gold",
    name: "Rose Gold",
    description: "Blush pink with rose gold and cream",
    templateType: "luxe",
    colors: {
      primary: "#ECC5C0", // Blush pink
      secondary: "#B76E79", // Rose gold
      accent: "#FFF5F0", // Cream
      background: "#FFFCFA", // Soft white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#B76E79",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#A35B65",
      buttonSecondary: "#ECC5C0",
      buttonSecondaryText: "#3D3D3D",
      buttonSecondaryHover: "#DEB1AC",
    },
    fonts: {
      heading: "Italiana",
      body: "Crimson Pro",
      script: "Dancing Script",
    },
  },
  {
    id: "luxe-royal-purple",
    name: "Royal Purple",
    description: "Deep royal purple with gold and cream",
    templateType: "luxe",
    colors: {
      primary: "#6A0DAD", // Royal purple
      secondary: "#DAA520", // Goldenrod
      accent: "#FAF0E6", // Linen
      background: "#FFFBF7", // Off-white
      text: "#2D2D2D", // Charcoal
      buttonPrimary: "#6A0DAD",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#560A8D",
      buttonSecondary: "#DAA520",
      buttonSecondaryText: "#2D2D2D",
      buttonSecondaryHover: "#C8931C",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Spectral",
      script: "Mr Dafoe",
    },
  },
  {
    id: "luxe-platinum",
    name: "Platinum",
    description: "Cool platinum with crystal blue accents",
    templateType: "luxe",
    colors: {
      primary: "#E5E4E2", // Platinum
      secondary: "#4F97A3", // Crystal blue
      accent: "#F8F8FF", // Ghost white
      background: "#FFFFFF", // Pure white
      text: "#2D2D2D", // Charcoal
      buttonPrimary: "#4F97A3",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#3E7A85",
      buttonSecondary: "#E5E4E2",
      buttonSecondaryText: "#2D2D2D",
      buttonSecondaryHover: "#D1D0CE",
    },
    fonts: {
      heading: "Tenor Sans",
      body: "Karla",
      script: "Tangerine",
    },
  },
];

// ============================================================================
// VOWS TEMPLATE PRESETS
// Heartfelt, romantic, and intimate
// ============================================================================

export const VOWS_PRESETS: PresetTheme[] = [
  {
    id: "vows-timeless-romance",
    name: "Timeless Romance",
    description: "Classic rose with cream and soft gold",
    templateType: "vows",
    popular: true,
    colors: {
      primary: "#E8A0A0", // Classic rose
      secondary: "#F5E6D3", // Soft cream
      accent: "#F0DDB4", // Soft gold
      background: "#FFFEF9", // Warm white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#E8A0A0",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#D48C8C",
      buttonSecondary: "#F0DDB4",
      buttonSecondaryText: "#3D3D3D",
      buttonSecondaryHover: "#E3CFA0",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
      script: "Dancing Script",
    },
  },
  {
    id: "vows-dusty-rose",
    name: "Dusty Rose",
    description: "Muted dusty rose with sage and cream",
    templateType: "vows",
    popular: true,
    colors: {
      primary: "#C9A0A0", // Dusty rose
      secondary: "#B8C9B8", // Sage
      accent: "#F5EDE0", // Cream
      background: "#FFFCF7", // Soft white
      text: "#4A4A4A", // Medium gray
      buttonPrimary: "#C9A0A0",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#B58C8C",
      buttonSecondary: "#B8C9B8",
      buttonSecondaryText: "#4A4A4A",
      buttonSecondaryHover: "#A3B5A3",
    },
    fonts: {
      heading: "Cormorant",
      body: "Crimson Text",
      script: "Great Vibes",
    },
  },
  {
    id: "vows-soft-blush",
    name: "Soft Blush",
    description: "Delicate blush with ivory and rose gold",
    templateType: "vows",
    colors: {
      primary: "#FFD1DC", // Soft blush
      secondary: "#E8C2A4", // Rose gold
      accent: "#FFF8F0", // Ivory
      background: "#FFFFFF", // Pure white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#FFD1DC",
      buttonPrimaryText: "#3D3D3D",
      buttonPrimaryHover: "#F5BDC8",
      buttonSecondary: "#E8C2A4",
      buttonSecondaryText: "#3D3D3D",
      buttonSecondaryHover: "#D9AE90",
    },
    fonts: {
      heading: "Libre Baskerville",
      body: "Source Serif Pro",
      script: "Allura",
    },
  },
  {
    id: "vows-warm-terracotta",
    name: "Warm Terracotta",
    description: "Earthy terracotta with olive and cream",
    templateType: "vows",
    colors: {
      primary: "#C9826B", // Terracotta
      secondary: "#8F9779", // Olive
      accent: "#F5EBE0", // Cream
      background: "#FFFCF7", // Warm white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#C9826B",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#B56E57",
      buttonSecondary: "#8F9779",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#7A8366",
    },
    fonts: {
      heading: "Bitter",
      body: "PT Serif",
      script: "Sacramento",
    },
  },
  {
    id: "vows-mauve-dream",
    name: "Mauve Dream",
    description: "Soft mauve with dusty purple and cream",
    templateType: "vows",
    colors: {
      primary: "#D4A5C2", // Mauve
      secondary: "#A89DC9", // Dusty purple
      accent: "#F5F0E8", // Cream
      background: "#FFFCF9", // Soft white
      text: "#4A4A4A", // Medium gray
      buttonPrimary: "#D4A5C2",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHover: "#C091AE",
      buttonSecondary: "#A89DC9",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#9489B5",
    },
    fonts: {
      heading: "Merriweather",
      body: "Alegreya",
      script: "Petit Formal Script",
    },
  },
  {
    id: "vows-vintage-blue",
    name: "Vintage Blue",
    description: "Soft blue with antique rose and cream",
    templateType: "vows",
    colors: {
      primary: "#A4C2D8", // Soft blue
      secondary: "#D8A4B4", // Antique rose
      accent: "#F5F0E8", // Cream
      background: "#FFFEF9", // Warm white
      text: "#3D3D3D", // Dark gray
      buttonPrimary: "#A4C2D8",
      buttonPrimaryText: "#3D3D3D",
      buttonPrimaryHover: "#8FAEC4",
      buttonSecondary: "#D8A4B4",
      buttonSecondaryText: "#FFFFFF",
      buttonSecondaryHover: "#C48F9F",
    },
    fonts: {
      heading: "Cardo",
      body: "Gentium Basic",
      script: "Euphoria Script",
    },
  },
];

// ============================================================================
// ALL PRESETS COMBINED
// ============================================================================

export const ALL_PRESETS: PresetTheme[] = [
  ...ELEGANCE_PRESETS,
  ...BLOOM_PRESETS,
  ...LUXE_PRESETS,
  ...VOWS_PRESETS,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get presets for a specific template type
 */
export function getPresetsByTemplate(
  templateType: "elegance" | "bloom" | "luxe" | "vows"
): PresetTheme[] {
  switch (templateType) {
    case "elegance":
      return ELEGANCE_PRESETS;
    case "bloom":
      return BLOOM_PRESETS;
    case "luxe":
      return LUXE_PRESETS;
    case "vows":
      return VOWS_PRESETS;
    default:
      return [];
  }
}

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): PresetTheme | undefined {
  return ALL_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get popular presets across all templates
 */
export function getPopularPresets(): PresetTheme[] {
  return ALL_PRESETS.filter((preset) => preset.popular);
}

/**
 * Get preset count by template type
 */
export function getPresetCount(
  templateType?: "elegance" | "bloom" | "luxe" | "vows"
): number {
  if (!templateType) {
    return ALL_PRESETS.length;
  }
  return getPresetsByTemplate(templateType).length;
}
