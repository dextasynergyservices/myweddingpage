"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type Category = "before" | "during" | "after";

interface Photo {
  id: string;
  url: string;
  category: Category;
}

const categories: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Before Wedding", value: "before" },
  { label: "During Wedding", value: "during" },
  { label: "After Wedding", value: "after" },
];

const initialPhotos: Photo[] = [
  // Before Wedding
  {
    id: "b1",
    url: "https://images.pexels.com/photos/3884134/pexels-photo-3884134.jpeg",
    category: "before",
  },
  {
    id: "b2",
    url: "https://images.pexels.com/photos/3955811/pexels-photo-3955811.jpeg",
    category: "before",
  },
  {
    id: "b3",
    url: "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg",
    category: "before",
  },

  // During Wedding
  {
    id: "d1",
    url: "https://images.pexels.com/photos/1308746/pexels-photo-1308746.jpeg",
    category: "during",
  },
  {
    id: "d2",
    url: "https://images.pexels.com/photos/2657703/pexels-photo-2657703.jpeg",
    category: "during",
  },
  {
    id: "d3",
    url: "https://images.pexels.com/photos/931796/pexels-photo-931796.jpeg",
    category: "during",
  },

  // After Wedding
  {
    id: "a1",
    url: "https://images.pexels.com/photos/2658015/pexels-photo-2658015.jpeg",
    category: "after",
  },
  {
    id: "a2",
    url: "https://images.pexels.com/photos/2060244/pexels-photo-2060244.jpeg",
    category: "after",
  },
  {
    id: "a3",
    url: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg",
    category: "after",
  },
];

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedTab, setSelectedTab] = useState<"all" | Category>("all");
  const [category, setCategory] = useState<Category>("before");
  const [loading, setLoading] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);
  const { isDarkMode } = useTheme();

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = e.currentTarget.image as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    setLoading(true);
    setTimeout(() => {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg", // Placeholder
        category,
      };
      setPhotos((prev) => [newPhoto, ...prev]);
      setLoading(false);
      e.currentTarget.reset();
    }, 1000);
  };

  const filteredPhotos =
    selectedTab === "all" ? photos : photos.filter((photo) => photo.category === selectedTab);

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Wedding Photo Gallery
        </h1>
        <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Browse and upload your wedding photos by category.
        </p>
      </div>

      {/* Tabs */}
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
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="flex-1 text-sm file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded-full file:border-none file:cursor-pointer"
        />
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
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-50 hover:cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
      </form>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer"
            onClick={() => setModalPhoto(photo)}
          >
            <div className="relative aspect-[3/2] w-full">
              <Image
                src={photo.url}
                alt={`Photo ${photo.id}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-2xl"
              />
            </div>
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full capitalize">
              {photo.category}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalPhoto && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalPhoto(null)}
          >
            {/* Modal */}
            <div
              className="relative max-w-5xl w-full max-h-[90vh] p-4 md:p-8 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-white text-center mt-4">{modalPhoto.category}</div>
              <Image
                src={modalPhoto.url}
                alt={modalPhoto.category}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
                priority
              />

              {/* Close Button */}
              <button
                onClick={() => setModalPhoto(null)}
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
