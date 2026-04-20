"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface WeddingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingSlug: string;
  weddingTitle: string;
}

export default function WeddingPreviewModal({
  isOpen,
  onClose,
  weddingSlug,
  weddingTitle,
}: WeddingPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === "close-modal") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    window.addEventListener("message", handleMessage);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ⚪ NOT LIVE
              </span>
              <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {weddingTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/packages"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700 transition-colors"
            >
              Create Similar Page
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading wedding page preview...</p>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="h-full">
          <iframe
            src={`/preview/${weddingSlug}?modal=true`}
            className="w-full h-full border-0"
            title={`Preview of ${weddingTitle}`}
            onLoad={handleIframeLoad}
            style={{ height: "calc(100% - 73px)" }} // Subtract header height
          />
        </div>

        {/* Modal Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              This wedding page is no longer live and is shown for preview
              purposes only.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
