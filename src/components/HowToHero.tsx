"use client";

import { motion } from "framer-motion";
import { Play, BookOpen } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";

const HowToHero = () => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection className="text-center mb-20 pt-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="flex justify-center mt-12 mb-8"
      >
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl">
          <BookOpen className="h-12 w-12 text-white" fill="currentColor" />
        </div>
      </motion.div>

      <h1
        className={`text-2xl md:text-4xl font-light mb-6 tracking-tight ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        How to Use Our Platform
      </h1>

      <p
        className={`text-sm md:text-lg font-light max-w-3xl mx-auto ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        Follow these easy steps to get started and make the most out of our tools.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`mt-8 px-6 py-3 rounded-full flex items-center gap-2 mx-auto shadow-lg ${
          isDarkMode ? "bg-slate-900 text-white" : "bg-white text-blue-600"
        }`}
      >
        <Play
          className={`text-sm md:text-lg font-light w-5 h-5 max-w-3xl mx-auto ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        />{" "}
        Watch Overview
      </motion.button>
    </AnimatedSection>
  );
};

export default HowToHero;
