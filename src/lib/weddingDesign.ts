import CanvaAPI from "@/lib/canva";

interface WeddingDesignOptions {
  brideName?: string;
  groomName?: string;
  venue?: string;
  weddingDate?: Date;
  colorTheme?: string;
  style?: string;
  heroImageUrl?: string;
  storyImageUrl?: string;
}

interface WeddingTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontStyle: string;
  backgroundStyle: string;
}

class WeddingDesignService {
  // Predefined wedding themes based on common styles
  private themes: Record<string, WeddingTheme> = {
    beach: {
      name: "Beach Wedding",
      primaryColor: "#4A90E2",
      secondaryColor: "#F5A623",
      fontStyle: "casual",
      backgroundStyle: "ocean",
    },
    elegant: {
      name: "Elegant Wedding",
      primaryColor: "#8B5CF6",
      secondaryColor: "#F3F4F6",
      fontStyle: "serif",
      backgroundStyle: "minimalist",
    },
    rustic: {
      name: "Rustic Wedding",
      primaryColor: "#92400E",
      secondaryColor: "#FEF3C7",
      fontStyle: "handwritten",
      backgroundStyle: "wood",
    },
    garden: {
      name: "Garden Wedding",
      primaryColor: "#059669",
      secondaryColor: "#FDE68A",
      fontStyle: "natural",
      backgroundStyle: "floral",
    },
    modern: {
      name: "Modern Wedding",
      primaryColor: "#1F2937",
      secondaryColor: "#F9FAFB",
      fontStyle: "sans-serif",
      backgroundStyle: "geometric",
    },
    vintage: {
      name: "Vintage Wedding",
      primaryColor: "#BE185D",
      secondaryColor: "#FDF2F8",
      fontStyle: "vintage",
      backgroundStyle: "ornate",
    },
  };

  private getThemeFromStyle(style?: string, colorTheme?: string): WeddingTheme {
    // Try to match style first
    if (style) {
      const matchedTheme = Object.keys(this.themes).find((key) =>
        style.toLowerCase().includes(key)
      );
      if (matchedTheme) {
        return this.themes[matchedTheme];
      }
    }

    // Try to match color theme
    if (colorTheme) {
      const colorLower = colorTheme.toLowerCase();
      if (colorLower.includes("blue") || colorLower.includes("ocean")) {
        return this.themes.beach;
      }
      if (colorLower.includes("purple") || colorLower.includes("lavender")) {
        return this.themes.elegant;
      }
      if (colorLower.includes("brown") || colorLower.includes("wood")) {
        return this.themes.rustic;
      }
      if (colorLower.includes("green") || colorLower.includes("nature")) {
        return this.themes.garden;
      }
      if (colorLower.includes("black") || colorLower.includes("white")) {
        return this.themes.modern;
      }
      if (colorLower.includes("pink") || colorLower.includes("rose")) {
        return this.themes.vintage;
      }
    }

    // Default to elegant
    return this.themes.elegant;
  }

