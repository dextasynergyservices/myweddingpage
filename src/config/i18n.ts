export const DEFAULT_LOCALE = process.env.NEXT_DEFAULT_LOCALE ?? "en";

export const SUPPORTED_LOCALES = [
  "en",
  "fr",
  "es",
  "yoruba",
  "igbo",
  "hausa",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

// TTL in seconds (1 year)
export const LOCALE_COOKIE_TTL = 60 * 60 * 24 * 365;
