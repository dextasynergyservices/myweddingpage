# 🎨 Canva Template Setup Guide for Wedding Pages

## Overview

Your wedding page system uses **Canva as the primary design generator** with beautiful fallbacks. Here's how to set up professional Canva templates for automatic wedding design creation.

## 📋 Complete Setup Process

### Step 1: Create Canva Brand Templates

1. **Login to Canva**: Go to [canva.com](https://canva.com)

2. **Create Wedding Templates** (recommended 7 themes):

   **🌸 Romantic Template:**
   - Size: 800x600px (or 1080x1080px)
   - Colors: Soft pinks (#fce7f3), roses, pastels
   - Add text elements: `{{BRIDE_NAME}} & {{GROOM_NAME}}`
   - Add date field: `{{WEDDING_DATE}}`
   - Add venue field: `{{VENUE}}`
   - Include florals, hearts, romantic fonts

   **👑 Elegant Template:**
   - Colors: Black, white, gold accents
   - Classic serif fonts
   - Minimalist borders, sophisticated elements

   **🌊 Beach Template:**
   - Colors: Ocean blues, sandy beiges
   - Seashells, waves, beach elements
   - Light, airy fonts

   **🌾 Rustic Template:**
   - Colors: Earth tones, browns, creams
   - Wood textures, burlap, mason jars
   - Handwritten-style fonts

   **🌸 Garden Template:**
   - Colors: Greens, fresh whites, floral accents
   - Botanical elements, leaves, flowers
   - Natural, organic fonts

   **✨ Vintage Template:**
   - Colors: Sepia, cream, muted golds
   - Art deco elements, vintage frames
   - Classic vintage typography

   **💎 Modern Template:**
   - Colors: Clean whites, minimal black
   - Geometric shapes, clean lines
   - Sans-serif, contemporary fonts

3. **Save as Brand Templates:**
   - For each design, click "Share" → "More" → "Create Brand Template"
   - Name them clearly: "Wedding-Romantic", "Wedding-Elegant", etc.
   - Add tags: "wedding", "invitation", theme name

### Step 2: Get Your Template IDs

1. **Authenticate with Canva:**
   - Visit: `http://localhost:3000/api/canva/auth`
   - Complete the OAuth flow
   - Copy your access token

2. **Fetch Your Templates:**
   - Visit: `http://localhost:3000/api/canva/get-templates?token=YOUR_ACCESS_TOKEN`
   - Copy the template IDs for each theme

### Step 3: Configure Template Mapping

Update your system to use specific template IDs for each theme:

\`\`\`typescript
// In your wedding design configuration
const CANVA_TEMPLATE_IDS = {
romantic: "YOUR_ROMANTIC_TEMPLATE_ID",
elegant: "YOUR_ELEGANT_TEMPLATE_ID",
beach: "YOUR_BEACH_TEMPLATE_ID",
rustic: "YOUR_RUSTIC_TEMPLATE_ID",
garden: "YOUR_GARDEN_TEMPLATE_ID",
vintage: "YOUR_VINTAGE_TEMPLATE_ID",
modern: "YOUR_MODERN_TEMPLATE_ID"
};
\`\`\`

## 🔧 How It Works

### Current System Flow:

1. **User creates wedding page** with theme selection
2. **System calls Canva API** with your brand template
3. **Canva generates design** using template + wedding details
4. **Auto-fills wedding information**:
   - Bride & Groom names
   - Wedding date
   - Venue location
5. **Returns beautiful, professional design**
6. **Fallback to styled placeholders** if Canva fails

### Template Benefits:

- ✅ **Professional designs** created by you
- ✅ **Consistent branding** across all weddings
- ✅ **Automatic personalization** with wedding details
- ✅ **Theme-appropriate styling** for each wedding type
- ✅ **Edit links** for further customization
- ✅ **High-quality thumbnails** for previews

## 🎯 Best Practices

### Template Design Tips:

1. **Use placeholder text** exactly as shown: `{{BRIDE_NAME}}`
2. **Create visual hierarchy** with different font sizes
3. **Leave space** for variable-length text (venue names)
4. **Include theme-appropriate graphics**
5. **Test with different name lengths**
6. **Use high-contrast colors** for readability

### Technical Tips:

1. **Create templates in Canva Teams** for better management
2. **Use consistent naming convention**
3. **Test templates** with the API before going live
4. **Keep templates updated** with seasonal elements
5. **Create backup templates** for each theme

## 🚀 Next Steps

1. **Create your 7 wedding templates** in Canva
2. **Save them as brand templates**
3. **Use the `/api/canva/get-templates` endpoint** to get IDs
4. **Configure the template mapping** in your system
5. **Test with real wedding data**

## 📞 Need Help?

- Test endpoint: `http://localhost:3000/api/canva/test-comprehensive`
- Template fetcher: `http://localhost:3000/api/canva/get-templates?token=TOKEN`
- Design gallery: `http://localhost:3000/api/wedding-design-gallery`

Your system is already set up to use Canva templates - you just need to create the templates and configure the IDs! 🎉
