"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface StreamSummaryData {
  summary: {
    totalViewers: number;
    peakViewers: number;
    totalReactions: number;
    totalGuestbook: number;
    reactionBreakdown: Record<string, number>;
    startedAt?: Date | null;
  };
  recentMessages: Array<{
    id: string;
    guestName: string;
    message: string;
    createdAt: Date;
  }>;
  stream: {
    name: string;
    isActive: boolean;
  };
}

interface StreamSummaryProps {
  streamId: string;
}

export default function StreamSummary({ streamId }: StreamSummaryProps) {
  const [summary, setSummary] = useState<StreamSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `/api/stream-summary?streamId=${streamId}`
        );
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Error fetching stream summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [streamId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-500">Loading summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-500">No summary available</p>
      </div>
    );
  }

  const reactionBreakdown = summary.summary?.reactionBreakdown || {};
  const reactionEmojis: Record<string, string> = {
    heart: "❤️",
    clap: "👏",
    fire: "🔥",
    tada: "🎉",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg shadow-lg p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
    >
      <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        Stream Summary
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Viewers
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.summary?.totalViewers || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Peak Viewers
          </p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {summary.summary?.peakViewers || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Reactions</p>
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
            {summary.summary?.totalReactions || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Guestbook</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {summary.summary?.totalGuestbook || 0}
          </p>
        </div>
      </div>

      {/* Reaction Breakdown */}
      {Object.keys(reactionBreakdown).length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Reactions Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(reactionBreakdown).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-2xl">{reactionEmojis[type] || "❤️"}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Messages */}
      {summary.recentMessages && summary.recentMessages.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">
            Recent Guestbook Messages
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {summary.recentMessages.map((message) => (
              <div
                key={message.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                  {message.message}
                </p>
                <p className="text-xs text-gray-500">
                  — {message.guestName || "Anonymous"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={() => window.print()}
        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500
                 text-white font-medium rounded-lg shadow-lg
                 hover:shadow-xl transition-all"
      >
        📄 Export as PDF
      </button>
    </motion.div>
  );
}
