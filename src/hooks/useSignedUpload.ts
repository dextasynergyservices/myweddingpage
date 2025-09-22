import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  uploadWithSignature,
  validateUploadFile,
  SignedUploadOptions,
  SignedUploadResult,
} from "@/lib/signed-upload";

interface UseSignedUploadOptions {
  uploadType: "profile" | "hero" | "story" | "logo" | "general";
  onSuccess?: (result: SignedUploadResult) => void;
  onError?: (error: string) => void;
  showToasts?: boolean;
  onProgress?: (progress: number) => void;
  onProgressUpdate?: (update: {
    progress: number;
    bytesUploaded: number;
    totalBytes: number;
    speed?: number;
    estimatedTimeRemaining?: number;
  }) => void;
}

interface UseSignedUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  result: SignedUploadResult | null;
  upload: (file: File) => Promise<SignedUploadResult | null>;
  reset: () => void;
}

/**
 * React hook for handling signed Cloudinary uploads
 */
export function useSignedUpload(options: UseSignedUploadOptions): UseSignedUploadReturn {
  const {
    uploadType,
    onSuccess,
    onError,
    showToasts = true,
    onProgress,
    onProgressUpdate,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SignedUploadResult | null>(null);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<SignedUploadResult | null> => {
      // Reset state
      setError(null);
      setResult(null);
      setProgress(0);

      // Validate file
      const validationError = validateUploadFile(file, uploadType);
      if (validationError) {
        setError(validationError);
        if (showToasts) {
          toast.error(validationError);
        }
        if (onError) {
          onError(validationError);
        }
        return null;
      }

      setUploading(true);

      try {
        if (showToasts) {
          toast.loading(`Uploading ${uploadType} image...`, { id: "signed-upload" });
        }

        const uploadOptions: SignedUploadOptions = {
          uploadType,
          onProgress: (progressValue) => {
            setProgress(progressValue);
            // Call external progress handler if provided
            if (onProgress) {
              onProgress(progressValue);
            }
          },
          onProgressUpdate: (update) => {
            // Update internal progress
            setProgress(update.progress);
            // Call external detailed progress handler if provided
            if (onProgressUpdate) {
              onProgressUpdate(update);
            }
          },
          onSuccess: (uploadResult) => {
            setResult(uploadResult);
            if (showToasts) {
              toast.success(`${uploadType} image uploaded successfully!`, { id: "signed-upload" });
            }
            if (onSuccess) {
              onSuccess(uploadResult);
            }
          },
          onError: (errorMessage) => {
            setError(errorMessage);
            if (showToasts) {
              toast.error(`Upload failed: ${errorMessage}`, { id: "signed-upload" });
            }
            if (onError) {
              onError(errorMessage);
            }
          },
        };

        const uploadResult = await uploadWithSignature(file, uploadOptions);
        return uploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);

        if (showToasts) {
          toast.error(`Upload failed: ${errorMessage}`, { id: "signed-upload" });
        }

        if (onError) {
          onError(errorMessage);
        }

        return null;
      } finally {
        setUploading(false);
      }
    },
    [uploadType, onSuccess, onError, showToasts, onProgress, onProgressUpdate]
  );

  return {
    uploading,
    progress,
    error,
    result,
    upload,
    reset,
  };
}

/**
 * Specialized hooks for common upload types
 */
export const useProfileImageUpload = (callbacks?: Partial<UseSignedUploadOptions>) =>
  useSignedUpload({ uploadType: "profile", ...callbacks });

export const useHeroImageUpload = (callbacks?: Partial<UseSignedUploadOptions>) =>
  useSignedUpload({ uploadType: "hero", ...callbacks });

export const useStoryImageUpload = (callbacks?: Partial<UseSignedUploadOptions>) =>
  useSignedUpload({ uploadType: "story", ...callbacks });

export const useLogoImageUpload = (callbacks?: Partial<UseSignedUploadOptions>) =>
  useSignedUpload({ uploadType: "logo", ...callbacks });

export const useGeneralImageUpload = (callbacks?: Partial<UseSignedUploadOptions>) =>
  useSignedUpload({ uploadType: "general", ...callbacks });
