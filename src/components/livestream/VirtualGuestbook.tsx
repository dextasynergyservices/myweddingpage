"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GuestbookEntry {
  id: string;
  message: string;
  guestName: string | null;
  createdAt: string;
}

interface VirtualGuestbookProps {
  streamId: string;
}

export default function VirtualGuestbook({ streamId }: VirtualGuestbookProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch guestbook entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `/api/guestbook/entries?streamId=${streamId}&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error("Error fetching guestbook entries:", error);
      }
    };

    fetchEntries();
    const interval = setInterval(fetchEntries, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [streamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please write a message");
      return;
    }

    if (message.length > 500) {
      setError("Message must be 500 characters or less");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/guestbook/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId,
          message: message.trim(),
          guestName: guestName.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEntries((prev) => [data.entry, ...prev]);
        setMessage("");
        setGuestName("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit message");
      }
    } catch (error) {
      console.error("Error submitting guestbook entry:", error);
      setError("Failed to submit message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        ✍️ Virtual Guestbook
      </h3>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={50}
          />
        </div>

        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message or wish for the couple... 💐"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {message.length}/500 characters
            </span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500
                   text-white font-medium rounded-lg shadow-lg
                   hover:shadow-xl transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Post Message"}
        </button>
      </form>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {entries.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Be the first to leave a message! 💬
          </p>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                {entry.message}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium">
                  {entry.guestName || "Anonymous Guest"}
                </span>
                <span>
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
