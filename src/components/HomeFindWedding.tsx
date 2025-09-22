"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";
import HomeWeddingCard from "./HomeWeddingCard";
import { useState, useEffect } from "react";

interface Wedding {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  excerpt: string;
  tags: string[];
  slug: string;
  views: number;
}

const HomeFindWedding = () => {
  const { isDarkMode } = useTheme();
  const [featuredWeddings, setFeaturedWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeddings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/published-weddings");

        if (!response.ok) {
          throw new Error("Failed to fetch weddings");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Limit to 4 weddings for the homepage
          setFeaturedWeddings(data.data.slice(0, 4));
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching weddings:", error);
        setError(error instanceof Error ? error.message : "Failed to load weddings");
        // Fallback to empty array
        setFeaturedWeddings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeddings();
  }, []);

  return (
    <section
      id="search"
      className={`py-24 relative overflow-hidden ${
        isDarkMode
          ? "bg-gradient-to-br from-black/20 to-amber-900/20"
          : "bg-gradient-to-br from-amber-50/30 to-yellow-50/30"
      }`}
    >
      <ParallaxBackground speed={0.2}>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/40 to-yellow-200/40 rounded-full blur-2xl"></div>
      </ParallaxBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center mb-12">
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            <div
              className={`p-4 rounded-3xl shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-r from-black to-[#ab862b]"
                  : "bg-gradient-to-r from-[#ab862b] to-yellow-500"
              }`}
            >
              <Sparkles className={`h-12 w-12 ${isDarkMode ? "text-white" : "text-white"}`} />
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`rounded-3xl overflow-hidden shadow-xl animate-pulse ${
                  isDarkMode ? "bg-slate-800" : "bg-gray-200"
                }`}
              >
                <div className="h-64 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>{error}</p>
          </div>
        ) : featuredWeddings.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              No wedding pages found yet. Be the first to create one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredWeddings.map((wedding: Wedding, index: number) => (
              <HomeWeddingCard
                key={wedding.id}
                wedding={wedding}
                index={index}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {/* View more button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/wedding-pages"
            className={`inline-flex items-center px-4 py-3 rounded-2xl font-medium text-small transition-all duration-300 ${
              isDarkMode
                ? "text-white hover:text-gray-200 bg-black hover:bg-gray-800"
                : "text-white hover:text-gray-200 bg-black hover:bg-gray-800"
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
