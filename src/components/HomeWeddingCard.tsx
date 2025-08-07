"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface Wedding {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  excerpt: string;
}

interface WeddingCardProps {
  wedding: Wedding;
  index: number;
  isDarkMode: boolean;
}

const HomeWeddingCard = ({ wedding, index, isDarkMode }: WeddingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Link
        href={`/wedding-pages/${wedding.id}`}
        className={`block h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
          isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-slate-50"
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
        </div>
        <div className="p-6">
          <h3
            className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}
          >
            {wedding.title}
          </h3>
          <p className={`text-sm mb-1 ${isDarkMode ? "text-indigo-300" : "text-indigo-600"}`}>
            {wedding.date}
          </p>
          <p className={`text-sm mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {wedding.location}
          </p>
          <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
            {wedding.excerpt}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default HomeWeddingCard;
