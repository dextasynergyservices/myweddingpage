import { NextResponse } from "next/server";
import TokenStore from "@/lib/tokenStore";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Debug token storage
    const tokenFile = path.join(process.cwd(), ".canva-token.json");

    console.log("Token file path:", tokenFile);
    console.log("Token file exists:", fs.existsSync(tokenFile));

    if (fs.existsSync(tokenFile)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenFile, "utf8"));
      console.log("Token data keys:", Object.keys(tokenData));
      console.log("Token length:", tokenData.accessToken?.length || 0);
      console.log(
        "Token starts with:",
        tokenData.accessToken?.substring(0, 20) || "N/A"
      );
      console.log("Expires at:", tokenData.expiresAt);
      console.log(
        "Is expired:",
        tokenData.expiresAt ? Date.now() > tokenData.expiresAt : false
      );
    }

    const accessToken = TokenStore.getAccessToken();

    return NextResponse.json({
      success: true,
      debug: {
        tokenFileExists: fs.existsSync(tokenFile),
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        tokenPreview: accessToken?.substring(0, 20) || "N/A",
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
