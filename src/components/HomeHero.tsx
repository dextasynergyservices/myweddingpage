"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import FloatingHeart from "./FloatingHeart";
import { useTheme } from "@/contexts/ThemeContext";

const HomeHero = ({ onStartDemo }: { onStartDemo?: () => void }) => {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"
              : "bg-gradient-to-br from-slate-900/5 via-indigo-900/5 to-purple-900/5"
          }`}
        ></div>

        {/* Animated Background Elements */}
        <ParallaxBackground speed={0.2}>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl"></div>
        </ParallaxBackground>
        <ParallaxBackground speed={0.3}>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-xl"></div>
        </ParallaxBackground>
        <ParallaxBackground speed={0.4}>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-xl"></div>
        </ParallaxBackground>

        {/* Floating Hearts */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              <Heart className="h-4 w-4 text-pink-300/40" fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
          <div className="text-center">
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(99, 102, 241, 0.3)",
                      "0 0 40px rgba(99, 102, 241, 0.6)",
                      "0 0 20px rgba(99, 102, 241, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="h-12 w-12 text-indigo-600" fill="currentColor" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <motion.h1
              className={`text-4xl md:text-5xl font-light mb-6 leading-tight tracking-tight ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Your Perfect
              <motion.span
                className="block font-small bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                Wedding Journey
              </motion.span>
            </motion.h1>

            <motion.p
              className={`text-small mb-12 max-w-3xl mx-auto leading-relaxed font-light ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              Create stunning wedding experiences with our modern platform. Elegant design meets
              powerful functionality for the most important day of your life.
            </motion.p>

            <motion.div
              className="w-full flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:items-center mt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <Link href="/#packages" className="w-full sm:w-auto">
                <motion.button
                  type="button"
                  onClick={onStartDemo}
                  className="w-50 sm:w-auto group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-2xl font-small text-small shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 m-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>

              <Link href="/wedding-pages" className="w-full sm:w-auto">
                <motion.button
                  type="button"
                  onClick={onStartDemo}
                  className={`w-50 sm:w-auto border-2 border-slate-300 text-slate-700 px-4 py-2 rounded-2xl font-small text-small hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center justify-center gap-2 m-auto ${
                    isDarkMode
                      ? "border-slate-600 text-white hover:bg-slate-800 hover:border-slate-500"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Wedding Pages
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Element */}
      <FloatingHeart />
    </>
  );
};

export default HomeHero;
