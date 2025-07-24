"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";

const HomeFindWedding = () => {
  const { isDarkMode } = useTheme();

  return (
    <section
      id="search"
      className={`py-24 relative overflow-hidden ${
        isDarkMode
          ? "bg-gradient-to-br from-indigo-900/20 to-purple-900/20"
          : "bg-gradient-to-br from-indigo-50 to-purple-50"
      }`}
    >
      <ParallaxBackground speed={0.2}>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-2xl"></div>
      </ParallaxBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center mb-12">
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Find a Wedding
          </h2>

          <p
            className={`text-xl max-w-2xl mx-auto font-light mb-8 ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Search for wedding celebrations and share in the joy of couples around the world.
          </p>

          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto w-fit"
          >
            <Link
              href="/wedding-pages"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Heart className="h-5 w-5" />
              Browse Weddings
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default HomeFindWedding;
