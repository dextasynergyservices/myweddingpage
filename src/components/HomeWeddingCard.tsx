"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import WeddingPreviewModal from "./WeddingPreviewModal";

interface Wedding {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  excerpt: string;
  tags?: string[];
  slug?: string;
  views?: number;
  is_live?: boolean;
  deleted_at?: string | null;
}

interface WeddingCardProps {
  wedding: Wedding;
  index: number;
  isDarkMode: boolean;
}

const HomeWeddingCard = ({ wedding, index, isDarkMode }: WeddingCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLive = wedding.is_live && !wedding.deleted_at;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isLive) {
      // Navigate to live page in new tab
      window.open(
        `/${wedding.slug || wedding.id}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      // Open preview modal for not-live pages
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <div
          onClick={handleClick}
          className={`block h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer ${
            isDarkMode
              ? "bg-black/50 hover:bg-black/70"
              : "bg-white/80 hover:bg-amber-50"
          }`}
        >
          <div className="relative h-48 w-full">
            <Image
              src={wedding.image}
              alt={`${wedding.title} wedding`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={index < 2}
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="
            />

            {/* Live/Not Live Badge */}
            <div className="absolute top-3 right-3">
              {isLive ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  🟢 LIVE
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  ⚪ NOT LIVE
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3
              className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}
            >
              {wedding.title}
            </h3>
            <p
              className={`text-sm mb-1 ${isDarkMode ? "text-[#ab862b]" : "text-[#ab862b]"}`}
            >
              {wedding.date}
            </p>
            <p
              className={`text-sm mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              {wedding.location}
            </p>
            <p
              className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}
            >
              {wedding.excerpt}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal for not-live pages */}
      <WeddingPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weddingSlug={wedding.slug || wedding.id}
        weddingTitle={wedding.title}
      />
    </>
  );
};

export default HomeWeddingCard;
