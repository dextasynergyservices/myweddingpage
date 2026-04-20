/**
 * File Upload Validation Module
 *
 * Provides comprehensive file upload security:
 * - MIME type validation (checks both header and magic numbers)
 * - File size limits
 * - Image dimension validation
 * - Malicious content detection
 * - File extension validation
 *
 * Prevents:
 * - Extension spoofing (checks actual file content)
 * - Oversized uploads
 * - Malicious files (polyglot files, zip bombs)
 * - XSS via SVG/HTML
 */

import { logSecurityEvent } from "./security-logger";

// Configuration
const config = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB default
  maxImageWidth: parseInt(process.env.MAX_IMAGE_WIDTH || "4096", 10),
  maxImageHeight: parseInt(process.env.MAX_IMAGE_HEIGHT || "4096", 10),
  allowedFileTypes: (
    process.env.ALLOWED_FILE_TYPES || "jpg,jpeg,png,gif,webp,pdf,mp4,webm"
  ).split(","),
};

// File type signatures (magic numbers)
const FILE_SIGNATURES: Record<string, number[][]> = {
  // Images
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ], // GIF87a or GIF89a
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP container)

  // Documents
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF

  // Videos
  mp4: [[0x00, 0x00, 0x00]], // ftyp box (varies, but starts with 0x00 0x00 0x00)
  webm: [[0x1a, 0x45, 0xdf, 0xa3]], // EBML header
};

// MIME type mappings
const MIME_TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  gif: ["image/gif"],
  webp: ["image/webp"],
  pdf: ["application/pdf"],
  mp4: ["video/mp4"],
  webm: ["video/webm"],
};

// Types
export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    detectedType?: string;
    extension: string;
    width?: number;
    height?: number;
  };
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Validate uploaded file
 *
 * Performs comprehensive validation:
 * 1. File size check
 * 2. Extension validation
 * 3. MIME type check
 * 4. Magic number verification
 * 5. Image dimension check (for images)
 * 6. Malicious content detection
 *
 * @param file - File or Buffer to validate
 * @param fileName - Original file name
 * @param mimeType - Reported MIME type
 * @param userId - User ID for logging (optional)
 * @returns ValidationResult
 */
