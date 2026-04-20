"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// YouTube API types
declare global {
  interface Window {
    YT: {
      Player: unknown;
      PlayerState: {
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  videoType?: "local" | "youtube";
}

const VideoPlayerModal = ({
  isOpen,
  onClose,
  videoUrl = "/videos/overview.mp4",
  videoType = "local",
}: VideoPlayerModalProps) => {
  const { isDarkMode } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [, setIsFullscreen] = useState(false);

  // Helper function to extract YouTube video ID
  const getYouTubeId = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  // Get YouTube embed URL with native controls enabled
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeId(url);
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&playsinline=1`;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    const container = document.querySelector(".video-modal-container");
    if (container) {
      if (!document.fullscreenElement) {
        container
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch((err) => {
            console.log("Error attempting to enable fullscreen:", err);
          });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Add fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Seek forward/backward functions - for local videos only
  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20"
          />

          {/* Video Player Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`video-modal-container relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Video Element */}
            <div className="relative">
              {videoType === "youtube" ? (
                <iframe
                  ref={iframeRef}
                  src={getYouTubeEmbedUrl(videoUrl)}
                  className="w-full h-auto max-h-[70vh] aspect-video"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title="YouTube video player"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-auto max-h-[70vh] object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />

                  {/* Play/Pause Overlay */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center transition-colors"
                  >
                    <motion.div
                      animate={{ scale: isPlaying ? 0 : 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Play
                        className="w-8 h-8 text-black ml-1"
                        fill="currentColor"
                      />
                    </motion.div>
                  </motion.button>
                </>
              )}
            </div>

            {/* Controls - Show only for local videos */}
            {videoType === "local" && (
              <div
                className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
              >
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      className={`p-2 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      } hover:bg-gray-600 transition-colors`}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </motion.button>

                    {/* Seek buttons */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={seekBackward}
                      className={`p-2 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      } hover:bg-gray-600 transition-colors`}
                      title="Skip back 10s"
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={seekForward}
                      className={`p-2 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      } hover:bg-gray-600 transition-colors`}
                      title="Skip forward 10s"
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>

                    {/* Mute button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMute}
                      className={`p-2 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      } hover:bg-gray-600 transition-colors`}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </motion.button>

                    {/* Time display */}
                    <span
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className={`p-2 rounded-full ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-black"
                    } hover:bg-gray-600 transition-colors`}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayerModal;
