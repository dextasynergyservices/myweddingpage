"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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
        <div className="w-16 h-16 border-4 border-[#ab862b]/20 border-t-[#ab862b] rounded-full"></div>
        <div className="absolute inset-0 m-auto w-8 h-8">
          <Image
            src="/logoicon.png"
            alt="Loading..."
            width={32}
            height={32}
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[#ab862b] font-light"
      >
        Loading your wedding experience...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
