"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import Image from "next/image";
import MediaModal from "@/components/ui/MediaModal";

interface GalleryMedia {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
  category: "before" | "during" | "after";
  createdAt?: string;
}

interface RusticGalleryProps {
  gallery?: GalleryMedia[];
  galleryPhotos?: GalleryMedia[]; // Legacy support
}

export default function RuticGallery(props: RusticGalleryProps) {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // Extract gallery data from props (prioritize gallery over galleryPhotos for consistency with API)
  const media = props.gallery || props.galleryPhotos || [];

  const filteredMedia =
    selectedCategory === "all" ? media : media.filter((item) => item.category === selectedCategory);

  const handleMediaClick = (item: GalleryMedia, index: number) => {
    setSelectedMedia(item);
    setSelectedMediaIndex(index);
  };

  const handleNavigate = (index: number) => {
    setSelectedMediaIndex(index);
    setSelectedMedia(filteredMedia[index]);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div
      className={`rounded-3xl p-12 shadow-lg border mb-16 ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
      }`}
    >
      <div className="text-center mb-12">
        <h2
          className={`text-4xl font-light mb-6 tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Our Wedding Gallery
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-8"></div>

        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {["all", "before", "during", "after"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : isDarkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {category === "all"
                ? "All Media"
                : `${category.charAt(0).toUpperCase() + category.slice(1)} Wedding`}
            </button>
          ))}
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            No media found in this category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedia.map((item, index) => (
            <div
              key={item.id}
              className="group cursor-pointer"
              onClick={() => handleMediaClick(item, index)}
            >
              <div className="relative overflow-hidden rounded-3xl shadow-lg">
                {item.type === "VIDEO" ? (
                  <video
                    src={item.url}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                    preload="metadata"
                    poster={item.url.replace(/\.(mp4|mov|avi)$/i, ".jpg")} // Use video thumbnail if available
                  />
                ) : (
                  <Image
                    src={item.url}
                    alt={`Wedding ${item.type.toLowerCase()} ${item.id}`}
                    width={600}
                    height={400}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-medium text-lg capitalize">
                    {item.type.toLowerCase()} - {item.category}
                  </h3>
                </div>
                {/* Media type indicator */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.type === "VIDEO" ? "🎥" : "📷"}
                </div>
                {/* Play button overlay for videos */}
                {item.type === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 rounded-full p-4">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Modal */}
      <MediaModal
        isOpen={!!selectedMedia}
        onClose={handleCloseModal}
        media={selectedMedia}
        mediaList={filteredMedia}
        currentIndex={selectedMediaIndex}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
