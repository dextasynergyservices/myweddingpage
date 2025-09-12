import RusticHero from "@/components/sample-templates/rustic/RusticHero";
import RusticOurStory from "@/components/sample-templates/rustic/RusticOurStory";
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

// New template components
import { HeroSection as VowsHero } from "@/app/templates/vows/VowsHero";
import { OurStorySection as VowsStory } from "@/app/templates/vows/VowsStory";
import { GallerySection as VowsGallery } from "@/app/templates/vows/VowsGallery";
import { GiftRegistrySection as VowsGift } from "@/app/templates/vows/VowsGift";
import { CommentsSection as VowsGuest } from "@/app/templates/vows/VowsGuest";

import BloomHero from "@/app/templates/bloom/BloomHero";
import BloomStory from "@/app/templates/bloom/BloomStory";
import BloomGallery from "@/app/templates/bloom/BloomGallery";
import BloomGift from "@/app/templates/bloom/BloomGift";
import BloomGuest from "@/app/templates/bloom/BloomGuest";

import EleganceHero from "@/app/templates/elegance/EleganceHero";
import EleganceStory from "@/app/templates/elegance/EleganceStory";
import EleganceGallery from "@/app/templates/elegance/EleganceGalley";
import EleganceGift from "@/app/templates/elegance/EleganceGift";
import EleganceGuest from "@/app/templates/elegance/EleganceGuest";

import LuxeHero from "@/app/templates/luxe/LuxeHero";
import LuxeStory from "@/app/templates/luxe/LuxeStory";
import LuxeGallery from "@/app/templates/luxe/LuxeGallery";
import LuxeGift from "@/app/templates/luxe/LuxeGift";
import LuxeGuest from "@/app/templates/luxe/LuxeGuest";

export const componentMap = {
  // Map old template names to new components (temporary fix)
  rustic_hero: VowsHero,
  rustic_story: VowsStory,
  rustic_gift: VowsGift,
  rustic_gallery: VowsGallery,
  rustic_guest: VowsGuest,

  vintage_hero: BloomHero,
  vintage_gallery: BloomGallery,
  vintage_gift: BloomGift,
  vintage_guest: BloomGuest,
  vintage_story: BloomStory,

  modern_hero: EleganceHero,
  modern_gallery: EleganceGallery,
  modern_gift: EleganceGift,
  modern_guest: EleganceGuest,
  modern_story: EleganceStory,

  luxury_hero: LuxeHero,
  luxury_gallery: LuxeGallery,
  luxury_gift: LuxeGift,
  luxury_guest: LuxeGuest,
  luxury_story: LuxeStory,

  // New templates
  vows_hero: VowsHero,
  vows_story: VowsStory,
  vows_gallery: VowsGallery,
  vows_gift: VowsGift,
  vows_guest: VowsGuest,

  bloom_hero: BloomHero,
  bloom_story: BloomStory,
  bloom_gallery: BloomGallery,
  bloom_gift: BloomGift,
  bloom_guest: BloomGuest,

  elegance_hero: EleganceHero,
  elegance_story: EleganceStory,
  elegance_gallery: EleganceGallery,
  elegance_gift: EleganceGift,
  elegance_guest: EleganceGuest,

  luxe_hero: LuxeHero,
  luxe_story: LuxeStory,
  luxe_gallery: LuxeGallery,
  luxe_gift: LuxeGift,
  luxe_guest: LuxeGuest,
} as const;

export type ComponentType = keyof typeof componentMap;

export interface ComponentConfig {
  type: ComponentType;
  content: Record<string, unknown>;
  styles?: Record<string, string>;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
}
