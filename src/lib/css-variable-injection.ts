/**
 * CSS Variable Injection Utility
 * Dynamically injects CSS variables for template customization
 * Phase 6: Live Preview Integration
 */

import type { ColorScheme, FontScheme } from "@/types/customization";

/**
 * Generate CSS variables string from color scheme
 */
export function generateColorVariables(colors: ColorScheme): string {
  return `
    --wedding-primary: ${colors.primary};
    --wedding-secondary: ${colors.secondary};
    --wedding-accent: ${colors.accent};
    --wedding-background: ${colors.background};
    --wedding-text: ${colors.text};

    --wedding-button-primary-bg: ${colors.buttonPrimary};
    --wedding-button-primary-text: ${colors.buttonPrimaryText};
    --wedding-button-primary-hover: ${colors.buttonPrimaryHover};

    --wedding-button-secondary-bg: ${colors.buttonSecondary};
    --wedding-button-secondary-text: ${colors.buttonSecondaryText};
    --wedding-button-secondary-hover: ${colors.buttonSecondaryHover};
  `.trim();
}

/**
 * Generate CSS variables string from font scheme
 */
export function generateFontVariables(fonts: FontScheme): string {
  return `
    --wedding-font-heading: "${fonts.heading}", serif;
    --wedding-font-body: "${fonts.body}", sans-serif;
    --wedding-font-script: "${fonts.script}", cursive;
  `.trim();
}

/**
 * Inject CSS variables into a container element
 * Creates or updates a style tag with CSS variables
 */
export function injectCSSVariables(
  containerId: string,
  colors: ColorScheme,
  fonts: FontScheme
): void {
  const styleId = `wedding-customization-${containerId}`;
  let styleElement = document.getElementById(
    styleId
  ) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  const colorVars = generateColorVariables(colors);
  const fontVars = generateFontVariables(fonts);

  styleElement.textContent = `
    #${containerId} {
      ${colorVars}
      ${fontVars}
    }

    /* Apply to all template elements within this container */
    #${containerId} [data-wedding-element="title"],
    #${containerId} .wedding-title,
    #${containerId} h1,
    #${containerId} h2 {
      font-family: var(--wedding-font-heading) !important;
      color: var(--wedding-primary) !important;
    }

    #${containerId} [data-wedding-element="subtitle"],
    #${containerId} .wedding-subtitle,
    #${containerId} h3 {
      font-family: var(--wedding-font-script) !important;
      color: var(--wedding-secondary) !important;
    }

    #${containerId} [data-wedding-element="body"],
    #${containerId} .wedding-body,
    #${containerId} p,
    #${containerId} span,
    #${containerId} div {
      font-family: var(--wedding-font-body) !important;
      color: var(--wedding-text) !important;
    }

    /* Primary Buttons */
    #${containerId} button:not(.secondary):not(.ghost),
    #${containerId} .btn-primary,
    #${containerId} [data-wedding-element="button-primary"] {
      background-color: var(--wedding-button-primary-bg) !important;
      color: var(--wedding-button-primary-text) !important;
      border-color: var(--wedding-button-primary-bg) !important;
    }

    #${containerId} button:not(.secondary):not(.ghost):hover,
    #${containerId} .btn-primary:hover,
    #${containerId} [data-wedding-element="button-primary"]:hover {
      background-color: var(--wedding-button-primary-hover) !important;
      border-color: var(--wedding-button-primary-hover) !important;
    }

    /* Secondary Buttons */
    #${containerId} button.secondary,
    #${containerId} .btn-secondary,
    #${containerId} [data-wedding-element="button-secondary"] {
      background-color: var(--wedding-button-secondary-bg) !important;
      color: var(--wedding-button-secondary-text) !important;
      border-color: var(--wedding-button-secondary-bg) !important;
    }

    #${containerId} button.secondary:hover,
    #${containerId} .btn-secondary:hover,
    #${containerId} [data-wedding-element="button-secondary"]:hover {
      background-color: var(--wedding-button-secondary-hover) !important;
      border-color: var(--wedding-button-secondary-hover) !important;
    }

    /* Background */
    #${containerId} [data-wedding-element="background"],
    #${containerId} .wedding-background {
      background-color: var(--wedding-background) !important;
    }

    /* Accent elements */
    #${containerId} [data-wedding-element="accent"],
    #${containerId} .wedding-accent {
      color: var(--wedding-accent) !important;
    }
  `;
}

