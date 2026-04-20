"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    id: string;
    url: string;
    type: "PHOTO" | "VIDEO";
    category: "before" | "during" | "after";
  } | null;
  mediaList: Array<{
    id: string;
    url: string;
    type: "PHOTO" | "VIDEO";
    category: "before" | "during" | "after";
  }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function MediaModal({
  isOpen,
  onClose,
  media,
  mediaList,
  currentIndex,
  onNavigate,
}: MediaModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Define togglePlayPause before using it in useEffect
  const togglePlayPause = useCallback(() => {
    if (!videoRef) return;

    if (isPlaying) {
      videoRef.pause();
      setIsPlaying(false);
    } else {
      videoRef.play();
      setIsPlaying(true);
    }
  }, [videoRef, isPlaying]);

  // Reset video state when media changes
  useEffect(() => {
    if (media?.type === "VIDEO" && videoRef) {
      setIsPlaying(false);
      videoRef.pause();
    }
  }, [media, videoRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case "ArrowRight":
          if (currentIndex < mediaList.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        case " ":
          if (media?.type === "VIDEO") {
            e.preventDefault();
            togglePlayPause();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    currentIndex,
    mediaList.length,
    media?.type,
    onClose,
    onNavigate,
    togglePlayPause,
  ]);

  const toggleMute = () => {
    if (!videoRef) return;

    videoRef.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    if (media?.type === "VIDEO") {
      togglePlayPause();
    }
  };

  if (!media) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </motion.button>

            {/* Navigation Arrows */}
            {mediaList.length > 1 && (
              <>
                {/* Previous Button */}
                {currentIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onNavigate(currentIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </motion.button>
                )}

                {/* Next Button */}
                {currentIndex < mediaList.length - 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onNavigate(currentIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                )}
              </>
            )}

            {/* Media Content */}
            <div className="relative w-full h-full flex items-center justify-center">
              {media.type === "VIDEO" ? (
                <div className="relative w-full h-full max-w-5xl">
                  <video
                    ref={setVideoRef}
                    src={media.url}
                    className="w-full h-full object-contain rounded-lg"
                    controls={false}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onClick={handleVideoClick}
                    poster={media.url.replace(/\.(mp4|mov|avi)$/i, ".jpg")}
                  />

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayPause}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMute}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full max-w-5xl">
                  <Image
                    src={media.url}
                    alt={`Wedding ${media.type.toLowerCase()} ${media.id}`}
                    fill
                    className="object-contain rounded-lg"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {media.type === "VIDEO" ? "🎥" : "📷"}
                </span>
                <span className="capitalize font-medium">
                  {media.type.toLowerCase()} - {media.category}
                </span>
              </div>
              {mediaList.length > 1 && (
                <div className="text-sm text-gray-300 mt-1">
                  {currentIndex + 1} of {mediaList.length}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
