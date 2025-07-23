"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CTAButton = () => {
  return (
    <Link href="/#packages" passHref>
      <motion.button
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-2xl font-small hover:shadow-lg transition-all duration-300 inline-block"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started
      </motion.button>
    </Link>
  );
};

export default CTAButton;
