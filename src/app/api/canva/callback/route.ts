import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      return NextResponse.json(
        { success: false, error: `OAuth error: ${error}` },
        { status: 400 }
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing authorization code" },
        { status: 400 }
      );
    }

    console.log("OAuth callback received:");
    console.log("Code:", code);
    console.log("State:", state);

    // For testing, we need the codeVerifier that was generated earlier
    // In production, you'd retrieve this from a secure session storage
    return NextResponse.json({
      success: true,
      message:
        "Authorization code received. To complete the flow, call /api/canva/token with the code and codeVerifier.",
      code,
      state,
      instructions:
        "You need to exchange this code for an access token using the codeVerifier from the auth step.",
    });
  } catch (error) {
    console.error("Error in Canva OAuth callback:", error);
    return NextResponse.json(
      { success: false, error: "OAuth callback failed" },
      { status: 500 }
    );
  }
}
