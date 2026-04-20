"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, X, Video, ImageIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { trackUploadStart, trackUploadComplete } from "@/lib/upload-monitor";
import {
  useUploadProgress,
  UploadProgress,
} from "@/components/ui/UploadProgress";
import {
  uploadToCloudinaryWithProgress,
  uploadToApiWithProgress,
} from "@/lib/upload-with-progress";
import { useCSRFToken } from "@/hooks/useCSRFToken";

// Image compression utility (quality-preserving approach)
const compressImage = (
  file: File,
  maxSizeBytes: number,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");

    img.onload = () => {
      // Calculate compression requirements
      const fileSizeMB = file.size / (1024 * 1024);
      const targetSizeMB = maxSizeBytes / (1024 * 1024);
      const compressionRatio = targetSizeMB / fileSizeMB;

      console.log(`Image compression analysis:
        Original size: ${fileSizeMB.toFixed(1)}MB
        Target size: ${targetSizeMB.toFixed(1)}MB
        Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);

      // If we need to compress more than 50%, quality will be significantly impacted
      if (compressionRatio < 0.5) {
        reject(new Error("QUALITY_IMPACT_TOO_HIGH"));
        return;
      }

      // Calculate new dimensions (maintain aspect ratio)
      let { width, height } = img;
      const originalDimensions = `${width}x${height}`;

      // Only reduce dimensions if compression ratio is aggressive AND image is very large
      if (compressionRatio < 0.7 && (width > 3000 || height > 3000)) {
        // Conservative dimension reduction - only reduce to reasonable web sizes
        const maxDimension = width > 4000 || height > 4000 ? 3000 : 2500;

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
          console.log(
            `Reducing dimensions: ${originalDimensions} → ${width}x${height}`
          );
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }

          const compressedSizeMB = blob.size / (1024 * 1024);
          console.log(
            `Compression attempt: ${fileSizeMB.toFixed(1)}MB → ${compressedSizeMB.toFixed(1)}MB at ${(quality * 100).toFixed(0)}% quality`
          );

          // If still too large, try reducing quality but with quality limits
          if (blob.size > maxSizeBytes) {
            if (quality > 0.7) {
              // Reduce quality conservatively
              const newQuality = Math.max(0.7, quality - 0.15);
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified,
              });
              compressImage(compressedFile, maxSizeBytes, newQuality)
                .then(resolve)
                .catch(reject);
            } else {
              // Quality would be too low - reject for external tools
              reject(new Error("QUALITY_TOO_LOW_FOR_TARGET"));
            }
          } else {
            // Successful compression with good quality
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            resolve(compressedFile);
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Video compression utility (quality-preserving approach)
const compressVideo = (file: File, maxSizeBytes: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const originalBitrate = (file.size * 8) / duration;

      // Calculate how much we need to compress
      const targetFileSize = maxSizeBytes * 0.9; // 90% of limit for safety
      const targetBitrate = (targetFileSize * 8) / duration;
      const compressionRatio = targetBitrate / originalBitrate;

      console.log(`Video compression analysis:
        Duration: ${duration.toFixed(1)}s
        Original bitrate: ${(originalBitrate / 1000000).toFixed(1)} Mbps
        Target bitrate: ${(targetBitrate / 1000000).toFixed(1)} Mbps
        Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);

      // If we need to compress more than 60%, it might be too aggressive
      if (compressionRatio < 0.4) {
        reject(
          new Error(
            "Compression would severely impact quality. Please use external tools."
          )
        );
        return;
      }

      // Preserve original dimensions unless they're excessive
      let width = video.videoWidth;
      let height = video.videoHeight;

      // Only scale down if dimensions are very large AND we need heavy compression
      if (compressionRatio < 0.7 && (width > 1920 || height > 1080)) {
        const scale = Math.min(1920 / width, 1080 / height, 0.85);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
        console.log(
          `Scaling video: ${video.videoWidth}x${video.videoHeight} → ${width}x${height}`
        );
      }

      canvas.width = width;
      canvas.height = height;

      // Use best available codec
      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        reject(new Error("Video compression not supported in this browser"));
        return;
      }

      const canvasStream = canvas.captureStream(30); // Keep original frame rate feeling

      // Use calculated target bitrate with reasonable bounds
      const finalBitrate = Math.max(
        Math.min(targetBitrate, 5000000), // Max 5 Mbps
        500000 // Min 0.5 Mbps for watchable quality
      );

      console.log(
        `Using final bitrate: ${(finalBitrate / 1000000).toFixed(1)} Mbps`
      );

      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: finalBitrate,
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: mimeType });

        // Check if compression was successful
        if (compressedBlob.size > maxSizeBytes) {
          const sizeMB = (compressedBlob.size / 1024 / 1024).toFixed(1);
          reject(
            new Error(
              `Compression only reduced to ${sizeMB}MB. Try external tools for better compression.`
            )
          );
          return;
        }

        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, ".webm"),
          {
            type: mimeType,
            lastModified: file.lastModified,
          }
        );

        resolve(compressedFile);
      };

      // Start recording
      mediaRecorder.start(200); // Record in 200ms chunks for smoother processing

      // Play through video at normal speed
      video.currentTime = 0;
      video.play();

      const drawFrame = () => {
        if (video.ended) {
          mediaRecorder.stop();
          URL.revokeObjectURL(video.src);
          return;
        }

        if (!video.paused && !video.ended) {
          ctx?.drawImage(video, 0, 0, width, height);
        }

        requestAnimationFrame(drawFrame);
      };

      video.onplay = () => {
        drawFrame();
      };

      video.onended = () => {
        setTimeout(() => mediaRecorder.stop(), 500); // Small delay to ensure last frames
      };
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = URL.createObjectURL(file);
  });
};

