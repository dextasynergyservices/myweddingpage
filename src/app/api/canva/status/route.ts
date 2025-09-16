import { NextResponse } from "next/server";
import TokenStore from "@/lib/tokenStore";

export async function GET() {
  try {
    const tokenStatus = TokenStore.getTokenStatus();

    return NextResponse.json({
      success: true,
      tokenStatus,
      message: tokenStatus.hasToken
        ? tokenStatus.isExpired
          ? "Token exists but is expired"
          : "Valid token available"
        : "No token available",
    });
  } catch (error) {
    console.error("Error checking token status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check token status" },
      { status: 500 }
    );
  }
}
