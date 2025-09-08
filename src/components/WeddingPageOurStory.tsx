"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { motion } from "framer-motion";

interface WeddingPageOurStoryProps {
  content?: string;
  imageUrl?: string;
  styles?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export default function WeddingPageOurStory({
  content,
  imageUrl,
  styles,
}: WeddingPageOurStoryProps) {
  const { isDarkMode } = useTheme();

  const defaultContent = `Our journey began five years ago when we met at a coffee shop...`;
  const defaultImage = "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg";

  // Ensure we handle multiple paragraphs
  const paragraphs = (content || defaultContent).split("\n").filter((p) => p.trim() !== "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-8 md:p-12 shadow-lg border mb-16 ${
        isDarkMode ? "border-slate-700" : "border-slate-100"
      }`}
      style={{
        backgroundColor: styles?.backgroundColor || (isDarkMode ? "#1e293b" : "#ffffff"),
        color: styles?.textColor || (isDarkMode ? "#e2e8f0" : "#1e293b"),
      }}
    >
      <div className="text-center mb-8 md:mb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl md:text-4xl font-light mb-4 md:mb-6 tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Our Love Story
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {paragraphs.map((para, idx) => (
            <p
              key={idx}
              className={`leading-relaxed text-base md:text-lg font-light mb-4 md:mb-6 ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {para}
            </p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="relative">
            <Image
              src={imageUrl || defaultImage}
              alt="Our love story"
              width={600}
              height={400}
              className="rounded-3xl shadow-2xl max-w-full h-auto"
              priority
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              }}
              className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 blur-xl"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
