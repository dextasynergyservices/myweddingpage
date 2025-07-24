"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

const ContactHero = () => {
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
          <MessageCircle className="h-12 w-12 text-white" />
        </div>
      </motion.div>
      <h1
        className={`text-5xl md:text-6xl font-light mb-6 tracking-tight ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}
      >
        Get in Touch
      </h1>
      <p
        className={`text-xl font-light max-w-2xl mx-auto ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        We're here to help make your wedding dreams come true. Reach out to us anytime.
      </p>
    </AnimatedSection>
  );
};

export default ContactHero;
