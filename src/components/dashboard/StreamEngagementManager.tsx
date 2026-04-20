"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import NotificationManager from "@/components/livestream/NotificationManager";
import InvitationCardDesigner from "@/components/livestream/InvitationCardDesigner";
import StreamSummary from "@/components/livestream/StreamSummary";

interface StreamEngagementManagerProps {
  streamId: string;
  streamName: string;
  weddingPageUrl: string;
}

export default function StreamEngagementManager({
  streamId,
  streamName,
  weddingPageUrl,
}: StreamEngagementManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "notifications" | "invitations" | "summary"
  >("notifications");

  const tabs = [
    { id: "notifications", label: "Send Notifications" },
    { id: "invitations", label: "Invitation Cards" },
    { id: "summary", label: "Stream Summary" },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Engagement & Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage guest notifications, create invitation cards, and view stream
          analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap sm:flex-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as "notifications" | "invitations" | "summary"
              )
            }
            className={`
              px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium whitespace-nowrap transition-all
              ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }
              ${"w-full sm:w-auto text-center"}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "notifications" && (
          <NotificationManager
            streamId={streamId}
            streamName={streamName}
            weddingPageUrl={weddingPageUrl}
          />
        )}
        {activeTab === "invitations" && (
          <InvitationCardDesigner
            streamId={streamId}
            weddingPageUrl={weddingPageUrl}
          />
        )}
        {activeTab === "summary" && <StreamSummary streamId={streamId} />}
      </div>
    </motion.div>
  );
}
