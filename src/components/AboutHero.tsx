"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";

const AboutHeroSection = () => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatedSection className="text-center mb-20 pt-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl">
          <Heart className="h-12 w-12 text-white" fill="currentColor" />
        </div>
      </motion.div>
      <h1
        className={`text-2xl md:text-4xl font-light mb-6 tracking-tight ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        About Our Story
      </h1>
      <p
        className={`text-sm md:text-lg font-light max-w-3xl mx-auto ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        We believe every love story deserves to be celebrated beautifully. Our platform was born
        from the desire to make wedding planning effortless and magical for couples everywhere.
      </p>
    </AnimatedSection>
  );
};

export default AboutHeroSection;
