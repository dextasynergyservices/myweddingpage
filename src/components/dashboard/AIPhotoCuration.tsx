"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const albums = [
  {
    id: 1,
    name: "Traditional",
    photos: [
      "https://images.pexels.com/photos/14083502/pexels-photo-14083502.jpeg",
      "https://images.pexels.com/photos/14083509/pexels-photo-14083509.jpeg",
      "https://images.pexels.com/photos/9317964/pexels-photo-9317964.jpeg",
    ],
  },
  {
    id: 2,
    name: "White Wedding",
    photos: [
      "https://images.pexels.com/photos/14083510/pexels-photo-14083510.jpeg",
      "https://images.pexels.com/photos/14083511/pexels-photo-14083511.jpeg",
      "https://images.pexels.com/photos/9317964/pexels-photo-9317964.jpeg",
    ],
  },
];

const AIPhotoCuration = () => {
  const { isDarkMode } = useTheme();
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);

  return (
    <div
      className={`rounded-3xl p-12  mb-16 transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Wedding Album Curation</h1>

      {/* Album selection */}
      <div className="flex justify-center space-x-4 mb-6">
        {albums.map((album) => (
          <motion.button
            key={album.id}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300 ${
              selectedAlbum === album.id
                ? "bg-blue-600 text-white"
                : isDarkMode
                  ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAlbum(album.id)}
          >
            {album.name}
          </motion.button>
        ))}
      </div>

      {/* Album display */}
      <AnimatePresence mode="wait">
        {selectedAlbum !== null && (
          <motion.div
            key={selectedAlbum}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {albums
              .find((album) => album.id === selectedAlbum)
              ?.photos.map((photo, index) => (
                <motion.div
                  key={index}
                  className={`overflow-hidden rounded-xl shadow-lg transition-colors duration-300 ${
                    isDarkMode ? "bg-slate-800" : "bg-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload photo */}
      <div className="mt-10 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg"
        >
          Upload Your Own Photos
        </motion.button>
      </div>
    </div>
  );
};

export default AIPhotoCuration;
