import { NextRequest, NextResponse } from "next/server";
import TokenStore from "@/lib/tokenStore";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, expiresIn } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Access token required" }, { status: 400 });
    }

    // Manually store the token (for testing purposes)
    TokenStore.setTokens(accessToken, undefined, expiresIn || 3600);

    return NextResponse.json({
      success: true,
      message: "Token stored successfully",
      tokenLength: accessToken.length,
    });
  } catch (error) {
    console.error("Error storing token:", error);
    return NextResponse.json({ success: false, error: "Failed to store token" }, { status: 500 });
  }
}
