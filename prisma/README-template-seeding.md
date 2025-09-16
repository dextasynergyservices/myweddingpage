# Template Seeding Guide

This guide explains how to seed the wedding templates into the database.

## Overview

The comprehensive template seeding script creates 4 wedding templates with complete data:

- **Vows** (Classic) - Available in all plans
- **Bloom** (Luxury) - Available in all plans
- **Elegance** (Minimalist) - Available in Darling, Dazzle, Dynasty Royale
- **Luxe** (Modern) - Available in Dynasty Royale only

## Files

- `seed-templates-comprehensive.ts` - Main seeding script
- `test-template-seeding.ts` - Test script to verify database state
- `README-template-seeding.md` - This documentation

## Template Structure

Each template includes:

### 1. Basic Information

- Name, description, thumbnail, hero image
- Category assignment (Classic, Modern, Minimalist, Luxury)
- Color schemes for customization
- All media assets from template folders

### 2. Template Sections

Each template has 5 sections with **template-specific styling and components**:

- **Hero Section**:
  - Vows: Classic script with centered overlay
  - Bloom: Romantic floral with split image/text and floating hearts
  - Elegance: Minimalist split with clean typography
  - Luxe: Luxury showcase with fullscreen parallax

- **Story Section**:
  - Vows: Timeline vertical with alternating images
  - Bloom: Romantic timeline with image-centered layout
  - Elegance: Clean timeline with vertical layout
  - Luxe: Premium timeline with interactive cards

- **Gallery Section**:
  - Vows: Grid classic with masonry layout
  - Bloom: Masonry romantic with Pinterest style
  - Elegance: Grid clean with uniform layout
  - Luxe: Premium masonry with dynamic grid

- **Registry Section**: Template-specific gifts matching each style
- **Wishes Section**: Custom guest messages reflecting template personality

### 3. Preview Data

- **Completely unique sample data** for each template:
  - **Vows (Classic)**: Sarah & Michael, October 15, 2024, Napa Valley Winery - Traditional couple with classic story milestones, vintage gifts, and elegant messaging
  - **Bloom (Luxury)**: Sarah & James, June 15, 2024, Rose Garden Estate - Romantic couple with floral themes, garden gifts, and dreamy messaging
  - **Elegance (Minimalist)**: Tamunomiebaka & Precious, December 14, 2024, Modern Art Gallery Lagos - Contemporary couple with minimalist story, modern art gifts, and clean messaging
  - **Luxe (Modern)**: Isabella & Alexander, October 15, 2024, The Ritz-Carlton Napa Valley - Luxury couple with premium story, high-end gifts, and sophisticated messaging
- **Template-specific content**:
  - Unique couple names, venues, and wedding dates
  - Custom story milestones and content for each template
  - Template-specific gallery images and videos with proper categorization
  - Unique gift registries matching each template's style and price range
  - Custom guest messages reflecting each template's personality
  - Template-specific bank details and account names
  - Complete asset references using each template's actual media files

### 4. Plan Associations

- Templates are linked to appropriate plans based on the provided mapping
- Plan-Template relationships are created in the `PlanTemplate` table

## Usage

### Run the Seeding Script

```bash
npx tsx prisma/seed-templates-comprehensive.ts
```

### Test Database State

```bash
npx tsx prisma/test-template-seeding.ts
```

### Reset and Re-seed

If you need to reset the templates:

```bash
# Clear existing templates (optional)
npx prisma db push --force-reset

# Run the seeding script
npx tsx prisma/seed-templates-comprehensive.ts
```

## Template Categories

- **Classic** (cc4b45c4-9a45-4bf8-85d9-192144d43c87) - Vows
- **Modern** (a42c553a-cac8-497b-ad4b-5127f270d4ed) - Luxe
- **Minimalist** (3e44f777-32a8-4182-80d5-d66ace42ce70) - Elegance
- **Luxury** (787f203e-01f6-43d2-a36b-51d5f4ee3786) - Bloom

## Plan Mappings

- **Delight** (8838eb28-4dde-4847-a821-fd6a92edc7e7): vows, bloom
- **Darling** (c883dbff-0982-43fd-8621-d4e8bcd2e48f): vows, bloom, elegance
- **Dazzle** (5caaccb9-6e14-4a53-a49a-177de72b0ccf): vows, bloom, elegance
- **Dynasty Royale** (3b4634ab-3a88-46b4-aff6-78306099620e): vows, bloom, elegance, luxe

## Features

✅ Complete media asset integration
✅ Video support in gallery sections
✅ Realistic sample data for previews
✅ Proper categorization and plan associations
✅ Comprehensive section definitions
✅ Color scheme configurations
✅ No breaking changes to existing code

## Notes

- The script uses `upsert` operations to avoid duplicates
- All media assets are referenced from the `/public/templates/` directory
- Thumbnail images are stored in `/public/thumbnail/`
- Sample data uses placeholder content that can be customized
- The script is idempotent - safe to run multiple times
