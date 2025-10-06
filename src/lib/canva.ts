import axios from "axios";
import crypto from "crypto";

// Canva API client
class CanvaAPI {
  private baseURL = "https://api.canva.com/rest/v1";
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.CANVA_CLIENT_ID || "";
    this.clientSecret = process.env.CANVA_CLIENT_SECRET || "";
  }

  // Check if credentials are configured (call this before using the API)
  private checkCredentials(): void {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Canva API credentials not found in environment variables");
    }
  }

  // Generate PKCE values
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(96).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

    return { codeVerifier, codeChallenge };
  }

  // Generate state value
  private generateState(): string {
    return crypto.randomBytes(96).toString("base64url");
  }

  // Generate OAuth URL for user authorization with PKCE
  generateAuthURL(redirectUri: string): { authUrl: string; codeVerifier: string; state: string } {
    this.checkCredentials(); // Check credentials before using
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = this.generateState();

    // Use Canva's expected OAuth URL format and scope
    const baseUrl = "https://www.canva.com/api/oauth/authorize";
    const params = new URLSearchParams({
      code_challenge_method: "S256",
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope:
        "comment:write brandtemplate:meta:read design:permission:write design:content:write folder:permission:write app:write design:meta:read folder:read brandtemplate:content:read design:content:read app:read profile:read asset:write design:permission:read comment:read folder:permission:read folder:write asset:read",
      code_challenge: codeChallenge,
      state,
    });

    return {
      authUrl: `${baseUrl}?${params.toString()}`,
      codeVerifier,
      state,
    };
  }

  // Exchange authorization code for access token using PKCE
  async getAccessToken(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
    this.checkCredentials(); // Check credentials before using
    try {
      const tokenUrl = "https://api.canva.com/rest/v1/oauth/token";
      const tokenData = {
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier,
      };

      console.log("Exchanging code for token with data:", {
        ...tokenData,
        client_secret: "[HIDDEN]",
        code: code.substring(0, 10) + "...",
        code_verifier: codeVerifier.substring(0, 10) + "...",
      });

      const response = await axios.post(tokenUrl, tokenData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("Token exchange successful:", {
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
      });

      return response.data;
    } catch (error) {
      console.error("Error exchanging authorization code for access token:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      throw error;
    }
  }

  // Upload an asset to Canva
  async uploadAsset(accessToken: string, imageUrl: string, name: string): Promise<string> {
    try {
      const assetResponse = await axios.post(
        `${this.baseURL}/assets`,
        {
          type: "image",
          url: imageUrl,
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return assetResponse.data.asset.id;
    } catch (error) {
      console.error("Error uploading asset to Canva:", error);
      throw error;
    }
  }

  // Create a wedding design using autofill API
  async createWeddingDesign(
    accessToken: string,
    brandTemplateId: string,
    weddingData: {
      brideName?: string;
      groomName?: string;
      venue?: string;
      date?: string;
      colorTheme?: string;
      heroImageUrl?: string;
      storyImageUrl?: string;
    }
  ): Promise<{ designId: string; thumbnailUrl: string; editUrl: string }> {
    try {
      console.log("Creating wedding design from brand template:", brandTemplateId);

      // Prepare autofill data with common field names
      const autofillData: Record<string, { type: string; text: string }> = {};
      const coupleNames = this.formatCoupleNames(weddingData.brideName, weddingData.groomName);

      // Try multiple common field names for each piece of data
      if (coupleNames) {
        autofillData.couple_names = { type: "text", text: coupleNames };
        autofillData.COUPLE_NAMES = { type: "text", text: coupleNames };
        autofillData.names = { type: "text", text: coupleNames };
      }

      if (weddingData.brideName) {
        autofillData.bride_name = { type: "text", text: weddingData.brideName };
        autofillData.BRIDE_NAME = { type: "text", text: weddingData.brideName };
        autofillData.bride = { type: "text", text: weddingData.brideName };
      }

      if (weddingData.groomName) {
        autofillData.groom_name = { type: "text", text: weddingData.groomName };
        autofillData.GROOM_NAME = { type: "text", text: weddingData.groomName };
        autofillData.groom = { type: "text", text: weddingData.groomName };
      }

      if (weddingData.venue) {
        autofillData.venue = { type: "text", text: weddingData.venue };
        autofillData.VENUE = { type: "text", text: weddingData.venue };
        autofillData.location = { type: "text", text: weddingData.venue };
      }

      if (weddingData.date) {
        const formattedDate = new Date(weddingData.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        autofillData.wedding_date = { type: "text", text: formattedDate };
        autofillData.DATE = { type: "text", text: formattedDate };
        autofillData.date = { type: "text", text: formattedDate };
      }

      // Create autofill job
      const autofillResponse = await axios.post(
        `${this.baseURL}/autofills`,
        {
          brand_template_id: brandTemplateId,
          title: `${coupleNames} Wedding`,
          data: autofillData,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Autofill job created:", autofillResponse.data);
      const jobId = autofillResponse.data.job.id;

      // Poll for job completion
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          const jobResponse = await axios.get(`${this.baseURL}/autofills/${jobId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const job = jobResponse.data.job;
          console.log("Job status:", job.status);

          if (job.status === "success") {
            const design = job.result.design;
            return {
              designId: design.id,
              thumbnailUrl: design.thumbnail?.url || design.urls?.view_url || design.urls?.edit_url,
              editUrl: design.urls?.edit_url,
            };
          }

          if (job.status === "failed") {
            throw new Error(`Autofill job failed: ${job.error?.message || "Unknown error"}`);
          }

          attempts++;
        } catch (jobError) {
          console.warn("Job status check failed:", jobError);
          attempts++;
        }
      }

      throw new Error("Autofill job timed out");
    } catch (error) {
      console.error("Error creating wedding design from brand template:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Create a wedding design with theme-based styling (no template needed)
  async createDynamicWeddingDesign(
    accessToken: string,
    weddingData: {
      brideName?: string;
      groomName?: string;
      venue?: string;
      date?: string;
      colorTheme?: string;
      heroImageUrl?: string;
      storyImageUrl?: string;
    }
  ): Promise<{ designId: string; thumbnailUrl: string; editUrl: string }> {
    try {
      const coupleNames = this.formatCoupleNames(weddingData.brideName, weddingData.groomName);
      console.log("Creating dynamic wedding design for:", coupleNames);

      // Create a new design with proper format based on theme
      const designTitle = `${coupleNames} Wedding - ${weddingData.colorTheme || "Classic"} Theme`;

      const createResponse = await axios.post(
        `${this.baseURL}/designs`,
        {
          design_type: {
            type: "preset",
            name: "presentation",
          },
          title: designTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const designId = createResponse.data.design.id;
      const editUrl = createResponse.data.design.urls.edit_url;

      console.log("Dynamic design created:", designId);

      // If we have hero or story images, try to add them as background elements
      if (weddingData.heroImageUrl || weddingData.storyImageUrl) {
        try {
          await this.addBackgroundImageToDesign(
            accessToken,
            designId,
            weddingData.heroImageUrl || weddingData.storyImageUrl!,
            coupleNames,
            weddingData.colorTheme
          );
          console.log("Background image added to design");
        } catch (bgError) {
          console.warn("Could not add background image, continuing without it:", bgError);
        }
      }

      // Wait for design to be ready and get thumbnail
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        const designResponse = await axios.get(`${this.baseURL}/designs/${designId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return {
          designId,
          thumbnailUrl:
            designResponse.data.design.thumbnail?.url ||
            this.generateFallbackThumbnail(weddingData),
          editUrl,
        };
      } catch {
        console.warn("Could not get design thumbnail, using themed placeholder");
        return {
          designId,
          thumbnailUrl: this.generateFallbackThumbnail(weddingData),
          editUrl,
        };
      }
    } catch (error) {
      console.error("Error creating dynamic wedding design:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Helper method to add background image to a design
  private async addBackgroundImageToDesign(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accessToken: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _designId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _imageUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _coupleNames: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _colorTheme?: string
  ): Promise<void> {
    try {
      // Skip background image for now since the upload API is returning 400
      // This is a Canva API limitation - we'll focus on getting the design thumbnails working first
      console.log("Skipping background image upload for now due to API limitations");
      return;

      /*
      // This code is commented out until we can get the proper Canva asset upload format
      // First, we need to upload the image to Canva
      const uploadResponse = await axios.post(`${this.baseURL}/assets`, {
        type: 'image',
        name: `${coupleNames} Wedding Background`,
        url: imageUrl
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const assetId = uploadResponse.data.asset.id;

      // Wait for upload to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Now add the image as a background element to the design
      await axios.post(`${this.baseURL}/designs/${designId}/elements`, {
        type: 'image',
        asset_id: assetId,
        position: {
          x: 0,
          y: 0
        },
        dimensions: {
          width: 800,
          height: 600
        }
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Background image and text overlay added successfully');
      */
    } catch (error) {
      console.error("Error adding background image to design:", error);
      throw error;
    }
  }

  // Create different design types for better compatibility
  async createFromPublicTemplate(
    accessToken: string,
    weddingData: {
      brideName?: string;
      groomName?: string;
      venue?: string;
      date?: string;
      colorTheme?: string;
      heroImageUrl?: string;
      storyImageUrl?: string;
    }
  ): Promise<{ designId: string; thumbnailUrl: string; editUrl: string }> {
    try {
      const coupleNames = this.formatCoupleNames(weddingData.brideName, weddingData.groomName);
      console.log("Creating design using available design types...");

      // Try different design types that might work better for weddings
      const designTypes = ["presentation", "doc"];

      for (const designType of designTypes) {
        try {
          const createResponse = await axios.post(
            `${this.baseURL}/designs`,
            {
              design_type: {
                type: "preset",
                name: designType,
              },
              title: `${coupleNames} Wedding - ${designType}`,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const designId = createResponse.data.design.id;
          const editUrl = createResponse.data.design.urls.edit_url;

          console.log(`${designType} design created:`, designId);

          // Wait for design to be ready
          await new Promise((resolve) => setTimeout(resolve, 3000));

          try {
            const designResponse = await axios.get(`${this.baseURL}/designs/${designId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            return {
              designId,
              thumbnailUrl:
                designResponse.data.design.thumbnail?.url ||
                this.generateFallbackThumbnail(weddingData),
              editUrl,
            };
          } catch {
            return {
              designId,
              thumbnailUrl: this.generateFallbackThumbnail(weddingData),
              editUrl,
            };
          }
        } catch (designError) {
          console.log(`Failed to create ${designType} design:`, designError);
          continue;
        }
      }

      throw new Error("All design types failed");
    } catch (error) {
      console.error("Error creating design from public template:", error);
      throw error;
    }
  }

  // Create a simple design for fallback (when dynamic content fails)
  async createSimpleWeddingDesign(
    accessToken: string,
    weddingData: {
      brideName?: string;
      groomName?: string;
      venue?: string;
      date?: string;
      colorTheme?: string;
      heroImageUrl?: string;
      storyImageUrl?: string;
    }
  ): Promise<{ designId: string; thumbnailUrl: string; editUrl: string }> {
    try {
      // Create a presentation design which should work for most cases
      const coupleNames = this.formatCoupleNames(weddingData.brideName, weddingData.groomName);

      const createResponse = await axios.post(
        `${this.baseURL}/designs`,
        {
          design_type: {
            type: "preset",
            name: "presentation",
          },
          title: `${coupleNames} Wedding`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const designId = createResponse.data.design.id;
      const editUrl = createResponse.data.design.urls.edit_url;

      console.log("Simple design created successfully:", designId);

      // Try to get a thumbnail after a short wait
      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const designResponse = await axios.get(`${this.baseURL}/designs/${designId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return {
          designId,
          thumbnailUrl:
            designResponse.data.design.thumbnail?.url ||
            this.generateFallbackThumbnail(weddingData),
          editUrl,
        };
      } catch {
        console.warn("Could not get design thumbnail, using themed placeholder");
        return {
          designId,
          thumbnailUrl: this.generateFallbackThumbnail(weddingData),
          editUrl,
        };
      }
    } catch (error) {
      console.error("Error creating simple wedding design:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Helper method to format couple names
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

  // Helper method to generate beautiful wedding-themed thumbnail for failed Canva designs
  private generateFallbackThumbnail(weddingData: {
    brideName?: string;
    groomName?: string;
    colorTheme?: string;
    heroImageUrl?: string;
    storyImageUrl?: string;
  }): string {
    const coupleNames = this.formatCoupleNames(weddingData.brideName, weddingData.groomName);

    // If we have hero or story images, use them directly instead of placeholder
    if (weddingData.heroImageUrl || weddingData.storyImageUrl) {
      return weddingData.heroImageUrl || weddingData.storyImageUrl!;
    }

    // Use a simple, working placeholder service
    const theme = weddingData.colorTheme?.toLowerCase() || "elegant";

    // Create theme-based colors and text
    const themeStyles = {
      romantic: { bg: "ff69b4", fg: "ffffff", emoji: "💕" },
      elegant: { bg: "2c3e50", fg: "f8f9fa", emoji: "👑" },
      beach: { bg: "3498db", fg: "ffffff", emoji: "🌊" },
      rustic: { bg: "d35400", fg: "f39c12", emoji: "🌾" },
      garden: { bg: "27ae60", fg: "ffffff", emoji: "🌸" },
      vintage: { bg: "e74c3c", fg: "f8c471", emoji: "✨" },
      modern: { bg: "34495e", fg: "ecf0f1", emoji: "💎" },
    };

    const style = themeStyles[theme as keyof typeof themeStyles] || themeStyles.elegant;

    // Simple text with just couple names
    const text = coupleNames;

    // Use placehold.co which has better URL format support
    return `https://placehold.co/800x600/${style.bg}/${style.fg}?text=${encodeURIComponent(text)}`;
  }

  // Get brand templates
  async getBrandTemplates(
    accessToken: string
  ): Promise<Array<{ id: string; name: string; thumbnail?: { url: string }; tags?: string[] }>> {
    try {
      const response = await axios.get(`${this.baseURL}/brand-templates`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching brand templates:", error);
      throw error;
    }
  }
}

const canvaAPIInstance = new CanvaAPI();
export default canvaAPIInstance;