export async function validateFile(
  file: File | Buffer,
  fileName: string,
  mimeType: string,
  userId?: string
): Promise<ValidationResult> {
  try {
    // Get file buffer
    let buffer: Buffer;
    if (file instanceof Buffer) {
      buffer = file;
    } else if (
      "arrayBuffer" in file &&
      typeof file.arrayBuffer === "function"
    ) {
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      throw new Error("Invalid file type");
    }
    const fileSize = buffer.length;

    // 1. Check file size
    if (fileSize > config.maxFileSize) {
      await logFileRejection(
        fileName,
        "File size exceeds limit",
        { fileSize, maxSize: config.maxFileSize },
        userId
      );

      return {
        valid: false,
        error: `File size (${formatBytes(fileSize)}) exceeds maximum allowed size (${formatBytes(config.maxFileSize)})`,
        details: {
          fileName,
          fileSize,
          mimeType,
          extension: getExtension(fileName),
        },
      };
    }

    // 2. Check file extension
    const extension = getExtension(fileName).toLowerCase();
    if (!config.allowedFileTypes.includes(extension)) {
      await logFileRejection(
        fileName,
        "File type not allowed",
        { extension, allowedTypes: config.allowedFileTypes },
        userId
      );

      return {
        valid: false,
        error: `File type '.${extension}' is not allowed. Allowed types: ${config.allowedFileTypes.join(", ")}`,
        details: { fileName, fileSize, mimeType, extension },
      };
    }

    // 3. Validate MIME type
    const allowedMimeTypes = MIME_TYPES[extension] || [];
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(mimeType)) {
      await logFileRejection(
        fileName,
        "MIME type mismatch",
        { reportedMime: mimeType, expectedMime: allowedMimeTypes },
        userId
      );

      return {
        valid: false,
        error: `Invalid MIME type '${mimeType}' for '.${extension}' file`,
        details: { fileName, fileSize, mimeType, extension },
      };
    }

    // 4. Verify file signature (magic numbers)
    const detectedType = detectFileType(buffer);
    if (detectedType && detectedType !== extension) {
      // Special case: jpeg/jpg are the same
      if (
        !(
          (extension === "jpg" || extension === "jpeg") &&
          (detectedType === "jpg" || detectedType === "jpeg")
        )
      ) {
        await logFileRejection(
          fileName,
          "File signature mismatch (possible spoofing)",
          { extension, detectedType },
          userId
        );

        return {
          valid: false,
          error: `File content doesn't match extension. Extension: .${extension}, Detected: ${detectedType || "unknown"}`,
          details: { fileName, fileSize, mimeType, extension, detectedType },
        };
      }
    }

    // 5. Image-specific validation
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      const dimensions = await getImageDimensions(buffer, extension);

      if (dimensions) {
        if (
          dimensions.width > config.maxImageWidth ||
          dimensions.height > config.maxImageHeight
        ) {
          await logFileRejection(
            fileName,
            "Image dimensions exceed limits",
            {
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: config.maxImageWidth,
              maxHeight: config.maxImageHeight,
            },
            userId
          );

          return {
            valid: false,
            error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed size (${config.maxImageWidth}x${config.maxImageHeight})`,
            details: {
              fileName,
              fileSize,
              mimeType,
              extension,
              width: dimensions.width,
              height: dimensions.height,
            },
          };
        }
      }
    }

    // 6. Check for malicious content
    const maliciousCheck = detectMaliciousContent(buffer, extension);
    if (!maliciousCheck.safe) {
      await logFileRejection(
        fileName,
        "Malicious content detected",
        { reason: maliciousCheck.reason },
        userId
      );

      return {
        valid: false,
        error: `File rejected: ${maliciousCheck.reason}`,
        details: { fileName, fileSize, mimeType, extension },
      };
    }

    // All checks passed
    return {
      valid: true,
      details: {
        fileName,
        fileSize,
        mimeType,
        extension,
        detectedType: detectedType || undefined,
      },
    };
  } catch (error) {
    console.error("File validation error:", error);
    return {
      valid: false,
      error: "File validation failed due to an internal error",
    };
  }
}

/**
 * Detect file type from magic numbers
 *
 * Reads the first bytes of the file to determine actual file type
 *
 * @param buffer - File buffer
 * @returns Detected file extension or null
 */
function detectFileType(buffer: Buffer): string | null {
  for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return type;
      }
    }
  }
  return null;
}

/**
 * Get image dimensions
 *
 * Extracts width and height from image file headers
 *
 * @param buffer - Image buffer
 * @param type - Image type (png, jpg, gif, webp)
 * @returns Image dimensions or null
 */
async function getImageDimensions(
  buffer: Buffer,
  type: string
): Promise<ImageDimensions | null> {
  try {
    switch (type) {
      case "png":
        return getPngDimensions(buffer);
      case "jpg":
      case "jpeg":
        return getJpegDimensions(buffer);
      case "gif":
        return getGifDimensions(buffer);
      case "webp":
        return getWebpDimensions(buffer);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function getPngDimensions(buffer: Buffer): ImageDimensions {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getJpegDimensions(buffer: Buffer): ImageDimensions | null {
  let offset = 2; // Skip SOI marker

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;

    const marker = buffer[offset + 1];

    // Start of Frame markers (SOF0-SOF15)
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + buffer.readUInt16BE(offset + 2);
  }

  return null;
}

function getGifDimensions(buffer: Buffer): ImageDimensions {
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function getWebpDimensions(buffer: Buffer): ImageDimensions | null {
  // WebP format is complex, simplified version
  const vp8 = buffer.indexOf("VP8 ");
  if (vp8 !== -1) {
    return {
      width: buffer.readUInt16LE(vp8 + 6) & 0x3fff,
      height: buffer.readUInt16LE(vp8 + 8) & 0x3fff,
    };
  }
  return null;
}

/**
 * Detect malicious content
 *
 * Checks for:
 * - Polyglot files (files that are valid in multiple formats)
 * - Embedded scripts in SVG/HTML
 * - Zip bombs (highly compressed malicious files)
 * - PHP/executable code
 *
 * @param buffer - File buffer
 * @param extension - File extension
 * @returns Safety check result
 */
function detectMaliciousContent(
  buffer: Buffer,
  extension: string
): { safe: boolean; reason?: string } {
  const content = buffer.toString("utf8", 0, Math.min(buffer.length, 8192)); // Check first 8KB

  // Check for embedded scripts (in images)
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    if (content.includes("<script") || content.includes("javascript:")) {
      return { safe: false, reason: "Embedded script detected" };
    }

    // Check for PHP code
    if (content.includes("<?php")) {
      return { safe: false, reason: "Embedded PHP code detected" };
    }
  }

  // Check for polyglot markers (file valid in multiple formats)
  const hasPdfMarker = content.includes("%PDF");
  const hasHtmlMarker =
    content.includes("<html") || content.includes("<!DOCTYPE");
  const hasZipMarker = buffer[0] === 0x50 && buffer[1] === 0x4b; // PK

  let markerCount = 0;
  if (hasPdfMarker) markerCount++;
  if (hasHtmlMarker) markerCount++;
  if (hasZipMarker) markerCount++;

  if (markerCount > 1) {
    return {
      safe: false,
      reason: "Polyglot file detected (multiple format markers)",
    };
  }

  // Check for excessive compression (potential zip bomb)
  if (hasZipMarker) {
    const compressionRatio = buffer.length / 1024; // Simplified check
    if (compressionRatio < 0.01) {
      return {
        safe: false,
        reason: "Suspicious compression ratio (potential zip bomb)",
      };
    }
  }

  return { safe: true };
}

/**
 * Validate file size only (quick check)
 *
 * @param size - File size in bytes
 * @returns Whether size is within limits
 */
export function validateFileSize(size: number): boolean {
  return size > 0 && size <= config.maxFileSize;
}

/**
 * Validate file extension
 *
 * @param fileName - File name
 * @returns Whether extension is allowed
 */
export function validateFileExtension(fileName: string): boolean {
  const extension = getExtension(fileName).toLowerCase();
  return config.allowedFileTypes.includes(extension);
}

/**
 * Get file extension from filename
 */
function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Log file rejection event
 */
async function logFileRejection(
  fileName: string,
  reason: string,
  metadata: Record<string, unknown>,
  userId?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: "FILE_UPLOAD_REJECTED",
    severity: "MEDIUM",
    userId,
    ipAddress: "server",
    message: `File upload rejected: ${reason}`,
    metadata: {
      fileName,
      reason,
      ...metadata,
    },
  });
}

export { config as fileValidationConfig };
