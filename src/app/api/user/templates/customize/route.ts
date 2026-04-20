/**
 * API endpoint for saving user template customization
 * PUT /api/user/templates/customize
 *
 * Safely saves color and font customization without breaking existing functionality
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { validateColor } from "@/lib/color-utils";
import {
  SaveCustomizationRequest,
  SaveCustomizationResponse,
  UserCustomization,
  ColorScheme,
  FontScheme,
} from "@/types/customization";

/**
 * Validates the color scheme object
 */
function validateColorScheme(colors: ColorScheme): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const colorFields = [
    "primary",
    "secondary",
    "accent",
    "background",
    "text",
    "buttonPrimary",
    "buttonPrimaryText",
    "buttonPrimaryHover",
    "buttonSecondary",
    "buttonSecondaryText",
    "buttonSecondaryHover",
  ] as const;

  for (const field of colorFields) {
    const color = colors[field];
    if (!color) {
      errors.push(`Missing required color: ${field}`);
      continue;
    }

    const validation = validateColor(color);
    if (!validation.valid) {
      errors.push(`Invalid ${field}: ${validation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the font scheme object
 */
function validateFontScheme(fonts: FontScheme): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const fontFields = ["heading", "body", "script"] as const;

  for (const field of fontFields) {
    const font = fonts[field];
    if (!font || typeof font !== "string" || font.trim().length === 0) {
      errors.push(`Invalid or missing font: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the complete user customization object
 */
function validateCustomization(customization: UserCustomization): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate mode
  if (
    !customization.mode ||
    !["preset", "custom"].includes(customization.mode)
  ) {
    errors.push('Invalid mode: must be "preset" or "custom"');
  }

  // Validate preset ID if mode is preset
  if (customization.mode === "preset" && !customization.presetId) {
    errors.push('Preset ID is required when mode is "preset"');
  }

  // Validate colors
  if (!customization.colors) {
    errors.push("Missing colors object");
  } else {
    const colorValidation = validateColorScheme(customization.colors);
    if (!colorValidation.valid) {
      errors.push(...colorValidation.errors);
    }
  }

  // Validate fonts
  if (!customization.fonts) {
    errors.push("Missing fonts object");
  } else {
    const fontValidation = validateFontScheme(customization.fonts);
    if (!fontValidation.valid) {
      errors.push(...fontValidation.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * PUT handler for saving customization
 */
export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    let body: SaveCustomizationRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { templateId, customization } = body;

    // Validate required fields
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    if (!customization) {
      return NextResponse.json(
        { success: false, error: "Customization data is required" },
        { status: 400 }
      );
    }

    // Validate customization structure
    const validation = validateCustomization(customization);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid customization data",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Add updated timestamp
    const customizationWithTimestamp: UserCustomization = {
      ...customization,
      updatedAt: new Date().toISOString(),
    };

    // Find existing UserTemplate or create new one
    const existingUserTemplate = await prisma.userTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId,
        },
      },
    });

    let userTemplate;

    if (existingUserTemplate) {
      // Update existing UserTemplate
      userTemplate = await prisma.userTemplate.update({
        where: { id: existingUserTemplate.id },
        data: {
          colorScheme: customizationWithTimestamp as never, // Cast to avoid JSON type issues
          updatedAt: new Date(),
        },
        include: {
          template: {
            include: {
              sections: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    } else {
      // Create new UserTemplate with customization
      userTemplate = await prisma.userTemplate.create({
        data: {
          userId: user.id,
          templateId,
          colorScheme: customizationWithTimestamp as never,
          content: {}, // Empty content for new template
          isSelected: false,
        },
        include: {
          template: {
            include: {
              sections: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    }

    // Prepare response
    const response: SaveCustomizationResponse = {
      success: true,
      userTemplate: {
        id: userTemplate.id,
        userId: userTemplate.userId,
        templateId: userTemplate.templateId,
        colorScheme: userTemplate.colorScheme as unknown as UserCustomization,
        updatedAt: userTemplate.updatedAt.toISOString(),
      },
      message: "Customization saved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error saving customization:", error);

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
