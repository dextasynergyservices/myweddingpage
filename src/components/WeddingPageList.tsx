"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Wedding {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  excerpt: string;
  tags: string[];
  slug?: string;
  views?: number;
}

const WeddingPageList = () => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [filteredWeddings, setFilteredWeddings] = useState<Wedding[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isDarkMode } = useTheme();

  const weddingsPerPage = 6;

  // Calculate pagination
  const indexOfLastWedding = currentPage * weddingsPerPage;
  const indexOfFirstWedding = indexOfLastWedding - weddingsPerPage;
  const currentWeddings = filteredWeddings.slice(indexOfFirstWedding, indexOfLastWedding);
  const totalPages = Math.ceil(filteredWeddings.length / weddingsPerPage);

  // Update your pagination functions
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);

  // Fetch real wedding data
  useEffect(() => {
    const fetchWeddings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/published-weddings");
        const result = await response.json();

        if (result.success) {
          setWeddings(result.data);
          setFilteredWeddings(result.data);
        } else {
          console.error("Failed to fetch weddings:", result.error);
          // Keep empty arrays as fallback
          setWeddings([]);
          setFilteredWeddings([]);
        }
      } catch (error) {
        console.error("Error fetching weddings:", error);
        // Keep empty arrays as fallback
        setWeddings([]);
        setFilteredWeddings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeddings();
  }, []);

  // Filtering
  useEffect(() => {
    let results = weddings;

    if (searchTerm) {
      results = results.filter(
        (w) =>
          w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      results = results.filter((w) => w.tags.includes(selectedTag));
    }

    setFilteredWeddings(results);
  }, [searchTerm, selectedTag, weddings]);

  // const allTags = Array.from(new Set(weddings.flatMap((w) => w.tags)));

  // Dark mode classes
  const cardBgClass = isDarkMode ? "bg-gray-800" : "bg-white";
  const tagBgClass = isDarkMode ? "bg-indigo-900 text-indigo-200" : "bg-indigo-100 text-indigo-800";

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero */}
      <div
        className={`relative top-8 ${isDarkMode ? "bg-indigo-950" : "bg-indigo-900"} text-white py-20 rounded-4xl mx-4 sm:mx-6 lg:mx-8`}
      >
        <div
          className={`absolute inset-0 ${isDarkMode ? "bg-black/40" : "bg-black/30"} rounded-4xl`}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-light mb-6">Wedding Celebrations</h1>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Browse beautiful weddings from around the world
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 ${isDarkMode ? "text-gray-300" : "text-gray-500"}`} />
            </div>
            <input
              type="text"
              placeholder="Search weddings by couple, location, or keywords..."
              className={`block w-full pl-10 pr-3 py-4 border ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-black placeholder-gray-500"
              } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Weddings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`${cardBgClass} rounded-xl shadow-md overflow-hidden animate-pulse`}
              >
                <div className={`h-48 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
                <div className="p-6">
                  <div
                    className={`h-6 rounded w-3/4 mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                  ></div>
                  <div
                    className={`h-4 rounded w-1/2 mb-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                  ></div>
                  <div
                    className={`h-4 rounded w-2/3 mb-3 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                  ></div>
                  <div
                    className={`h-4 rounded w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : currentWeddings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentWeddings.map((wedding, index) => (
                <motion.div
                  key={wedding.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`${cardBgClass} rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
                >
                  <Link
                    href={`/${wedding.slug}`}
                    className="block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={wedding.image}
                        alt={`${wedding.title} wedding`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 3}
                      />
                    </div>
                    <div className="p-6">
                      <h3
                        className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {wedding.title}
                      </h3>
                      <div
                        className={`flex items-center ${isDarkMode ? "text-gray-300" : "text-gray-500"} mb-1`}
                      >
                        <MapPin className="mr-2" />
                        <span>{wedding.location}</span>
                      </div>
                      <div
                        className={`flex items-center ${isDarkMode ? "text-gray-300" : "text-gray-500"} mb-3`}
                      >
                        <Calendar className="mr-2" />
                        <span>
                          {new Date(wedding.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
                        {wedding.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {wedding.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-1 rounded-full ${tagBgClass}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-indigo-100 dark:hover:bg-indigo-900"
                    }`}
                  >
                    <ChevronLeft
                      className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        number === currentPage
                          ? "bg-indigo-600 text-white"
                          : `hover:bg-indigo-100 dark:hover:bg-indigo-900 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-indigo-100 dark:hover:bg-indigo-900"
                    }`}
                  >
                    <ChevronRight
                      className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    />
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3
              className={`text-xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"} mb-2`}
            >
              No weddings found
            </h3>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WeddingPageList;
