"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingReaction {
  id: string;
  type: string;
  emoji: string;
  x: number;
}

interface ReactionButtonsProps {
  streamId: string;
  isGuest?: boolean;
}

const REACTIONS = [
  { type: "heart", emoji: "❤️", label: "Love" },
  { type: "clap", emoji: "👏", label: "Clap" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "tada", emoji: "🎉", label: "Celebrate" },
];

export default function ReactionButtons({ streamId }: ReactionButtonsProps) {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [cooldown, setCooldown] = useState(false);

  // Fetch reaction stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/reactions/stats?streamId=${streamId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || {});
        }
      } catch (error) {
        console.error("Error fetching reaction stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [streamId]);

  const sendReaction = async (type: string, emoji: string) => {
    if (cooldown) return;

    // Add floating animation
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 80 + 10; // Random position between 10% and 90%

    setFloatingReactions((prev) => [...prev, { id, type, emoji, x }]);

    // Remove after animation
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3000);

    // Send to API
    try {
      const response = await fetch("/api/reactions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId,
          type,
        }),
      });

      if (response.ok) {
        // Update stats optimistically
        setStats((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
      }
    } catch (error) {
      console.error("Error sending reaction:", error);
    }

    // Cooldown to prevent spam
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);

    // Haptic feedback on supported devices
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        (navigator as { vibrate?: (pattern: number) => void }).vibrate?.(10);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      {/* Floating Reactions Container (left side) - visible on all sizes */}
      <div className="fixed left-4 bottom-0 top-0 pointer-events-none z-40">
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ y: "100vh", opacity: 1, scale: 0 }}
              animate={{
                y: "-20vh",
                opacity: [1, 1, 0],
                scale: [0, 1.5, 1],
                rotate: [0, 15, -15, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute text-3xl left-0"
              style={{ left: 0, bottom: `${Math.random() * 30 + 10}px` }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction Buttons - vertical on left (desktop) */}
      <div className="hidden md:flex fixed left-4 top-1/2 z-50 transform -translate-y-1/2 flex-col gap-2">
        {REACTIONS.map((reaction) => (
          <motion.button
            key={reaction.type}
            onClick={() => sendReaction(reaction.type, reaction.emoji)}
            disabled={cooldown}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full
              bg-transparent
              text-gray-800 font-medium
              hover:bg-white/60 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="text-xl">{reaction.emoji}</span>
            <span className="text-xs">{stats[reaction.type] || 0}</span>
          </motion.button>
        ))}
      </div>
      {/* Mobile reaction bar (bottom) */}
      <motion.div
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-2 py-1 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "transparent" }}
        aria-hidden={false}
      >
        {REACTIONS.map((reaction) => (
          <motion.button
            key={reaction.type}
            onClick={() => sendReaction(reaction.type, reaction.emoji)}
            disabled={cooldown}
            whileTap={{ scale: 0.86 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-lg touch-manipulation"
            aria-label={reaction.label}
          >
            <span className="text-2xl">{reaction.emoji}</span>
          </motion.button>
        ))}
      </motion.div>

      {cooldown && (
        <p className="text-xs text-gray-500 mt-2">
          Wait a moment before sending another reaction...
        </p>
      )}
    </div>
  );
}
