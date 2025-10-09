/**
 * Customization Components
 * Export all customization-related components
 */

// Phase 2: Preset Components
export { default as PresetCard } from "./PresetCard";
export { default as PresetSelector } from "./PresetSelector";

// Phase 3: Custom Color Picker Components
export { default as ColorInput } from "./ColorInput";
export { default as ColorSection } from "./ColorSection";
export { default as CustomColorPicker } from "./CustomColorPicker";

// Phase 4: Font Selector Components
export { FontPreview } from "./FontPreview";
export { FontSelector } from "./FontSelector";
export { CustomFontPicker } from "./CustomFontPicker";

// Re-export types for convenience
export type { PresetTheme, ColorScheme, FontScheme, TemplateType } from "@/types/customization";
