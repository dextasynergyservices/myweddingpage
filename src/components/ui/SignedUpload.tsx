import React, { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, CheckCircle } from "lucide-react";
import { useSignedUpload } from "@/hooks/useSignedUpload";
import { SignedUploadResult } from "@/lib/signed-upload";

interface SignedUploadComponentProps {
  uploadType: "profile" | "hero" | "story" | "logo" | "general";
  onSuccess: (result: SignedUploadResult) => void;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  accept?: string;
  showPreview?: boolean;
  previewClassName?: string;
  // Enhanced progress tracking options
  useExternalProgress?: boolean; // If true, uses external UploadProgress component
  externalProgressHandler?: {
    addUpload: (fileName: string, total: number) => void;
    updateProgress: (fileName: string, loaded: number, speed?: number) => void;
    setUploadSuccess: (fileName: string) => void;
    setUploadError: (fileName: string, error: string) => void;
  };
}

export function SignedUploadComponent({
  uploadType,
  onSuccess,
  onError,
  currentImageUrl,
  className = "",
  children,
  disabled = false,
  accept = "image/*",
  showPreview = true,
  previewClassName = "",
  useExternalProgress = false,
}: SignedUploadComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploading, progress, upload, reset } = useSignedUpload({
    uploadType,
    onSuccess: (result) => {
      setPreviewUrl(result.secure_url);
      onSuccess(result);
    },
    onError: (errorMessage) => {
      if (onError) {
        onError(errorMessage);
      }
    },
    showToasts: !useExternalProgress, // Don't show toasts if using external progress (it should handle them)
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    if (showPreview) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }

    try {
      await upload(file);
    } catch {
      // Error handling is done in the hook
      if (showPreview) {
        setPreviewUrl(null);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {children ? (
        <div onClick={handleUploadClick} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <div
          onClick={handleUploadClick}
          className={`
            relative border-2 border-dashed border-gray-300 rounded-lg p-6
            hover:border-gray-400 cursor-pointer transition-colors
            ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
            ${previewClassName}
          `}
        >
          {displayImageUrl && showPreview ? (
            <div className="relative">
              <Image
                src={displayImageUrl}
                alt={`${uploadType} preview`}
                width={400}
                height={128}
                className="w-full h-32 object-cover rounded-lg"
              />

              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-sm">{progress}%</div>
                  </div>
                </div>
              )}

              {previewUrl && !uploading && (
                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle size={16} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {uploading
                  ? `Uploading... ${progress}%`
                  : `Upload ${uploadType} image`}
              </p>

              <p className="text-xs text-gray-400">
                {getUploadInfo(uploadType)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getUploadInfo(uploadType: string): string {
  const info = {
    profile: "Max 5MB • JPG, PNG, WebP",
    hero: "Max 10MB • JPG, PNG, WebP • 1200x800 recommended",
    story: "Max 8MB • JPG, PNG, WebP • 800x600 recommended",
    logo: "Max 2MB • JPG, PNG, WebP, SVG • 200x200 recommended",
    general: "Max 10MB • JPG, PNG, WebP, GIF",
  };

  return info[uploadType as keyof typeof info] || "Click to upload";
}

// Specialized components for common use cases
export const ProfileImageUpload = (
  props: Omit<SignedUploadComponentProps, "uploadType">
) => <SignedUploadComponent {...props} uploadType="profile" />;

export const HeroImageUpload = (
  props: Omit<SignedUploadComponentProps, "uploadType">
) => <SignedUploadComponent {...props} uploadType="hero" />;

export const StoryImageUpload = (
  props: Omit<SignedUploadComponentProps, "uploadType">
) => <SignedUploadComponent {...props} uploadType="story" />;

export const LogoImageUpload = (
  props: Omit<SignedUploadComponentProps, "uploadType">
) => <SignedUploadComponent {...props} uploadType="logo" />;

export const GeneralImageUpload = (
  props: Omit<SignedUploadComponentProps, "uploadType">
) => <SignedUploadComponent {...props} uploadType="general" />;
