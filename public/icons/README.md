# PWA Icon Generation Guide

## Required Icons

Your PWA needs these icon sizes:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px
- Maskable: 192x192px and 512x512px

## Quick Icon Generation

### Option 1: Online Tools (Easiest)
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your `public/logo.png`
3. Download the icon pack
4. Extract to `public/icons/` folder

### Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Navigate to your project
cd c:/Users/ALISON/Documents/myweddingpage

# Generate all icon sizes
magick public/logo.png -resize 72x72 public/icons/icon-72x72.png
magick public/logo.png -resize 96x96 public/icons/icon-96x96.png
magick public/logo.png -resize 128x128 public/icons/icon-128x128.png
magick public/logo.png -resize 144x144 public/icons/icon-144x144.png
magick public/logo.png -resize 152x152 public/icons/icon-152x152.png
magick public/logo.png -resize 192x192 public/icons/icon-192x192.png
magick public/logo.png -resize 384x384 public/icons/icon-384x384.png
magick public/logo.png -resize 512x512 public/icons/icon-512x512.png

# Generate maskable icons (with padding for Android)
magick public/logo.png -resize 192x192 -background transparent -gravity center -extent 230x230 -resize 192x192 public/icons/icon-maskable-192x192.png
magick public/logo.png -resize 512x512 -background transparent -gravity center -extent 614x614 -resize 512x512 public/icons/icon-maskable-512x512.png
```

### Option 3: Using Node.js Script
```bash
# Install sharp for image processing
pnpm add -D sharp

# Run the icon generation script
node scripts/generate-icons.js
```

## Temporary Icons (For Testing)

For now, you can use placeholder icons. I'll create a script that copies your logo to all required sizes:

```bash
# Copy logo as temporary icons
cp public/logo.png public/icons/icon-72x72.png
cp public/logo.png public/icons/icon-96x96.png
cp public/logo.png public/icons/icon-128x128.png
cp public/logo.png public/icons/icon-144x144.png
cp public/logo.png public/icons/icon-152x152.png
cp public/logo.png public/icons/icon-192x192.png
cp public/logo.png public/icons/icon-384x384.png
cp public/logo.png public/icons/icon-512x512.png
cp public/logo.png public/icons/icon-maskable-192x192.png
cp public/logo.png public/icons/icon-maskable-512x512.png
```

## Screenshots (Optional)
Place screenshots in `public/screenshots/`:
- `desktop-1.png` - 1280x720px (wide screen)
- `mobile-1.png` - 750x1334px (mobile screen)

These help users preview your app in app stores and install prompts.

## Best Practices

1. **Maskable Icons**: Have 20% safe zone padding
2. **File Format**: PNG with transparency
3. **File Size**: Keep under 100KB each
4. **Design**: Simple, recognizable, works at small sizes
5. **Background**: Transparent for regular, solid for maskable

## Validation

After generating icons, test them at:
https://manifest-validator.appspot.com/