/**
 * Remove CSS variables for a container
 */
export function removeCSSVariables(containerId: string): void {
  const styleId = `wedding-customization-${containerId}`;
  const styleElement = document.getElementById(styleId);
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Apply CSS variables to the entire published wedding page
 * Used on public wedding pages (not in preview containers)
 * Includes cache busting through style tag updates
 */
export function applyGlobalCustomization(
  colors: ColorScheme,
  fonts: FontScheme,
  cacheKey?: string
): void {
  const styleId = `wedding-global-customization${cacheKey ? `-${cacheKey}` : ""}`;
  let styleElement = document.getElementById(
    styleId
  ) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  const colorVars = generateColorVariables(colors);
  const fontVars = generateFontVariables(fonts);

  // Apply globally to :root for published pages
  styleElement.textContent = `
    :root {
      ${colorVars}
      ${fontVars}
    }

    /* Apply to all template elements globally */
    [data-wedding-element="title"],
    .wedding-title,
    h1:not(.no-custom),
    h2:not(.no-custom) {
      font-family: var(--wedding-font-heading) !important;
      color: var(--wedding-primary) !important;
    }

    [data-wedding-element="subtitle"],
    .wedding-subtitle,
    h3:not(.no-custom) {
      font-family: var(--wedding-font-script) !important;
      color: var(--wedding-secondary) !important;
    }

    [data-wedding-element="body"],
    .wedding-body,
    p:not(.no-custom),
    span:not(.no-custom),
    div:not(.no-custom) {
      font-family: var(--wedding-font-body) !important;
    }

    /* Primary Buttons */
    button:not(.secondary):not(.ghost):not(.no-custom),
    .btn-primary,
    [data-wedding-element="button-primary"] {
      background-color: var(--wedding-button-primary-bg) !important;
      color: var(--wedding-button-primary-text) !important;
      border-color: var(--wedding-button-primary-bg) !important;
    }

    button:not(.secondary):not(.ghost):not(.no-custom):hover,
    .btn-primary:hover,
    [data-wedding-element="button-primary"]:hover {
      background-color: var(--wedding-button-primary-hover) !important;
      border-color: var(--wedding-button-primary-hover) !important;
    }

    /* Secondary Buttons */
    button.secondary:not(.no-custom),
    .btn-secondary,
    [data-wedding-element="button-secondary"] {
      background-color: var(--wedding-button-secondary-bg) !important;
      color: var(--wedding-button-secondary-text) !important;
      border-color: var(--wedding-button-secondary-bg) !important;
    }

    button.secondary:not(.no-custom):hover,
    .btn-secondary:hover,
    [data-wedding-element="button-secondary"]:hover {
      background-color: var(--wedding-button-secondary-hover) !important;
      border-color: var(--wedding-button-secondary-hover) !important;
    }

    /* Background */
    [data-wedding-element="background"],
    .wedding-background {
      background-color: var(--wedding-background) !important;
    }

    /* Accent elements */
    [data-wedding-element="accent"],
    .wedding-accent {
      color: var(--wedding-accent) !important;
    }
  `;
}

/**
 * Remove global customization styles
 */
export function removeGlobalCustomization(cacheKey?: string): void {
  const styleId = `wedding-global-customization${cacheKey ? `-${cacheKey}` : ""}`;
  const styleElement = document.getElementById(styleId);
  if (styleElement) {
    styleElement.remove();
  }
}
