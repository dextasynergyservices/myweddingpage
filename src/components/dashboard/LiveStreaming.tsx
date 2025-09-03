"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
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

interface Viewer {
  id: string;
  name: string;
  joinTime: string;
  device: "desktop" | "mobile" | "tablet";
}

const LiveStreaming = () => {
  const { isDarkMode } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamConfigs, setStreamConfigs] = useState<StreamConfig[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [newStream, setNewStream] = useState({
    name: "",
    youtubeUrl: "",
    camera: "",
    quality: "1080p",
  });
  const [editingStream, setEditingStream] = useState<StreamConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [streamSettings, setStreamSettings] = useState({
    isPublic: true,
    requirePassword: false,
    password: "",
    allowChat: true,
    recordStream: true,
    maxViewers: 100,
  });

  // Fetch streams from the database
  useEffect(() => {
    fetchStreams();
    fetchViewers();
  }, []);

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

  const fetchViewers = async () => {
    try {
      const response = await fetch("/api/viewers");
      if (response.ok) {
        const data = await response.json();
        setViewers(data);
      }
    } catch (error) {
      console.error("Error fetching viewers:", error);
    }
  };

  const toggleStream = async () => {
    try {
      setIsLoading(true);
      if (!isStreaming) {
        const response = await fetch("/api/streams/start", {
          method: "POST",
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

  const toggleSingleStream = async (streamId: string, currentlyActive: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/streams/${streamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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

  const deleteStream = async (streamId: string) => {
    if (!confirm("Are you sure you want to delete this stream?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/streams/${streamId}`, {
        method: "DELETE",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStream),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddForm(false);
        setNewStream({ name: "", youtubeUrl: "", camera: "", quality: "1080p" });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStream),
      });

      if (response.ok) {
        setEditingStream(null);
        setShowAddForm(false);
        setNewStream({ name: "", youtubeUrl: "", camera: "", quality: "1080p" });
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

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return Monitor;
      case "mobile":
        return Smartphone;
      case "tablet":
        return Monitor;
      default:
        return Monitor;
    }
  };

  const totalViewers = streamConfigs.reduce((sum, config) => sum + config.viewerCount, 0);

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
          <button
            onClick={() => {
              setEditingStream(null);
              setNewStream({ name: "", youtubeUrl: "", camera: "", quality: "1080p" });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Add Stream
          </button>
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

      {/* Stream Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Stream Status",
            value: isStreaming ? "Live" : "Offline",
            icon: Video,
            color: isStreaming ? "from-red-500 to-red-600" : "from-slate-500 to-slate-600",
          },
          {
            title: "Total Viewers",
            value: totalViewers.toString(),
            icon: Eye,
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "Active Cameras",
            value: streamConfigs.filter((c) => c.isActive).length.toString(),
            icon: Camera,
            color: "from-purple-500 to-pink-600",
          },
          {
            title: "Watch Page",
            value: "Live",
            icon: Users,
            color: "from-emerald-500 to-teal-600",
            onClick: () => copyToClipboard(`${window.location.origin}/watch`),
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
                  <p className="text-xs mt-1 text-blue-500">Click to copy link</p>
                )}
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
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
                <label className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Stream Name
                </label>
                <input
                  type="text"
                  required
                  value={newStream.name}
                  onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Ceremony Stream"
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  YouTube URL
                </label>
                <input
                  type="url"
                  required
                  value={newStream.youtubeUrl}
                  onChange={(e) => setNewStream({ ...newStream, youtubeUrl: e.target.value })}
                  className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="https://youtube.com/embed/..."
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Camera Name
                </label>
                <input
                  type="text"
                  required
                  value={newStream.camera}
                  onChange={(e) => setNewStream({ ...newStream, camera: e.target.value })}
                  className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Sony A7III"
                />
              </div>
              <div>
                <label className={`block mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Quality
                </label>
                <select
                  value={newStream.quality}
                  onChange={(e) => setNewStream({ ...newStream, quality: e.target.value })}
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
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
        }`}
      >
        <h2 className={`text-2xl font-light mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
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
                    <ReactPlayer
                      src={embedUrl}
                      playing
                      controls
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                    />
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
                      {config.viewerCount}
                    </div>
                  )}
                </div>

                {/* Camera Info */}
                <div className={`p-4 ${isDarkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {config.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        {config.camera} • {config.quality}
                      </p>
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
                        onClick={() => deleteStream(config.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? "text-red-400 hover:bg-slate-600 hover:text-red-500"
                            : "text-red-600 hover:bg-slate-200 hover:text-red-700"
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleSingleStream(config.id, config.isActive)}
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

      {/* Live Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Live Viewers
          </h2>

          <div className="space-y-4">
            {viewers.map((viewer, index) => {
              const DeviceIcon = getDeviceIcon(viewer.device);

              return (
                <motion.div
                  key={viewer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl ${
                    isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {viewer.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <DeviceIcon
                        className={`h-4 w-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      />
                      <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                        Joined at {viewer.joinTime}
                      </span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stream Settings */}
        <div
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Stream Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Public Stream
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Allow anyone with the link to watch
                </p>
              </div>
              <button
                onClick={() => setStreamSettings((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  streamSettings.isPublic ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    streamSettings.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Password Protection
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Require password to join stream
                </p>
              </div>
              <button
                onClick={() =>
                  setStreamSettings((prev) => ({ ...prev, requirePassword: !prev.requirePassword }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  streamSettings.requirePassword
                    ? "bg-indigo-600"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    streamSettings.requirePassword ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Record Stream
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Save recording for later viewing
                </p>
              </div>
              <button
                onClick={() =>
                  setStreamSettings((prev) => ({ ...prev, recordStream: !prev.recordStream }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  streamSettings.recordStream ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    streamSettings.recordStream ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {streamSettings.requirePassword && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Stream Password
                </label>
                <input
                  type="password"
                  value={streamSettings.password}
                  onChange={(e) =>
                    setStreamSettings((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/watch`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share Stream Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreaming;
