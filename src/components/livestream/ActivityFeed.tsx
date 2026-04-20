"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ActivityEvent {
  id: string;
  message: string;
  icon: string;
  timestamp: string;
  count: number;
}

interface ActivityFeedProps {
  streamId: string;
}

export default function ActivityFeed({ streamId }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch activity events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `/api/activity-feed?streamId=${streamId}&limit=20`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Error fetching activity feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [streamId]);

  // Track this guest joining
  useEffect(() => {
    const trackJoin = async () => {
      try {
        await fetch("/api/activity-feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streamId }),
        });
      } catch (error) {
        console.error("Error tracking guest join:", error);
      }
    };

    trackJoin();
  }, [streamId]);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        📊 Live Activity
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No activity yet. Be the first! 👋
          </p>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="text-2xl">{event.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  {event.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
