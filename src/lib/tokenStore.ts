import fs from "fs";
import path from "path";

// File-based token storage for development (persists across requests)
class TokenStore {
  private static tokenFile = path.join(process.cwd(), ".canva-token.json");

  static setTokens(accessToken: string, refreshToken?: string, expiresIn?: number) {
    const tokenData = {
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
      storedAt: Date.now(),
    };

    try {
      fs.writeFileSync(this.tokenFile, JSON.stringify(tokenData, null, 2));
      console.log("Canva tokens stored successfully to file");
      console.log("Access token length:", accessToken.length);
      console.log("Expires in:", expiresIn, "seconds");
      if (tokenData.expiresAt) {
        console.log("Token expires at:", new Date(tokenData.expiresAt).toISOString());
      }
    } catch (error) {
      console.error("Failed to store tokens to file:", error);
    }
  }

  static getAccessToken(): string | null {
    try {
      if (!fs.existsSync(this.tokenFile)) {
        console.log("No token file found");
        return null;
      }

      const tokenData = JSON.parse(fs.readFileSync(this.tokenFile, "utf8"));
      console.log("Token loaded from file");
      console.log("Token length:", tokenData.accessToken?.length || 0);

      // Check if token is expired
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        console.warn("Canva access token has expired");
        this.clearTokens();
        return null;
      }

      return tokenData.accessToken;
    } catch (error) {
      console.error("Failed to read token from file:", error);
      return null;
    }
  }

  static hasValidToken(): boolean {
    return this.getAccessToken() !== null;
  }

  static clearTokens() {
    try {
      if (fs.existsSync(this.tokenFile)) {
        fs.unlinkSync(this.tokenFile);
        console.log("Token file cleared");
      }
    } catch (error) {
      console.error("Failed to clear token file:", error);
    }
  }

  static getTokenStatus() {
    try {
      if (!fs.existsSync(this.tokenFile)) {
        return {
          hasToken: false,
          isExpired: false,
          expiresAt: null,
        };
      }

      const tokenData = JSON.parse(fs.readFileSync(this.tokenFile, "utf8"));
      const isExpired = tokenData.expiresAt ? Date.now() > tokenData.expiresAt : false;

      return {
        hasToken: !!tokenData.accessToken,
        isExpired,
        expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt).toISOString() : null,
      };
    } catch (error) {
      console.error("Failed to get token status:", error);
      return {
        hasToken: false,
        isExpired: false,
        expiresAt: null,
      };
    }
  }
}

export default TokenStore;