  async generateWeddingThumbnail(
    accessToken: string,
    options: WeddingDesignOptions
  ): Promise<{ thumbnailUrl: string; editUrl: string; designId: string }> {
    try {
      // Format date
      const formattedDate = options.weddingDate
        ? options.weddingDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      // Prepare wedding data for design creation
      const weddingData = {
        brideName: options.brideName,
        groomName: options.groomName,
        venue: options.venue,
        date: formattedDate,
        colorTheme: options.colorTheme,
        heroImageUrl: options.heroImageUrl,
        storyImageUrl: options.storyImageUrl,
      };

      // Strategy 1: Try dynamic design creation (no template needed)
      try {
        console.log("Attempting dynamic design creation...");
        const result = await CanvaAPI.createDynamicWeddingDesign(accessToken, weddingData);
        console.log("Dynamic design created successfully");
        return result;
      } catch (dynamicError) {
        console.log("Dynamic design creation failed:", dynamicError);
      }

      // Strategy 2: Try public template search and creation
      try {
        console.log("Attempting public template creation...");
        const result = await CanvaAPI.createFromPublicTemplate(accessToken, weddingData);
        console.log("Public template design created successfully");
        return result;
      } catch (publicError) {
        console.log("Public template creation failed:", publicError);
      }

      // Strategy 3: Try with brand template if available
      const brandTemplateId = process.env.CANVA_WEDDING_TEMPLATE_ID;
      if (brandTemplateId) {
        try {
          console.log("Attempting autofill with brand template...");
          const result = await CanvaAPI.createWeddingDesign(
            accessToken,
            brandTemplateId,
            weddingData
          );
          console.log("Brand template autofill successful");
          return result;
        } catch (templateError) {
          console.log("Brand template autofill failed:", templateError);
        }
      }

      // Strategy 4: Create simple design as fallback
      try {
        console.log("Attempting simple design creation...");
        const result = await CanvaAPI.createSimpleWeddingDesign(accessToken, weddingData);
        console.log("Simple design created successfully");
        return result;
      } catch (simpleError) {
        console.log("Simple design creation failed:", simpleError);
      }

      // Strategy 5: Professional themed placeholder (always works)
      console.log("Using professional themed placeholder as final strategy");
      const placeholderUrl = this.generateFallbackThumbnail(options);
      const canvaCreateUrl = `https://www.canva.com/create/wedding-invitations/?query=${encodeURIComponent(this.formatCoupleNames(options.brideName, options.groomName))}&color=${encodeURIComponent(options.colorTheme || "elegant")}`;

      return {
        designId: `placeholder-${Date.now()}`,
        thumbnailUrl: placeholderUrl,
        editUrl: canvaCreateUrl,
      };
    } catch (error) {
      console.error("Error in generateWeddingThumbnail:", error);

      // Always fall back to placeholder on any unexpected error
      const placeholderUrl = this.generateFallbackThumbnail(options);
      const canvaCreateUrl = `https://www.canva.com/create/wedding-invitations/`;

      return {
        designId: "fallback",
        thumbnailUrl: placeholderUrl,
        editUrl: canvaCreateUrl,
      };
    }
  }

  private formatCoupleNames(brideName?: string, groomName?: string): string {
    if (brideName && groomName) {
      return `${brideName} & ${groomName}`;
    }
    if (brideName) {
      return brideName;
    }
    if (groomName) {
      return groomName;
    }
    return "Wedding Celebration";
  }

  // Generate a professional wedding invitation-style thumbnail
  generateFallbackThumbnail(options: WeddingDesignOptions): string {
    const coupleNames = this.formatCoupleNames(options.brideName, options.groomName);

    // If we have hero or story images, use them as CSS backgrounds instead of plain colors
    if (options.heroImageUrl || options.storyImageUrl) {
      return this.generateImageBackgroundThumbnail(
        options.heroImageUrl || options.storyImageUrl!,
        coupleNames,
        options.colorTheme
      );
    }

    // Create theme-based colors and styling
    const themeStyles = {
      romantic: { bg: "ff69b4", fg: "ffffff", emoji: "💕" },
      elegant: { bg: "2c3e50", fg: "f8f9fa", emoji: "👑" },
      beach: { bg: "3498db", fg: "ffffff", emoji: "🌊" },
      rustic: { bg: "d35400", fg: "f39c12", emoji: "🌾" },
      garden: { bg: "27ae60", fg: "ffffff", emoji: "🌸" },
      vintage: { bg: "e74c3c", fg: "f8c471", emoji: "✨" },
      modern: { bg: "34495e", fg: "ecf0f1", emoji: "💎" },
    };

    const colorTheme = options.colorTheme?.toLowerCase() || "elegant";
    const style = themeStyles[colorTheme as keyof typeof themeStyles] || themeStyles.elegant;

    // Simple text with just the couple names
    const text = coupleNames;

    // Use placehold.co which is reliable
    return `https://placehold.co/800x600/${style.bg}/${style.fg}?text=${encodeURIComponent(text)}`;
  }

  // Generate thumbnail with hero/story image as background
  private generateImageBackgroundThumbnail(
    imageUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _coupleNames: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _colorTheme?: string
  ): string {
    // For now, return the image URL directly since most image components can't render HTML
    // We'll return the hero/story image directly so it shows as background
    return imageUrl;
  }
}

const weddingDesignServiceInstance = new WeddingDesignService();
export default weddingDesignServiceInstance;
