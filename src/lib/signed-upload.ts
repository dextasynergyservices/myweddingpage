/**
 * Signed Cloudinary Upload Utility
 * Handles secure uploads with server-generated signatures
 */

export interface SignedUploadOptions {
  uploadType: "profile" | "hero" | "story" | "logo" | "general";
  onProgress?: (progress: number) => void;
  onProgressUpdate?: (update: {
    progress: number;
    bytesUploaded: number;
    totalBytes: number;
    speed?: number;
    estimatedTimeRemaining?: number;
  }) => void;
  onSuccess?: (result: SignedUploadResult) => void;
  onError?: (error: string) => void;
}

export interface SignedUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
  url: string;
  version: number;
}

export interface SignatureResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id: string;
  resource_type: string;
  [key: string]: string | number | boolean;
}

/**
 * Get upload signature from the server
 */
async function getUploadSignature(
  uploadType: string,
  fileName: string,
  fileSize: number
): Promise<SignatureResponse> {
  const response = await fetch("/api/cloudinary/generate-signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uploadType,
      fileName,
      fileSize,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get upload signature");
  }

  return response.json();
}

/**
 * Upload file to Cloudinary with server signature
 */
export async function uploadWithSignature(
  file: File,
  options: SignedUploadOptions
): Promise<SignedUploadResult> {
  const { uploadType, onProgress, onProgressUpdate, onSuccess, onError } =
    options;

  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Get signature from server
    const signature = await getUploadSignature(
      uploadType,
      file.name,
      file.size
    );

    // Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature.signature);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("api_key", signature.api_key);
    formData.append("folder", signature.folder);
    formData.append("public_id", signature.public_id);
    formData.append("resource_type", signature.resource_type);

    // Add other signature parameters
    Object.keys(signature).forEach((key) => {
      if (
        ![
          "signature",
          "timestamp",
          "api_key",
          "folder",
          "public_id",
          "resource_type",
          "cloud_name",
        ].includes(key)
      ) {
        formData.append(key, String(signature[key]));
      }
    });

    // Upload to Cloudinary with progress tracking
    const uploadPromise = new Promise<SignedUploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      let lastLoaded = 0;
      let lastTime = Date.now();

      if (onProgress || onProgressUpdate) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);

            // Call basic progress callback
            if (onProgress) {
              onProgress(progress);
            }

            // Call detailed progress callback
            if (onProgressUpdate) {
              const currentTime = Date.now();
              const timeDiff = currentTime - lastTime;
              const loadedDiff = event.loaded - lastLoaded;

              let speed: number | undefined;
              let estimatedTimeRemaining: number | undefined;

              if (timeDiff > 100) {
                // Update speed calculation every 100ms
                speed = loadedDiff / (timeDiff / 1000); // bytes per second
                if (speed > 0) {
                  const remainingBytes = event.total - event.loaded;
                  estimatedTimeRemaining = remainingBytes / speed;
                }
                lastTime = currentTime;
                lastLoaded = event.loaded;
              }

              onProgressUpdate({
                progress,
                bytesUploaded: event.loaded,
                totalBytes: event.total,
                speed,
                estimatedTimeRemaining,
              });
            }
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch {
            reject(new Error("Invalid response from Cloudinary"));
          }
        } else {
          let errorMessage = "Upload failed";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error?.message || errorMessage;
          } catch {
            // Keep default error message
          }
          reject(new Error(errorMessage));
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      // Start upload
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`
      );
      xhr.send(formData);
    });

    const result = await uploadPromise;

    // Call success callback
    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";

    // Call error callback
    if (onError) {
      onError(errorMessage);
    }

    throw error;
  }
}

/**
 * Validate file before upload
 */
export function validateUploadFile(
  file: File,
  uploadType: string
): string | null {
  // Size limits based on upload type
  const sizeLimits = {
    profile: 5 * 1024 * 1024, // 5MB
    hero: 10 * 1024 * 1024, // 10MB
    story: 8 * 1024 * 1024, // 8MB
    logo: 2 * 1024 * 1024, // 2MB
    general: 10 * 1024 * 1024, // 10MB
  };

  // Format restrictions
  const allowedFormats = {
    profile: ["jpg", "jpeg", "png", "webp"],
    hero: ["jpg", "jpeg", "png", "webp"],
    story: ["jpg", "jpeg", "png", "webp"],
    logo: ["jpg", "jpeg", "png", "webp", "svg"],
    general: ["jpg", "jpeg", "png", "webp", "gif"],
  };

  const typeKey = uploadType as keyof typeof sizeLimits;

  // Check file size
  if (file.size > sizeLimits[typeKey]) {
    const maxSizeMB = (sizeLimits[typeKey] / 1024 / 1024).toFixed(0);
    return `File too large. Maximum size for ${uploadType} images is ${maxSizeMB}MB`;
  }

  // Check file format
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !allowedFormats[typeKey].includes(fileExtension)) {
    return `Invalid file format. Allowed formats for ${uploadType}: ${allowedFormats[typeKey].join(", ")}`;
  }

  return null; // Valid file
}

/**
 * Helper function for common upload scenarios
 */
export const uploadHelpers = {
  /**
   * Upload profile image
   */
  profile: (file: File, callbacks?: Partial<SignedUploadOptions>) =>
    uploadWithSignature(file, { uploadType: "profile", ...callbacks }),

  /**
   * Upload hero image
   */
  hero: (file: File, callbacks?: Partial<SignedUploadOptions>) =>
    uploadWithSignature(file, { uploadType: "hero", ...callbacks }),

  /**
   * Upload story image
   */
  story: (file: File, callbacks?: Partial<SignedUploadOptions>) =>
    uploadWithSignature(file, { uploadType: "story", ...callbacks }),

  /**
   * Upload logo image
   */
  logo: (file: File, callbacks?: Partial<SignedUploadOptions>) =>
    uploadWithSignature(file, { uploadType: "logo", ...callbacks }),

  /**
   * Upload general image
   */
  general: (file: File, callbacks?: Partial<SignedUploadOptions>) =>
    uploadWithSignature(file, { uploadType: "general", ...callbacks }),
};
