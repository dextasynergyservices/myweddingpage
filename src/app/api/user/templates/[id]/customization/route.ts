/**
 * API endpoint for fetching user template customization
 * GET /api/user/templates/[id]/customization
 *
 * Retrieves color and font customization for a specific user template
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { GetCustomizationResponse, UserCustomization } from "@/types/customization";

/**
 * GET handler for fetching customization
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Find UserTemplate for this user and template
    const userTemplate = await prisma.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId,
        },
      },
      include: {
        template: true,
      },
    });

    // If no UserTemplate exists, return default customization
    if (!userTemplate) {
      const response: GetCustomizationResponse = {
        success: true,
        customization: null,
        message: "No customization found for this template. Using defaults.",
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Extract customization from colorScheme field
    let customization: UserCustomization | null = null;

    if (userTemplate.colorScheme) {
      try {
        // Check if colorScheme is already a UserCustomization object
        const colorSchemeData = userTemplate.colorScheme as unknown;

        if (
          typeof colorSchemeData === "object" &&
          colorSchemeData !== null &&
          "mode" in colorSchemeData &&
          "colors" in colorSchemeData &&
          "fonts" in colorSchemeData
        ) {
          // It's already a UserCustomization object
          customization = colorSchemeData as UserCustomization;
        } else {
          // It might be an old format or just a color scheme
          // Return null to use defaults
          customization = null;
        }
      } catch (error) {
        console.error("Error parsing colorScheme:", error);
        customization = null;
      }
    }

    const response: GetCustomizationResponse = {
      success: true,
      customization,
      message: customization
        ? "Customization loaded successfully"
        : "No valid customization found. Using defaults.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching customization:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
