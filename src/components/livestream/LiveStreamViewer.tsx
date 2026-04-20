"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactionButtons from "@/components/livestream/ReactionButtons";
import VirtualGuestbook from "@/components/livestream/VirtualGuestbook";
import ActivityFeed from "@/components/livestream/ActivityFeed";

interface LiveStreamViewerProps {
  streamId: string;
  streamName: string;
  youtubeId: string;
}

export default function LiveStreamViewer({
  streamId,
  streamName,
  youtubeId,
}: LiveStreamViewerProps) {
  const [currentViewers, setCurrentViewers] = useState(0);
  const [streamHealth, setStreamHealth] = useState("Checking...");

  // Fetch viewer count and health
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/youtube-stats?videoId=${youtubeId}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentViewers(data.concurrentViewers || 0);
          setStreamHealth(data.health || "Good");
        }
      } catch (error) {
        console.error("Error fetching stream stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [youtubeId]);

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{streamName}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
            <span className="flex items-center gap-2">
              👥 {currentViewers.toLocaleString()} watching
            </span>
            <span className="flex items-center gap-2">📡 {streamHealth}</span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* YouTube Player */}
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video relative">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Reactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Send Your Reactions ❤️</h3>
              <ReactionButtons streamId={streamId} isGuest={true} />
            </div>

            {/* Guestbook - Show on mobile, hide on desktop where it's in sidebar */}
            <div className="lg:hidden">
              <VirtualGuestbook streamId={streamId} />
            </div>
          </motion.div>

          {/* Sidebar - Activity Feed & Guestbook */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Activity Feed */}
            <div className="h-[400px]">
              <ActivityFeed streamId={streamId} />
            </div>

            {/* Guestbook - Desktop only */}
            <div className="hidden lg:block h-[600px]">
              <VirtualGuestbook streamId={streamId} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
