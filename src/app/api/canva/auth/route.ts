import { NextRequest, NextResponse } from "next/server";
import CanvaAPI from "@/lib/canva";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const env = searchParams.get("env") || "production"; // 'local' or 'production'

    // Choose redirect URI based on environment
    const redirectUri =
      env === "local"
        ? "http://127.0.0.1:3000/api/canva/oauth/redirect"
        : "https://www.myweddingpage.online/api/canva/oauth/redirect";

    // Generate OAuth URL with PKCE
    const { authUrl, codeVerifier, state } =
      CanvaAPI.generateAuthURL(redirectUri);

    // In a production app, you'd store codeVerifier and state in a secure session
    // For testing, we'll log them and return them (NOT secure for production)
    console.log("Generated PKCE values:");
    console.log("Code Verifier:", codeVerifier);
    console.log("State:", state);
    console.log("Auth URL:", authUrl);

    return NextResponse.json({
      success: true,
      authUrl,
      codeVerifier, // Remove this in production - store in session instead
      state, // Remove this in production - store in session instead
      instructions:
        "Visit the authUrl to authorize the application with Canva. Save the codeVerifier for the token exchange.",
    });
  } catch (error) {
    console.error("Error generating Canva auth URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate Canva auth URL" },
      { status: 500 }
    );
  }
}
