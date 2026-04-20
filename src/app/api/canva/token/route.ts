import { NextRequest, NextResponse } from "next/server";
import CanvaAPI from "@/lib/canva";
import TokenStore from "@/lib/tokenStore";

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier, redirectUri } = await request.json();

    if (!code || !codeVerifier) {
      return NextResponse.json(
        { success: false, error: "Missing code or codeVerifier" },
        { status: 400 }
      );
    }

    const finalRedirectUri =
      redirectUri || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/canva/callback`;

    console.log("Exchanging code for token:");
    console.log("Code:", code);
    console.log("Code Verifier:", codeVerifier);
    console.log("Redirect URI:", finalRedirectUri);

    // Exchange code for access token
    const tokenData = await CanvaAPI.getAccessToken(code, finalRedirectUri, codeVerifier);

    // Store tokens for use in the API
    TokenStore.setTokens(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);

    return NextResponse.json({
      success: true,
      message: "Successfully obtained and stored access token",
      tokenData: {
        access_token: tokenData.access_token.substring(0, 20) + "...", // Hide full token
        expires_in: tokenData.expires_in,
        token_type: "Bearer",
      },
    });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to exchange code for token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
