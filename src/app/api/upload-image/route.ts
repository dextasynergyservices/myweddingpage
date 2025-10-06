import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { trackUploadStart, trackUploadComplete } from "@/lib/upload-monitor";
import { createUserAwareRateLimit, rateLimitConfigs, addRateLimitHeaders } from "@/lib/rate-limit";
import { validateFile } from "@/lib/file-validation";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create rate limiter for upload endpoint
const uploadRateLimit = createUserAwareRateLimit(
  rateLimitConfigs.upload, // Authenticated users: 20 uploads/hour
  {
    maxRequests: 5, // Unauthenticated users: 5 uploads/hour
    windowMs: 60 * 60 * 1000, // 1 hour
    message:
      "Upload rate limit exceeded. Please sign in for higher limits or wait before uploading more files.",
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

/**
 * Updated /api/upload-image endpoint using direct Cloudinary uploads
 * This endpoint now uses signed uploads with user-specific folder organization
 * instead of generic upload presets (more secure and organized)
 */
export async function POST(request: Request) {
  let trackingData: ReturnType<typeof trackUploadStart> | undefined;

  try {
    // Apply rate limiting
    const rateLimitResponse = await uploadRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("uploadType") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Start tracking the upload
    trackingData = trackUploadStart(uploadType, file.name, file.size, session.user.id);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Check file size (10MB limit for general uploads)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Advanced file validation with magic number verification
    const validationResult = await validateFile(file, file.name, file.type, session.user.id);

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: validationResult.error || "File validation failed",
          details: validationResult.details,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64Data}`;

    // Define upload parameters based on type and user
    const timestamp = Math.round(Date.now() / 1000);
    const public_id = `${uploadType}_${session.user.id}_${timestamp}`;

    try {
      // Log upload attempt for debugging
      console.log("Attempting Cloudinary upload:", {
        uploadType,
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        public_id,
        folder: `users/${session.user.id}/${uploadType}`,
      });

      // Use Cloudinary SDK for secure server-side upload
      const uploadOptions: UploadApiOptions = {
        folder: `users/${session.user.id}/${uploadType}`,
        public_id,
        resource_type: "auto",
        quality: "auto:good",
        context: `user_id=${session.user.id}|type=${uploadType}`,
      };

      // Add transformations based on upload type
      if (uploadType === "profile") {
        uploadOptions.transformation = "c_fill,g_face,h_400,w_400";
      } else if (uploadType === "hero") {
        uploadOptions.transformation = "c_fill,h_800,w_1200";
      } else if (uploadType === "logo") {
        uploadOptions.transformation = "c_fit,h_200,w_200";
      }

      let result;
      try {
        // Try upload with transformations first
        result = await cloudinary.uploader.upload(dataUri, uploadOptions);
      } catch (transformError) {
        console.warn(
          "Upload with transformations failed, trying without transformations:",
          transformError
        );

        // Fallback: upload without transformations
        const simpleOptions: UploadApiOptions = {
          folder: `users/${session.user.id}/${uploadType}`,
          public_id,
          resource_type: "auto",
          quality: "auto:good",
          context: `user_id=${session.user.id}|type=${uploadType}`,
        };

        result = await cloudinary.uploader.upload(dataUri, simpleOptions);
      }

      console.log("Direct upload successful:", {
        uploadType,
        userId: session.user.id,
        public_id: result.public_id,
        secure_url: result.secure_url,
        bytes: result.bytes,
      });

      // Track successful upload
      trackUploadComplete(
        trackingData,
        true,
        result.secure_url,
        undefined, // No compression in this route
        undefined
      );

      // Return response in the same format as the old endpoint for compatibility
      const response = NextResponse.json({
        secure_url: result.secure_url,
        url: result.secure_url, // For backward compatibility
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
        version: result.version,
      });

      // Add rate limit headers
      return addRateLimitHeaders(request, response);
    } catch (uploadError) {
      console.error("Cloudinary upload error details:", {
        error: uploadError,
        message: uploadError instanceof Error ? uploadError.message : String(uploadError),
        stack: uploadError instanceof Error ? uploadError.stack : undefined,
        uploadType,
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        cloudinaryConfig: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
          api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
          api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
        },
      });

      // Track failed upload
      trackUploadComplete(
        trackingData,
        false,
        undefined,
        undefined,
        uploadError instanceof Error ? uploadError.message : String(uploadError)
      );

      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: "Failed to upload to Cloudinary",
          details: uploadError instanceof Error ? uploadError.message : String(uploadError),
          uploadType,
          fileName: file.name,
          fileSize: file.size,
          troubleshooting: {
            checkCloudinaryConfig:
              "Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set",
            checkFileFormat: "Ensure file is a valid image format (JPEG, PNG, GIF, WebP)",
            checkFileSize: "Ensure file is under 10MB",
            checkNetwork: "Verify network connection to Cloudinary",
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload endpoint error:", error);

    // Track failed upload if we have tracking data
    if (typeof trackingData !== "undefined") {
      trackUploadComplete(
        trackingData,
        false,
        undefined,
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
