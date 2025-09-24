"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import { useState } from "react";

const HowToHero = () => {
  const { isDarkMode } = useTheme();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <AnimatedSection className="text-center mb-20 pt-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="flex justify-center mt-12 mb-8"
      >
        <div className="p-6 bg-white rounded-3xl shadow-xl">
          <Image src="/logoicon.png" alt="my wedding page" width={60} height={60} />
        </div>
      </motion.div>

      <h1
        className={`text-2xl md:text-4xl font-light mb-6 tracking-tight ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        How to Use Myweddingpage.Online
      </h1>

      <p
        className={`text-sm md:text-lg font-light max-w-3xl mx-auto ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        Follow these easy steps to get started and make the most out of myweddingpage.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVideoOpen(true)}
        className={`mt-8 px-6 py-3 rounded-full flex items-center gap-2 mx-auto shadow-lg ${
          isDarkMode ? "bg-[#ab862b]/20 text-white" : "bg-white text-black"
        }`}
      >
        <Play
          className={`text-sm md:text-lg font-light w-5 h-5 max-w-3xl mx-auto ${
            isDarkMode ? "text-white/50" : "text-black"
          }`}
        />{" "}
        Watch Overview
      </motion.button>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="https://youtu.be/YNJxxn2eJUY"
        videoType="youtube"
      />
    </AnimatedSection>
  );
};

export default HowToHero;
