// A server-safe list of component keys used by templates.
// This avoids importing client components into server code (which can cause "useState" build errors).

export const componentKeys = [
  // rustic -> vows (legacy mapping)
  "rustic_hero",
  "rustic_story",
  "rustic_gift",
  "rustic_gallery",
  "rustic_guest",

  // vintage -> bloom
  "vintage_hero",
  "vintage_gallery",
  "vintage_gift",
  "vintage_guest",
  "vintage_story",

  // modern -> elegance
  "modern_hero",
  "modern_gallery",
  "modern_gift",
  "modern_guest",
  "modern_story",

  // luxury -> luxe
  "luxury_hero",
  "luxury_gallery",
  "luxury_gift",
  "luxury_guest",
  "luxury_story",

  // new templates
  "vows_hero",
  "vows_story",
  "vows_gallery",
  "vows_gift",
  "vows_guest",

  "bloom_hero",
  "bloom_story",
  "bloom_gallery",
  "bloom_gift",
  "bloom_guest",

  "elegance_hero",
  "elegance_story",
  "elegance_gallery",
  "elegance_gift",
  "elegance_guest",

  "luxe_hero",
  "luxe_story",
  "luxe_gallery",
  "luxe_gift",
  "luxe_guest",
];

export const componentKeySet = new Set(componentKeys);
