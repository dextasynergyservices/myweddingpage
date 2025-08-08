"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const FloatingHeart = () => (
  <div className="fixed bottom-10 right-10 pointer-events-none z-50">
    <motion.div
      animate={{
        y: [-10, 10, -10],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Heart className="h-8 w-8 text-indigo-400 opacity-60" fill="currentColor" />
    </motion.div>
  </div>
);

export default FloatingHeart;
