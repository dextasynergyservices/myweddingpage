// lib/template-registry.ts
import { PLANS } from "./plans";
import { RusticTemplate } from "@/lib/sample-templates/rustic";
import { modernTemplate } from "@/lib/sample-templates/modern";
import { vintageTemplate } from "@/lib/sample-templates/vintage";
import { luxuryTemplate } from "@/lib/sample-templates/luxury";

import RusticHero from "@/components/sample-templates/rustic/RusticHero";
import RuticOurStory from "@/components/sample-templates/rustic/RusticOurStory";
import RuticGallery from "@/components/sample-templates/rustic/RusticGallery";
import RuticGuest from "@/components/sample-templates/rustic/RusticGuest";
import RuticGift from "@/components/sample-templates/rustic/RusticGift";

import VintageGallery from "@/components/sample-templates/vintage/VintageGallery";
import VintageGift from "@/components/sample-templates/vintage/VintageGift";
import VintageGuest from "@/components/sample-templates/vintage/VintageGuest";
import VintageOurStory from "@/components/sample-templates/vintage/VintageOurStory";
import VintageHero from "@/components/sample-templates/vintage/VintageHero";

import ModernGallery from "@/components/sample-templates/modern/ModernGallery";
import ModernGift from "@/components/sample-templates/modern/ModernGift";
import ModernGuest from "@/components/sample-templates/modern/ModernGuest";
import ModernHero from "@/components/sample-templates/modern/ModernHero";
import ModernOurStory from "@/components/sample-templates/modern/ModernOurStory";

import LuxuryGallery from "@/components/sample-templates/luxury/LuxuryGallery";
import LuxuryGift from "@/components/sample-templates/luxury/LuxuryGift";
import LuxuryGuest from "@/components/sample-templates/luxury/LuxuryGuest";
import LuxuryHero from "@/components/sample-templates/luxury/LuxuryHero";
import LuxuryOurStory from "@/components/sample-templates/luxury/LuxuryOurStory";

export const componentMap = {
  rustic_hero: RusticHero,
  rustic_story: RuticOurStory,
  rustic_gift: RuticGift,
  rustic_gallery: RuticGallery,
  rustic_guest: RuticGuest,

  vintage_hero: VintageHero,
  vintage_gallery: VintageGallery,
  vintage_gift: VintageGift,
  vintage_guest: VintageGuest,
  vintage_story: VintageOurStory,

  modern_hero: ModernHero,
  modern_gallery: ModernGallery,
  modern_gift: ModernGift,
  modern_guest: ModernGuest,
  modern_story: ModernOurStory,

  luxury_hero: LuxuryHero,
  luxury_gallery: LuxuryGallery,
  luxury_gift: LuxuryGift,
  luxury_guest: LuxuryGuest,
  luxury_story: LuxuryOurStory,
} as const;

export type ComponentType = keyof typeof componentMap;

// Define the TemplateMeta type for all templates
export type TemplateMeta = {
  name: string;
  category: string;
  thumbnail: string;
  requiredPlan: keyof typeof PLANS;
  components: Record<string, ComponentType>;
};