type Category = "before" | "during" | "after";
type MediaType = "PHOTO" | "VIDEO";

interface MediaItem {
  id: string;
  url: string;
  category: Category;
  type: MediaType;
  createdAt: Date;
}

const categories: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Before Wedding", value: "before" },
  { label: "During Wedding", value: "during" },
  { label: "After Wedding", value: "after" },
];

const Gallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | Category>("all");
  const [selectedType, setSelectedType] = useState<"all" | MediaType>("all");
  const [category, setCategory] = useState<Category>("before");
  const [loading, setLoading] = useState(false);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [uploadType, setUploadType] = useState<MediaType>("PHOTO");
  const [uploadCount, setUploadCount] = useState({ photos: 0, videos: 0 });
  const [maxLimits, setMaxLimits] = useState({ photos: 0, videos: 0 });
  const { isDarkMode } = useTheme();
  const { data: session } = useSession();
  const { token: csrfToken } = useCSRFToken();

  // Upload progress tracking
  const {
    uploads,
    addUpload,
    updateProgress,
    setUploadSuccess,
    setUploadError,
    removeUpload,
  } = useUploadProgress();

  // Fetch user's media and plan limits
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, limitsRes] = await Promise.all([
          fetch("/api/gallery"),
          fetch("/api/user/limits"),
        ]);

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setMedia(mediaData);
        }

        if (limitsRes.ok) {
          const limitsData = await limitsRes.json();
          setUploadCount(limitsData.currentCount);
          setMaxLimits(limitsData.maxLimits);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = formData.getAll("media") as File[];

    if (!files.length) return;

    // Smart file size validation and compression
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB Cloudinary free plan limit
    const maxUploadAttempt = 50 * 1024 * 1024; // 50MB - beyond this, don't even try

    // Check for extremely large files
    for (const file of files) {
      if (file.size > maxUploadAttempt) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        toast.error(
          `File "${file.name}" is too large (${fileSizeMB}MB). Maximum supported size is 50MB.`
        );
        return;
      }
    }

    // Process files - compress images if needed
    const processedFiles = [];
    for (const file of files) {
      if (file.size > maxSizeBytes && file.type.startsWith("image/")) {
        try {
          const loadingToast = toast.loading(
            `Compressing "${file.name}" to optimize for upload...`
          );
          const compressedFile = await compressImage(file, maxSizeBytes);
          const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(
            1
          );

          // Check if compression was successful enough
          if (compressedFile.size > maxSizeBytes) {
            toast.dismiss(loadingToast);
            toast.error(
              `⚠️ Could only compress "${file.name}" from ${originalSizeMB}MB to ${compressedSizeMB}MB.\n\n` +
                `Still exceeds 10MB limit. Try:\n` +
                `• Online: TinyPNG, Compressor.io\n` +
                `• Desktop: Photoshop, GIMP\n` +
                `• Export as JPEG at lower quality`,
              {
                duration: 8000,
                style: {
                  maxWidth: "500px",
                  whiteSpace: "pre-line",
                },
              }
            );
            return;
          }

          console.log(
            `Compressed ${file.name}: ${originalSizeMB}MB → ${compressedSizeMB}MB (quality preserved)`
          );
          toast.dismiss(loadingToast);
          toast.success(
            `✅ Compressed "${file.name}": ${originalSizeMB}MB → ${compressedSizeMB}MB (quality preserved)`
          );
          processedFiles.push(compressedFile);
        } catch (compressionError: unknown) {
          console.error("Compression failed:", compressionError);
          const error = compressionError as Error;

          if (error.message === "QUALITY_IMPACT_TOO_HIGH") {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
            toast.error(
              `⚠️ "${file.name}" (${fileSizeMB}MB) is too large to compress without significant quality loss.\n\n` +
                `For best results, please use professional tools:\n` +
                `• Online: TinyPNG, Squoosh.app, Compressor.io\n` +
                `• Desktop: Photoshop, GIMP, Preview (Mac)\n` +
                `• Mobile: Photo editing apps\n\n` +
                `Target: Under 10MB with good quality`,
              {
                duration: 10000,
                style: {
                  maxWidth: "450px",
                  whiteSpace: "pre-line",
                },
              }
            );
          } else if (error.message === "QUALITY_TOO_LOW_FOR_TARGET") {
            toast.error(
              `Unable to compress "${file.name}" while maintaining good quality.\n\n` +
                `Please resize using photo editing software to under 10MB.`,
              {
                duration: 6000,
                style: {
                  maxWidth: "400px",
                  whiteSpace: "pre-line",
                },
              }
            );
          } else {
            toast.error(
              `Failed to compress "${file.name}". Please try a smaller file or use external compression tools.`
            );
          }
          return;
        }
      } else if (file.size > maxSizeBytes && file.type.startsWith("video/")) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);

        if (file.size > 25 * 1024 * 1024) {
          // 25MB+
          toast.error(
            `Video "${file.name}" is too large (${fileSizeMB}MB). ` +
              `Please use video editing software to compress it to under 10MB first.`,
            { duration: 6000 }
          );
          return;
        }

        // Try to compress videos between 10-25MB with quality-preserving approach
        try {
          const loadingToast = toast.loading(
            `Analyzing and compressing "${file.name}"... This may take 1-2 minutes.`
          );

          const compressedFile = await compressVideo(file, maxSizeBytes);
          const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(
            1
          );

          console.log(
            `Compressed video ${file.name}: ${originalSizeMB}MB → ${compressedSizeMB}MB`
          );
          toast.dismiss(loadingToast);
          toast.success(
            `✅ Compressed "${file.name}": ${originalSizeMB}MB → ${compressedSizeMB}MB\n` +
              `Quality preserved as much as possible!`,
            { duration: 5000, style: { whiteSpace: "pre-line" } }
          );
          processedFiles.push(compressedFile);
        } catch (compressionError: unknown) {
          console.error("Video compression failed:", compressionError);
          const error = compressionError as Error;

          const errorMessage = error.message;

          if (errorMessage.includes("severely impact quality")) {
            toast.error(
              `❌ "${file.name}" (${fileSizeMB}MB) would lose too much quality if compressed.\n\n` +
                `📋 For best quality, use these tools:\n` +
                `• HandBrake (free, excellent quality)\n` +
                `• Adobe Media Encoder\n` +
                `• Online: CloudConvert, Clideo\n\n` +
                `💡 Tip: Export as H.264 MP4 at 2-4 Mbps`,
              {
                duration: 12000,
                style: {
                  maxWidth: "600px",
                  whiteSpace: "pre-line",
                },
              }
            );
          } else if (errorMessage.includes("only reduced to")) {
            toast.error(
              `⚠️ "${file.name}" compression wasn't sufficient.\n\n` +
                errorMessage +
                `\n\n` +
                `Try reducing video resolution or bitrate in video editing software.`,
              {
                duration: 8000,
                style: { whiteSpace: "pre-line" },
              }
            );
          } else {
            // Generic compression failure
            toast.error(
              `❌ Could not compress "${file.name}" (${fileSizeMB}MB).\n\n` +
                `📋 Try these free tools:\n` +
                `• Online: CloudConvert, Clideo\n` +
                `• Desktop: HandBrake\n` +
                `• Mobile: Video Compressor apps`,
              {
                duration: 8000,
                style: {
                  maxWidth: "500px",
                  whiteSpace: "pre-line",
                },
              }
            );
          }
          return;
        }
      } else {
        // File is already under the limit
        processedFiles.push(file);
      }
    }

    // Use processed files for upload
    const filesToUpload = processedFiles;

    setLoading(true);

    try {
      // Check if required environment variables are available
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      console.log("Environment check:", {
        hasCloudName: !!cloudName,
        hasUploadPreset: !!uploadPreset,
        cloudName: cloudName ? cloudName.substring(0, 10) + "..." : "missing",
      });

      if (!cloudName || !uploadPreset) {
        console.warn(
          "Missing Cloudinary environment variables, falling back to original upload method"
        );

        // Fallback to original upload method with progress tracking
        // Since gallery-upload expects multiple files in one FormData, we'll track overall progress
        const uploadData = new FormData();
        filesToUpload.forEach((file) => {
          uploadData.append("media", file);
          // Add individual files to progress tracker
          addUpload(file.name, file.size);
        });
        uploadData.append("category", category);
        uploadData.append("type", uploadType);

        try {
          // Use our progress-tracked upload for the batch
          const response = await uploadToApiWithProgress(
            "/api/gallery-upload",
            uploadData,
            {
              uploadType: "gallery-batch",
              onProgress: (loaded, total, percentage, speed) => {
                // Distribute progress across all files equally
                const progressPerFile = percentage / filesToUpload.length;
                filesToUpload.forEach((file) => {
                  updateProgress(
                    file.name,
                    (file.size * progressPerFile) / 100,
                    speed
                  );
                });
              },
              onSuccess: (result) => {
                console.log("Fallback batch upload successful:", result);
                // Mark all files as successful
                filesToUpload.forEach((file) => {
                  setUploadSuccess(file.name);

                  // Track analytics for each file
                  const trackingData = trackUploadStart(
                    "gallery-fallback",
                    file.name,
                    file.size,
                    session?.user?.id || ""
                  );
                  trackUploadComplete(
                    trackingData,
                    true,
                    "batch-upload-success"
                  );
                });
              },
              onError: (error) => {
                console.error("Fallback batch upload failed:", error);
                // Mark all files as failed
                filesToUpload.forEach((file) => {
                  setUploadError(file.name, error);

                  // Track analytics for each file
                  const trackingData = trackUploadStart(
                    "gallery-fallback",
                    file.name,
                    file.size,
                    session?.user?.id || ""
                  );
                  trackUploadComplete(
                    trackingData,
                    false,
                    undefined,
                    undefined,
                    error
                  );
                });
              },
            }
          );

          if (response) {
            const newMedia = Array.isArray(response) ? response : [response];
            setMedia((prev) => [...newMedia, ...prev]);

            // Show success toast for fallback method
            const fileCount = filesToUpload.length;
            const mediaTypeText = uploadType === "PHOTO" ? "Image" : "Video";
            const successMessage =
              fileCount === 1
                ? `${mediaTypeText} upload successful!`
                : `${fileCount} ${mediaTypeText.toLowerCase()}s uploaded successfully!`;

            toast.success(successMessage);

            // Update counts
            if (uploadType === "PHOTO") {
              setUploadCount((prev) => ({
                ...prev,
                photos: prev.photos + filesToUpload.length,
              }));
            } else {
              setUploadCount((prev) => ({
                ...prev,
                videos: prev.videos + filesToUpload.length,
              }));
            }
          }
        } catch (error) {
          console.error("Fallback upload failed:", error);
          toast.error("Upload failed. Please try again.");
        }
        return;
      }

      // Upload files directly to Cloudinary with progress tracking
      const uploadedFiles = [];

      for (const file of filesToUpload) {
        try {
          console.log(`Starting upload for: ${file.name} (${file.size} bytes)`);

          // Add file to progress tracker
          addUpload(file.name, file.size);

          // Set resource type based on upload type
          const resourceType = uploadType === "VIDEO" ? "video" : "image";

          // Upload with progress tracking
          const cloudinaryResult = await uploadToCloudinaryWithProgress(
            file,
            uploadPreset,
            {
              cloudName,
              folder: "wedding-gallery",
              resourceType: resourceType === "video" ? "video" : "auto",
              onProgress: (loaded, total, percentage, speed) => {
                updateProgress(file.name, loaded, speed);
              },
              onSuccess: (result) => {
                console.log(`Upload successful for ${file.name}:`, result);
                setUploadSuccess(file.name);

                // Track analytics
                const trackingData = trackUploadStart(
                  "gallery",
                  file.name,
                  file.size,
                  session?.user?.id || ""
                );
                const uploadResult = result as { secure_url: string };
                trackUploadComplete(
                  trackingData,
                  true,
                  uploadResult.secure_url
                );
              },
              onError: (error) => {
                console.error(`Failed to upload ${file.name}:`, error);
                setUploadError(file.name, error);

                // Track analytics
                const trackingData = trackUploadStart(
                  "gallery",
                  file.name,
                  file.size,
                  session?.user?.id || ""
                );
                trackUploadComplete(
                  trackingData,
                  false,
                  undefined,
                  undefined,
                  error
                );
              },
            }
          );

          uploadedFiles.push({
            secure_url: (
              cloudinaryResult as { secure_url: string; public_id: string }
            ).secure_url,
            public_id: (
              cloudinaryResult as { secure_url: string; public_id: string }
            ).public_id,
          });
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          setUploadError(
            file.name,
            fileError instanceof Error ? fileError.message : String(fileError)
          );
          throw fileError; // Re-throw to be caught by outer try-catch
        }
      }

      // Save metadata to our database
      const metadataResponse = await fetch("/api/gallery/save-metadata", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          files: uploadedFiles,
          category,
          type: uploadType,
        }),
      });

      if (metadataResponse.ok) {
        const newMedia = await metadataResponse.json();
        setMedia((prev) => [...newMedia, ...prev]);

        // Show success toast
        const fileCount = filesToUpload.length;
        const mediaTypeText = uploadType === "PHOTO" ? "Image" : "Video";
        const successMessage =
          fileCount === 1
            ? `${mediaTypeText} upload successful!`
            : `${fileCount} ${mediaTypeText.toLowerCase()}s uploaded successfully!`;

        toast.success(successMessage);

        // Update counts
        if (uploadType === "PHOTO") {
          setUploadCount((prev) => ({
            ...prev,
            photos: prev.photos + filesToUpload.length,
          }));
        } else {
          setUploadCount((prev) => ({
            ...prev,
            videos: prev.videos + filesToUpload.length,
          }));
        }
      } else {
        console.error("Failed to save metadata");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      // Show user-friendly error message
      alert(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
      // Safely reset the form if it exists
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
    }
  };

  const handleDelete = async (id: string, type: MediaType) => {
    try {
      console.log(`Attempting to delete media with ID: ${id}`);

      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      console.log(`Delete response status: ${response.status}`);

      if (response.ok) {
        setMedia((prev) => prev.filter((item) => item.id !== id));

        // Show success toast for deletion
        const mediaTypeText = type === "PHOTO" ? "Image" : "Video";
        toast.success(`${mediaTypeText} deleted successfully!`);

        // Update counts
        if (type === "PHOTO") {
          setUploadCount((prev) => ({ ...prev, photos: prev.photos - 1 }));
        } else {
          setUploadCount((prev) => ({ ...prev, videos: prev.videos - 1 }));
        }
      } else {
        // Get the error details
        const errorData = await response.text();
        console.error(
          `Delete failed with status ${response.status}:`,
          errorData
        );

        try {
          const errorJson = JSON.parse(errorData);
          toast.error(
            `Failed to delete media: ${errorJson.error || "Unknown error"}`
          );
        } catch {
          toast.error(`Failed to delete media: HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(
        `Error deleting media: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const filteredMedia = media.filter((item) => {
    const categoryMatch =
      selectedTab === "all" || item.category === selectedTab;
    const typeMatch = selectedType === "all" || item.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const canUploadPhotos = uploadCount.photos < maxLimits.photos;
  const canUploadVideos = uploadCount.videos < maxLimits.videos;

  return (
    <div className="space-y-8">
      <div>
        <h1
          className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Wedding Gallery
        </h1>
        <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Browse and upload your wedding photos and videos by category.
        </p>
        {/* Upload limits info */}
        <div
          className={`mt-4 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
        >
          <p>
            Photos: {uploadCount.photos} / {maxLimits.photos}
          </p>
          <p>
            Videos: {uploadCount.videos} / {maxLimits.videos}
          </p>

          {/* Specific limit messages */}
          {!canUploadPhotos && canUploadVideos && (
            <p className="text-amber-600 mt-2">
              Photo limit exceeded. Delete some photos to upload more.
            </p>
          )}
          {canUploadPhotos && !canUploadVideos && (
            <p className="text-amber-600 mt-2">
              Video limit exceeded. Delete some videos to upload more.
            </p>
          )}
          {!canUploadPhotos && !canUploadVideos && (
            <p className="text-amber-600 mt-2">
              Photo and Video limit exceeded. Delete some media to upload more.
            </p>
          )}
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
              ${
                selectedType === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                  : `${
                      isDarkMode
                        ? "text-slate-300 border-slate-600"
                        : "text-black border-slate-300"
                    } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
              }`}
        >
          All Media
        </button>
        <button
          onClick={() => setSelectedType("PHOTO")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
              ${
                selectedType === "PHOTO"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                  : `${
                      isDarkMode
                        ? "text-slate-300 border-slate-600"
                        : "text-black border-slate-300"
                    } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
              }`}
        >
          Photos
        </button>
        <button
          onClick={() => setSelectedType("VIDEO")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
              ${
                selectedType === "VIDEO"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                  : `${
                      isDarkMode
                        ? "text-slate-300 border-slate-600"
                        : "text-black border-slate-300"
                    } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
              }`}
        >
          Videos
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedTab(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
                ${
                  selectedTab === cat.value
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                    : `${
                        isDarkMode
                          ? "text-slate-300 border-slate-600"
                          : "text-black border-slate-300"
                      } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
                }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className={`flex flex-col sm:flex-row gap-4 items-center rounded-2xl p-6 ${isDarkMode ? "text-white bg-slate-800 " : "bg-white text-slate-900"}`}
      >
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUploadType("PHOTO")}
              className={`px-4 py-2 rounded-xl border transition-all ${
                uploadType === "PHOTO"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : isDarkMode
                    ? "border-slate-600"
                    : "border-slate-300"
              }`}
              disabled={!canUploadPhotos}
            >
              <ImageIcon className="h-4 w-4 inline mr-2" />
              Photos
            </button>
            <button
              type="button"
              onClick={() => setUploadType("VIDEO")}
              className={`px-4 py-2 rounded-xl border transition-all ${
                uploadType === "VIDEO"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : isDarkMode
                    ? "border-slate-600"
                    : "border-slate-300"
              }`}
              disabled={!canUploadVideos}
            >
              <Video className="h-4 w-4 inline mr-2" />
              Videos
            </button>
          </div>

          <input
            type="file"
            name="media"
            accept={uploadType === "PHOTO" ? "image/*" : "video/*"}
            multiple
            required
            disabled={
              (uploadType === "PHOTO" && !canUploadPhotos) ||
              (uploadType === "VIDEO" && !canUploadVideos)
            }
            className="w-full text-sm file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded-full file:border-none file:cursor-pointer disabled:opacity-50"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="px-4 py-2 rounded-xl border border-slate-300"
        >
          <option value="before">Before Wedding</option>
          <option value="during">During Wedding</option>
          <option value="after">After Wedding</option>
        </select>

        <button
          type="submit"
          disabled={
            loading ||
            (uploadType === "PHOTO" && !canUploadPhotos) ||
            (uploadType === "VIDEO" && !canUploadVideos)
          }
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-50 hover:cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </button>
      </form>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMedia.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative group overflow-hidden rounded-2xl shadow-lg"
          >
            <div className="relative aspect-[3/2] w-full">
              {item.type === "PHOTO" ? (
                <Image
                  src={item.url}
                  alt={`Photo ${item.id}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-2xl cursor-pointer"
                  onClick={() => setModalItem(item)}
                  unoptimized={true}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-black cursor-pointer"
                  onClick={() => setModalItem(item)}
                >
                  <video className="w-full h-full object-cover">
                    <source src={item.url} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full capitalize">
                {item.category}
              </div>

              <button
                onClick={() => handleDelete(item.id, item.type)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {item.type}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalItem && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalItem(null)}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] p-4 md:p-8 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-white text-center mt-4 capitalize">
                {modalItem.category} - {modalItem.type}
              </div>

              {modalItem.type === "PHOTO" ? (
                <Image
                  src={modalItem.url}
                  alt={modalItem.category}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
                  priority
                  unoptimized={true}
                />
              ) : (
                <video
                  controls
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
                >
                  <source src={modalItem.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <button
                onClick={() => setModalItem(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Indicator */}
      <UploadProgress
        uploads={uploads}
        onDismiss={removeUpload}
        onCancel={(fileName) => {
          // Note: Cancellation would require storing XHR references
          // For now, just remove from progress tracker
          removeUpload(fileName);
          toast.error(`Upload of "${fileName}" cancelled`);
        }}
        onRetry={(fileName) => {
          // Remove from progress and let user retry manually
          removeUpload(fileName);
          toast(`Please try uploading "${fileName}" again`);
        }}
      />
    </div>
  );
};

export default Gallery;
