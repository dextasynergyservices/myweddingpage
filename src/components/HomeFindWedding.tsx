"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";
import HomeWeddingCard from "./HomeWeddingCard"

// Mock data
const featuredWeddings = [
  {
    id: "1",
    title: "Sarah & Michael",
    date: "June 15, 2024",
    location: "Bali, Indonesia",
    image: "https://images.pexels.com/photos/952437/pexels-photo-952437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    excerpt: "A beautiful beachfront ceremony with sunset vows"
  },
  {
    id: "2",
    title: "James & Emma",
    date: "August 22, 2024",
    location: "Tuscany, Italy",
    image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    excerpt: "Rustic Italian vineyard wedding with local cuisine"
  },
  {
    id: "3",
    title: "David & Sophia",
    date: "May 5, 2024",
    location: "New York, USA",
    image: "https://images.pexels.com/photos/1408310/pexels-photo-1408310.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    excerpt: "Modern rooftop celebration with skyline views"
  },
  {
    id: "4",
    title: "Robert & Olivia",
    date: "September 12, 2024",
    location: "Paris, France",
    image: "https://images.pexels.com/photos/2567376/pexels-photo-2567376.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    excerpt: "Classic Parisian wedding at a historic chateau"
  }
];


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
        </AnimatedSection>

        {/* Featured weddings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredWeddings.map((wedding, index) => (
            <HomeWeddingCard
              key={wedding.id}
              wedding={wedding}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* View more button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/WeddingPageList"
            className={`inline-flex items-center px-4 py-3 rounded-2xl font-medium text-small transition-all duration-300 ${
              isDarkMode
                ? "text-indigo-300 hover:text-indigo-100 bg-indigo-900/50 hover:bg-indigo-900/70"
                : "text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200"
            }`}
          >
            View All Weddings
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeFindWedding;