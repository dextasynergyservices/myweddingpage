import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary } from "cloudinary";
import {
  createUserAwareRateLimit,
  addRateLimitHeaders,
} from "@/lib/rate-limit";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface SignatureParams {
  folder: string;
  public_id?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  allowed_formats?: string[];
  max_file_size?: number;
  quality?: string;
  transformation?: string;
  context?: string;
}

// Create rate limiter for signature generation
const signatureRateLimit = createUserAwareRateLimit(
  {
    maxRequests: 100, // Authenticated users: 100 signatures/hour
    windowMs: 60 * 60 * 1000, // 1 hour
    message:
      "Signature generation rate limit exceeded. Please wait before requesting more signatures.",
  },
  {
    maxRequests: 10, // Unauthenticated users: 10 signatures/hour
    windowMs: 60 * 60 * 1000, // 1 hour
    message:
      "Signature generation rate limit exceeded. Please sign in for higher limits.",
  },
  async () => {
    try {
      const session = await getServerSession(authOptions);
      return session?.user?.id || null;
    } catch {
      return null;
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await signatureRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { uploadType, fileName, fileSize } = body;

    // Validate upload type
    const allowedUploadTypes = ["profile", "hero", "story", "logo", "general"];
    if (!allowedUploadTypes.includes(uploadType)) {
      return NextResponse.json(
        { error: "Invalid upload type" },
        { status: 400 }
      );
    }

    // Define upload parameters based on type
    let uploadParams: SignatureParams;

    switch (uploadType) {
      case "profile":
        uploadParams = {
          folder: `users/${session.user.id}/profile`,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          max_file_size: 5 * 1024 * 1024, // 5MB
          quality: "auto:good",
          transformation: "c_fill,g_face,h_400,w_400", // Square crop focusing on face
          context: `user_id=${session.user.id}|type=profile`,
        };
        break;

      case "hero":
        uploadParams = {
          folder: `users/${session.user.id}/wedding/hero`,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          max_file_size: 10 * 1024 * 1024, // 10MB
          quality: "auto:good",
          transformation: "c_fill,h_800,w_1200", // Hero image dimensions
          context: `user_id=${session.user.id}|type=hero`,
        };
        break;

      case "story":
        uploadParams = {
          folder: `users/${session.user.id}/wedding/story`,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          max_file_size: 8 * 1024 * 1024, // 8MB
          quality: "auto:good",
          transformation: "c_fill,h_600,w_800", // Story image dimensions
          context: `user_id=${session.user.id}|type=story`,
        };
        break;

      case "logo":
        uploadParams = {
          folder: `users/${session.user.id}/wedding/logo`,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
          max_file_size: 2 * 1024 * 1024, // 2MB
          quality: "auto:best",
          transformation: "c_fit,h_200,w_200", // Logo dimensions
          context: `user_id=${session.user.id}|type=logo`,
        };
        break;

      case "general":
        uploadParams = {
          folder: `users/${session.user.id}/general`,
          resource_type: "auto", // Auto-detect type
          allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
          max_file_size: 10 * 1024 * 1024, // 10MB
          quality: "auto:good",
          context: `user_id=${session.user.id}|type=general`,
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid upload type" },
          { status: 400 }
        );
    }

    // Add timestamp and generate unique public_id if not provided
    const timestamp = Math.round(Date.now() / 1000);
    const public_id =
      uploadParams.public_id || `${uploadType}_${session.user.id}_${timestamp}`;

    // Prepare parameters for signature
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: uploadParams.folder,
      public_id,
      resource_type: uploadParams.resource_type || "auto",
    };

    // Add optional parameters if they exist
    if (uploadParams.allowed_formats) {
      paramsToSign.allowed_formats = uploadParams.allowed_formats.join(",");
    }
    if (uploadParams.max_file_size) {
      paramsToSign.max_file_size = uploadParams.max_file_size;
    }
    if (uploadParams.quality) {
      paramsToSign.quality = uploadParams.quality;
    }
    if (uploadParams.transformation) {
      paramsToSign.transformation = uploadParams.transformation;
    }
    if (uploadParams.context) {
      paramsToSign.context = uploadParams.context;
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    // Log the signature generation for debugging
    console.log("Signature generated for:", {
      uploadType,
      userId: session.user.id,
      fileName,
      fileSize,
      timestamp,
      public_id,
    });

    // Return signature and upload parameters
    const response = NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: uploadParams.folder,
      public_id,
      resource_type: uploadParams.resource_type || "auto",
      ...paramsToSign,
    });

    // Add rate limit headers
    return addRateLimitHeaders(request, response);
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
