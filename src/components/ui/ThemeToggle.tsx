"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-3 rounded-2xl transition-all duration-300 ${
        isDarkMode
          ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
          : "bg-white text-slate-600 hover:bg-slate-50 shadow-lg"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
