"use client";

import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative"
      >
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        <Heart className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" fill="currentColor" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-slate-600 font-light"
      >
        Loading your wedding experience...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
