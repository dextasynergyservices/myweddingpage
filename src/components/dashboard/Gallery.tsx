"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, X, Video, ImageIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "next-auth/react";

type Category = "before" | "during" | "after";
type MediaType = "PHOTO" | "VIDEO";

interface MediaItem {
  id: string;
  url: string;
  category: Category;
  type: MediaType;
  createdAt: Date;
}

const categories: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Before Wedding", value: "before" },
  { label: "During Wedding", value: "during" },
  { label: "After Wedding", value: "after" },
];

const Gallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | Category>("all");
  const [selectedType, setSelectedType] = useState<"all" | MediaType>("all");
  const [category, setCategory] = useState<Category>("before");
  const [loading, setLoading] = useState(false);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [uploadType, setUploadType] = useState<MediaType>("PHOTO");
  const [uploadCount, setUploadCount] = useState({ photos: 0, videos: 0 });
  const [maxLimits, setMaxLimits] = useState({ photos: 0, videos: 0 });
  const { isDarkMode } = useTheme();
  const { data: session } = useSession();

  // Fetch user's media and plan limits
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, limitsRes] = await Promise.all([
          fetch("/api/gallery"),
          fetch("/api/user/limits"),
        ]);

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setMedia(mediaData);
        }

        if (limitsRes.ok) {
          const limitsData = await limitsRes.json();
          setUploadCount(limitsData.currentCount);
          setMaxLimits(limitsData.maxLimits);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = formData.getAll("media") as File[];

    if (!files.length) return;

    setLoading(true);

    try {
      const uploadData = new FormData();
      files.forEach((file) => uploadData.append("media", file));
      uploadData.append("category", category);
      uploadData.append("type", uploadType);

      const response = await fetch("/api/gallery-upload", {
        method: "POST",
        body: uploadData,
      });

      if (response.ok) {
        const newMedia = await response.json();
        setMedia((prev) => [...newMedia, ...prev]);

        // Update counts
        if (uploadType === "PHOTO") {
          setUploadCount((prev) => ({
            ...prev,
            photos: prev.photos + files.length,
          }));
        } else {
          setUploadCount((prev) => ({
            ...prev,
            videos: prev.videos + files.length,
          }));
        }
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setLoading(false);
      e.currentTarget.reset();
    }
  };

  const handleDelete = async (id: string, type: MediaType) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedia((prev) => prev.filter((item) => item.id !== id));

        // Update counts
        if (type === "PHOTO") {
          setUploadCount((prev) => ({ ...prev, photos: prev.photos - 1 }));
        } else {
          setUploadCount((prev) => ({ ...prev, videos: prev.videos - 1 }));
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filteredMedia = media.filter((item) => {
    const categoryMatch = selectedTab === "all" || item.category === selectedTab;
    const typeMatch = selectedType === "all" || item.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const canUploadPhotos = uploadCount.photos < maxLimits.photos;
  const canUploadVideos = uploadCount.videos < maxLimits.videos;

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Wedding Gallery
        </h1>
        <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Browse and upload your wedding photos and videos by category.
        </p>
        {/* Upload limits info */}
        <div className={`mt-4 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          <p>
            Photos: {uploadCount.photos} / {maxLimits.photos}
          </p>
          <p>
            Videos: {uploadCount.videos} / {maxLimits.videos}
          </p>

          {/* Specific limit messages */}
          {!canUploadPhotos && canUploadVideos && (
            <p className="text-amber-600 mt-2">
              Photo limit exceeded. Delete some photos to upload more.
            </p>
          )}
          {canUploadPhotos && !canUploadVideos && (
            <p className="text-amber-600 mt-2">
              Video limit exceeded. Delete some videos to upload more.
            </p>
          )}
          {!canUploadPhotos && !canUploadVideos && (
            <p className="text-amber-600 mt-2">
              Photo and Video limit exceeded. Delete some media to upload more.
            </p>
          )}
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
              ${
                selectedType === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                  : `${
                      isDarkMode ? "text-slate-300 border-slate-600" : "text-black border-slate-300"
                    } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
              }`}
        >
          All Media
        </button>
        <button
          onClick={() => setSelectedType("PHOTO")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
              ${
                selectedType === "PHOTO"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                  : `${
                      isDarkMode ? "text-slate-300 border-slate-600" : "text-black border-slate-300"
                    } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
              }`}
        >
          Photos
        </button>
        <button
          onClick={() => setSelectedType("VIDEO")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
              ${
                selectedType === "VIDEO"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                  : `${
                      isDarkMode ? "text-slate-300 border-slate-600" : "text-black border-slate-300"
                    } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
              }`}
        >
          Videos
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedTab(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out
                ${
                  selectedTab === cat.value
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                    : `${
                        isDarkMode
                          ? "text-slate-300 border-slate-600"
                          : "text-black border-slate-300"
                      } hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:cursor-pointer`
                }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className={`flex flex-col sm:flex-row gap-4 items-center rounded-2xl p-6 ${isDarkMode ? "text-white bg-slate-800 " : "bg-white text-slate-900"}`}
      >
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUploadType("PHOTO")}
              className={`px-4 py-2 rounded-xl border transition-all ${
                uploadType === "PHOTO"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : isDarkMode
                    ? "border-slate-600"
                    : "border-slate-300"
              }`}
              disabled={!canUploadPhotos}
            >
              <ImageIcon className="h-4 w-4 inline mr-2" />
              Photos
            </button>
            <button
              type="button"
              onClick={() => setUploadType("VIDEO")}
              className={`px-4 py-2 rounded-xl border transition-all ${
                uploadType === "VIDEO"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : isDarkMode
                    ? "border-slate-600"
                    : "border-slate-300"
              }`}
              disabled={!canUploadVideos}
            >
              <Video className="h-4 w-4 inline mr-2" />
              Videos
            </button>
          </div>

          <input
            type="file"
            name="media"
            accept={uploadType === "PHOTO" ? "image/*" : "video/*"}
            multiple
            required
            disabled={
              (uploadType === "PHOTO" && !canUploadPhotos) ||
              (uploadType === "VIDEO" && !canUploadVideos)
            }
            className="w-full text-sm file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded-full file:border-none file:cursor-pointer disabled:opacity-50"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="px-4 py-2 rounded-xl border border-slate-300"
        >
          <option value="before">Before Wedding</option>
          <option value="during">During Wedding</option>
          <option value="after">After Wedding</option>
        </select>

        <button
          type="submit"
          disabled={
            loading ||
            (uploadType === "PHOTO" && !canUploadPhotos) ||
            (uploadType === "VIDEO" && !canUploadVideos)
          }
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-50 hover:cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
      </form>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMedia.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative group overflow-hidden rounded-2xl shadow-lg"
          >
            <div className="relative aspect-[3/2] w-full">
              {item.type === "PHOTO" ? (
                <Image
                  src={item.url}
                  alt={`Photo ${item.id}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-2xl cursor-pointer"
                  onClick={() => setModalItem(item)}
                  unoptimized={true}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-black cursor-pointer"
                  onClick={() => setModalItem(item)}
                >
                  <video className="w-full h-full object-cover">
                    <source src={item.url} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full capitalize">
                {item.category}
              </div>

              <button
                onClick={() => handleDelete(item.id, item.type)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {item.type}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalItem && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalItem(null)}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] p-4 md:p-8 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-white text-center mt-4 capitalize">
                {modalItem.category} - {modalItem.type}
              </div>

              {modalItem.type === "PHOTO" ? (
                <Image
                  src={modalItem.url}
                  alt={modalItem.category}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
                  priority
                  unoptimized={true}
                />
              ) : (
                <video
                  controls
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
                >
                  <source src={modalItem.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <button
                onClick={() => setModalItem(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
