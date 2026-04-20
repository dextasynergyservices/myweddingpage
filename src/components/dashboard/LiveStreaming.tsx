"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Camera,
  VideoOff,
  Users,
  Play,
  Square,
  Eye,
  Share2,
  Monitor,
  Smartphone,
  Plus,
  Copy,
  Trash2,
  Edit,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import StreamEngagementManager from "@/components/dashboard/StreamEngagementManager";

interface StreamConfig {
  id: string;
  name: string;
  youtubeUrl: string;
  youtubeId: string;
  camera: string;
  quality: string;
  isActive: boolean;
  viewerCount: number;
}

const LiveStreaming = () => {
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamConfigs, setStreamConfigs] = useState<StreamConfig[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"streams" | "engagement">(
    "streams"
  );
  const [newStream, setNewStream] = useState({
    name: "",
    youtubeUrl: "",
    camera: "",
    quality: "1080p",
  });
  const [editingStream, setEditingStream] = useState<StreamConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weddingPageUrl, setWeddingPageUrl] = useState<string | null>(null);
  const [streamHealth, setStreamHealth] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    streamId?: string;
  }>({
    isOpen: false,
  });

  // Fetch wedding page URL for sharing
  useEffect(() => {
    const fetchWeddingPageUrl = async () => {
      try {
        const response = await fetch("/api/user/wedding-page-info");
        if (response.ok) {
          const data = await response.json();
          console.log("📋 Wedding page URL fetched:", data.url);
          setWeddingPageUrl(data.url);
        } else {
          console.warn("Failed to fetch wedding page URL, using fallback");
          // Fallback: use current origin
          setWeddingPageUrl(window.location.origin);
        }
      } catch (error) {
        console.error("Error fetching wedding page URL:", error);
        // Fallback to current origin
        setWeddingPageUrl(window.location.origin);
      }
    };
    fetchWeddingPageUrl();
  }, []);

  // Fetch streams and update viewer counts from YouTube API
  useEffect(() => {
    fetchStreams();
  }, []);

  // Update viewer counts when streamConfigs changes and set up interval
  useEffect(() => {
    if (streamConfigs.length > 0) {
      // Update immediately when streams are loaded
      updateViewerCounts();

      // Set up interval to refresh viewer counts every 30 seconds
      const interval = setInterval(() => {
        updateViewerCounts();
      }, 30000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamConfigs]);

  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/streams");
      if (response.ok) {
        const data = await response.json();
        setStreamConfigs(data);

        // Check if any stream is active to set global streaming status
        const anyActive = data.some((stream: StreamConfig) => stream.isActive);
        setIsStreaming(anyActive);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch streams");
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // Update viewer counts from YouTube API for active streams
  const updateViewerCounts = async () => {
    if (streamConfigs.length === 0) {
      return;
    }

    const healthData: Record<string, string> = {};

    for (const stream of streamConfigs) {
      if (stream.isActive && stream.youtubeId) {
        try {
          const response = await fetch(
            `/api/youtube-stats?videoId=${stream.youtubeId}`
          );
          if (response.ok) {
            const data = await response.json();

            console.log(`✅ YouTube stats for ${stream.name}:`, data);

            // Update viewer count
            const viewerCount = data.concurrentViewers || data.viewerCount || 0;
            console.log(
              `📊 Updating ${stream.name} viewer count to:`,
              viewerCount
            );

            setStreamConfigs((prev) => {
              const updated = prev.map((s) =>
                s.id === stream.id ? { ...s, viewerCount } : s
              );
              console.log(`📊 Stream configs after update:`, updated);
              return updated;
            });

            // Track health
            healthData[stream.id] = data.health || "good";
          } else {
            // Get error details
            const errorData = await response
              .json()
              .catch(() => ({ error: "Unknown error" }));
            console.error(`❌ Failed to fetch stats for ${stream.name}:`, {
              status: response.status,
              error: errorData,
              videoId: stream.youtubeId,
            });
            healthData[stream.id] = "poor";
          }
        } catch (error) {
          console.error(
            `❌ Error updating stats for stream ${stream.name}:`,
            error
          );
          healthData[stream.id] = "poor";
        }
      }
    }

    if (Object.keys(healthData).length > 0) {
      setStreamHealth(healthData);
    }
  };

  const toggleStream = async () => {
    try {
      setIsLoading(true);
      if (!isStreaming) {
        const response = await fetch("/api/streams/start", {
          method: "POST",
          credentials: "include",
          headers: {
            "x-csrf-token": csrfToken || "",
          },
        });

        if (response.ok) {
          setIsStreaming(true);
          fetchStreams();
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to start stream");
        }
      } else {
        const response = await fetch("/api/streams/stop", {
          method: "POST",
          credentials: "include",
          headers: {
            "x-csrf-token": csrfToken || "",
          },
        });

        if (response.ok) {
          setIsStreaming(false);
          fetchStreams();
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to stop stream");
        }
      }
    } catch (error) {
      console.error("Error toggling stream:", error);
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSingleStream = async (
    streamId: string,
    currentlyActive: boolean
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/streams/${streamId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });

      if (response.ok) {
        fetchStreams();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to toggle stream");
      }
    } catch (error) {
      console.error("Error toggling single stream:", error);
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStream = async (streamId: string | undefined) => {
    if (!streamId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/streams/${streamId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        fetchStreams();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete stream");
      }
    } catch (error) {
      console.error("Error deleting stream:", error);
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
      setConfirmDelete({ isOpen: false });
    }
  };

  // Handle stream function
  const handleAddStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!newStream.name || !newStream.youtubeUrl || !newStream.camera) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/streams", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(newStream),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddForm(false);
        setNewStream({
          name: "",
          youtubeUrl: "",
          camera: "",
          quality: "1080p",
        });
        fetchStreams();
      } else {
        setError(data.error || "Failed to create stream");
        if (data.details) {
          console.error("API Error details:", data.details);
        }
      }
    } catch (error) {
      console.error("Error adding stream:", error);
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStream) return;
    setError(null);

    try {
      setIsLoading(true);
      const response = await fetch(`/api/streams/${editingStream.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(newStream),
      });

      if (response.ok) {
        setEditingStream(null);
        setShowAddForm(false);
        setNewStream({
          name: "",
          youtubeUrl: "",
          camera: "",
          quality: "1080p",
        });
        fetchStreams();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update stream");
      }
    } catch (error) {
      console.error("Error updating stream:", error);
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // const extractYouTubeID = (url: string): string => {

  //   return "";
  // };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const totalViewers = streamConfigs.reduce(
    (sum, config) => sum + config.viewerCount,
    0
  );

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-3xl p-4 bg-red-100 border border-red-400 text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-800 hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-center">Processing...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Live Streaming
          </h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Share your special moments with loved ones around the world
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === "streams" && (
            <button
              onClick={() => {
                setEditingStream(null);
                setNewStream({
                  name: "",
                  youtubeUrl: "",
                  camera: "",
                  quality: "1080p",
                });
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Add Stream
            </button>
          )}
          <button
            onClick={toggleStream}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
              isStreaming
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isStreaming ? (
              <>
                <Square className="h-5 w-5" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("streams")}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "streams"
              ? `border-b-2 border-purple-500 ${isDarkMode ? "text-white" : "text-purple-600"}`
              : `${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          Manage Streams
        </button>
        <button
          onClick={() => setActiveTab("engagement")}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "engagement"
              ? `border-b-2 border-purple-500 ${isDarkMode ? "text-white" : "text-purple-600"}`
              : `${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          Send Notifications & Engagement
        </button>
      </div>

      {/* Tab Content: Streams */}
      {activeTab === "streams" && (
        <>
          {/* Stream Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Stream Status",
                value: isStreaming ? "Live" : "Offline",
                icon: Video,
                color: isStreaming
                  ? "from-red-500 to-red-600"
                  : "from-slate-500 to-slate-600",
              },
              {
                title: "Total Viewers",
                value: totalViewers.toString(),
                icon: Eye,
                color: "from-blue-500 to-indigo-600",
              },
              {
                title: "Active Cameras",
                value: streamConfigs
                  .filter((c) => c.isActive)
                  .length.toString(),
                icon: Camera,
                color: "from-purple-500 to-pink-600",
              },
              {
                title: "Share Wedding Page",
                value: "Copy Link",
                icon: Share2,
                color: "from-emerald-500 to-teal-600",
                onClick: () =>
                  copyToClipboard(
                    weddingPageUrl || `${window.location.origin}`
                  ),
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-3xl p-6 shadow-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} ${stat.onClick ? "cursor-pointer" : ""}`}
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={`text-3xl font-light mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {stat.value}
                    </p>
                    {stat.title === "Watch Page" && (
                      <p className="text-xs mt-1 text-blue-500">
                        Click to copy link
                      </p>
                    )}
                  </div>
                  <div
                    className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Copy notification */}
          {copiedUrl && (
            <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
              <Copy className="h-4 w-4" />
              <span>Link copied to clipboard!</span>
            </div>
          )}

          {/* Add/Edit Stream Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
              <div
                className={`rounded-3xl p-8 w-full max-w-md my-8 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
              >
                <h2
                  className={`text-2xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {editingStream ? "Edit Stream" : "Add New Stream"}
                </h2>
                <form
                  onSubmit={editingStream ? handleEditStream : handleAddStream}
                  className="space-y-4"
                >
                  <div>
                    <label
                      className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Stream Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newStream.name}
                      onChange={(e) =>
                        setNewStream({ ...newStream, name: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                      placeholder="Ceremony Stream"
                    />
                  </div>
                  <div>
                    <label
                      className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      required
                      value={newStream.youtubeUrl}
                      onChange={(e) =>
                        setNewStream({
                          ...newStream,
                          youtubeUrl: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>
                  <div>
                    <label
                      className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Camera Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newStream.camera}
                      onChange={(e) =>
                        setNewStream({ ...newStream, camera: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                      placeholder="Sony A7III"
                    />
                  </div>
                  <div>
                    <label
                      className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Quality
                    </label>
                    <select
                      value={newStream.quality}
                      onChange={(e) =>
                        setNewStream({ ...newStream, quality: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="1440p">1440p</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingStream(null);
                      }}
                      className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300"
                    >
                      {editingStream ? "Update Stream" : "Add Stream"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Camera Feeds */}
          <div
            className={`rounded-3xl p-8 shadow-lg border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-100"
            }`}
          >
            <h2
              className={`text-2xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Camera Feeds
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {streamConfigs.map((config, index) => {
                const embedUrl = config.youtubeId
                  ? `https://www.youtube.com/embed/${config.youtubeId}`
                  : config.youtubeUrl;

                return (
                  <motion.div
                    key={config.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative rounded-2xl overflow-hidden border-2 ${
                      config.isActive
                        ? "border-red-500"
                        : isDarkMode
                          ? "border-slate-600"
                          : "border-slate-300"
                    }`}
                  >
                    {/* Video Preview */}
                    <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                      {config.isActive ? (
                        <div className="w-full h-full relative">
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
                      ) : (
                        <div className="text-center text-slate-400">
                          <VideoOff className="h-16 w-16 mx-auto mb-4" />
                          <p className="text-lg">Camera Offline</p>
                        </div>
                      )}

                      {/* Live Indicator */}
                      {config.isActive && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      )}

                      {/* Viewer Count */}
                      {config.isActive && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{config.viewerCount || 0}</span>
                        </div>
                      )}
                    </div>

                    {/* Camera Info */}
                    <div
                      className={`p-4 ${isDarkMode ? "bg-slate-700" : "bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            {config.name}
                          </h3>
                          <p
                            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {config.camera} • {config.quality}
                          </p>
                          {/* Stream Health Indicator */}
                          {config.isActive && (
                            <div className="flex items-center gap-1 mt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  (streamHealth[config.id] || "poor") === "good"
                                    ? "bg-green-500"
                                    : (streamHealth[config.id] || "poor") ===
                                        "fair"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                              />
                              <span className="text-xs text-slate-500">
                                {(streamHealth[config.id] || "poor") === "good"
                                  ? "Excellent"
                                  : (streamHealth[config.id] || "poor") ===
                                      "fair"
                                    ? "Fair"
                                    : "Checking..."}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingStream(config);
                              setNewStream({
                                name: config.name,
                                youtubeUrl: config.youtubeUrl,
                                camera: config.camera,
                                quality: config.quality,
                              });
                              setShowAddForm(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? "text-slate-400 hover:bg-slate-600 hover:text-white"
                                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                isOpen: true,
                                streamId: config.id,
                              })
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode
                                ? "text-red-400 hover:bg-slate-600 hover:text-red-500"
                                : "text-red-600 hover:bg-slate-200 hover:text-red-700"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              toggleSingleStream(config.id, config.isActive)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              config.isActive
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {config.isActive ? (
                              <VideoOff className="h-4 w-4" />
                            ) : (
                              <Video className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stream Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              className={`rounded-3xl p-6 shadow-lg border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-100"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <Users className="h-6 w-6" />
                Stream Analytics
              </h2>

              <div className="space-y-4">
                {/* Current Viewers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl ${
                    isDarkMode
                      ? "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30"
                      : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          Currently Watching
                        </p>
                        <p
                          className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {totalViewers}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-500 font-medium">
                        LIVE
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Peak Viewers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-4 rounded-2xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Peak Viewers
                      </p>
                      <p
                        className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {Math.max(
                          totalViewers,
                          ...streamConfigs.map((s) => s.viewerCount)
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Total Views */}
                {streamConfigs.length > 0 && streamConfigs[0].youtubeId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-2xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          Stream Health
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              streamHealth[streamConfigs[0].id] === "good"
                                ? "bg-green-500"
                                : streamHealth[streamConfigs[0].id] === "fair"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <p
                            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            {streamHealth[streamConfigs[0].id] === "good"
                              ? "Excellent"
                              : streamHealth[streamConfigs[0].id] === "fair"
                                ? "Fair"
                                : streamHealth[streamConfigs[0].id]
                                  ? "Poor"
                                  : "Checking..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Active Streams Count */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`p-4 rounded-2xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Active Streams
                      </p>
                      <p
                        className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {streamConfigs.filter((s) => s.isActive).length} /{" "}
                        {streamConfigs.length}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Engagement Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`p-4 rounded-2xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Engagement Level
                      </p>
                      <p
                        className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {totalViewers > 100
                          ? "High"
                          : totalViewers > 50
                            ? "Medium"
                            : totalViewers > 0
                              ? "Growing"
                              : "Starting"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className={`rounded-3xl p-6 shadow-lg border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-100"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <AlertCircle className="h-6 w-6" />
                Quick Actions
              </h2>

              <div className="space-y-3">
                {/* Copy Wedding Page Link */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const shareUrl =
                      weddingPageUrl || `${window.location.origin}`;
                    copyToClipboard(shareUrl);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    isDarkMode
                      ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30"
                      : "bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200"
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {copiedUrl === weddingPageUrl ? (
                      <Copy className="h-5 w-5 text-white" />
                    ) : (
                      <Share2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {copiedUrl === weddingPageUrl
                        ? "Link Copied!"
                        : "Share Wedding Page"}
                    </p>
                    <p
                      className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Copy link for guests to watch
                    </p>
                  </div>
                </motion.button>

                {/* YouTube Studio */}
                {streamConfigs.length > 0 && streamConfigs[0].youtubeId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.open(
                        `https://studio.youtube.com/video/${streamConfigs[0].youtubeId}/livestreaming`,
                        "_blank"
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                      isDarkMode
                        ? "bg-slate-700/50 hover:bg-slate-700"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        YouTube Studio
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Manage stream settings on YouTube
                      </p>
                    </div>
                  </motion.button>
                )}

                {/* View Analytics */}
                {streamConfigs.length > 0 && streamConfigs[0].youtubeId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.open(
                        `https://studio.youtube.com/video/${streamConfigs[0].youtubeId}/analytics`,
                        "_blank"
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                      isDarkMode
                        ? "bg-slate-700/50 hover:bg-slate-700"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        View Full Analytics
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        See detailed YouTube analytics
                      </p>
                    </div>
                  </motion.button>
                )}

                {/* Manage Chat */}
                {streamConfigs.length > 0 && streamConfigs[0].youtubeId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.open(
                        `https://www.youtube.com/live_chat?v=${streamConfigs[0].youtubeId}&is_popout=1`,
                        "_blank"
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                      isDarkMode
                        ? "bg-slate-700/50 hover:bg-slate-700"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        Manage Live Chat
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Interact with viewers in real-time
                      </p>
                    </div>
                  </motion.button>
                )}

                {/* Generate QR Code */}
                {weddingPageUrl && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Open QR code generator with wedding page URL
                      window.open(
                        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(weddingPageUrl)}`,
                        "_blank"
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                      isDarkMode
                        ? "bg-slate-700/50 hover:bg-slate-700"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        Generate QR Code
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Let guests scan to join quickly
                      </p>
                    </div>
                  </motion.button>
                )}

                {/* Info Message */}
                {weddingPageUrl && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p
                      className={`text-xs text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      💡 Stream will be visible on your wedding page when live
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab Content: Engagement */}
      {activeTab === "engagement" && streamConfigs.length > 0 && (
        <StreamEngagementManager
          streamId={streamConfigs[0].id}
          streamName={streamConfigs[0].name}
          weddingPageUrl={weddingPageUrl || ""}
        />
      )}

      {activeTab === "engagement" && streamConfigs.length === 0 && (
        <div
          className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          <p>Please add a stream first to access engagement features.</p>
        </div>
      )}

      {/* Confirm delete dialog (uses component-level state) */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false })}
        onConfirm={() => deleteStream(confirmDelete.streamId)}
        title="Delete stream"
        message="Are you sure you want to delete this stream? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default LiveStreaming;

// Confirm delete dialog rendered by the component (keeps file self-contained)
// Note: the component uses setConfirmDelete state defined above; React will hoist this render into the component tree.
