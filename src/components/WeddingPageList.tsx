"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface Wedding {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  excerpt: string;
  tags: string[];
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

  // Sample data
  useEffect(() => {
    const fetchWeddings = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulated loading

        const sampleWeddings: Wedding[] = [
          {
            id: "1",
            title: "Emma & James",
            date: "2024-06-15",
            location: "Santorini, Greece",
            image: "https://images.pexels.com/photos/169191/pexels-photo-169191.jpeg",
            excerpt: "Sunset beach wedding with golden accents",
            tags: ["beach", "destination", "summer"],
          },
          {
            id: "2",
            title: "Olivia & Noah",
            date: "2024-08-22",
            location: "Tuscany, Italy",
            image: "https://images.pexels.com/photos/2659475/pexels-photo-2659475.jpeg",
            excerpt: "Vineyard ceremony with rustic charm",
            tags: ["vineyard", "italy", "outdoor"],
          },
          {
            id: "3",
            title: "Ava & Liam",
            date: "2024-09-18",
            location: "Lagos, Nigeria",
            image: "https://images.pexels.com/photos/1344697/pexels-photo-1344697.jpeg",
            excerpt: "Traditional wedding with vibrant colors",
            tags: ["nigeria", "african", "traditional"],
          },
          {
            id: "4",
            title: "Sophia & Ethan",
            date: "2024-10-10",
            location: "Kyoto, Japan",
            image: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg",
            excerpt: "Cherry blossom garden wedding",
            tags: ["garden", "japan", "spring"],
          },
          {
            id: "5",
            title: "Isabella & Mason",
            date: "2024-11-05",
            location: "Cape Town, South Africa",
            image: "https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg",
            excerpt: "Mountain view ceremony with natural vibes",
            tags: ["outdoor", "africa", "mountain"],
          },
          {
            id: "6",
            title: "Amelia & Logan",
            date: "2024-12-01",
            location: "Bali, Indonesia",
            image: "https://images.pexels.com/photos/1400171/pexels-photo-1400171.jpeg",
            excerpt: "Tropical island wedding with ocean breeze",
            tags: ["beach", "island", "indonesia"],
          },
          {
            id: "7",
            title: "Mia & Elijah",
            date: "2025-01-12",
            location: "Paris, France",
            image: "https://images.pexels.com/photos/428013/pexels-photo-428013.jpeg",
            excerpt: "Elegant ceremony with Eiffel Tower backdrop",
            tags: ["paris", "europe", "romantic"],
          },
          {
            id: "8",
            title: "Harper & Lucas",
            date: "2025-02-20",
            location: "New York, USA",
            image: "https://images.pexels.com/photos/2659371/pexels-photo-2659371.jpeg",
            excerpt: "Modern rooftop wedding in the city",
            tags: ["urban", "usa", "modern"],
          },
          {
            id: "9",
            title: "Evelyn & Henry",
            date: "2025-03-08",
            location: "Accra, Ghana",
            image: "https://images.pexels.com/photos/1619654/pexels-photo-1619654.jpeg",
            excerpt: "Cultural fusion with West African traditions",
            tags: ["african", "cultural", "ghana"],
          },
          {
            id: "10",
            title: "Abigail & William",
            date: "2025-04-03",
            location: "London, UK",
            image: "https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg",
            excerpt: "Classic cathedral wedding with royal vibes",
            tags: ["europe", "classic", "cathedral"],
          },
          {
            id: "11",
            title: "Ella & Benjamin",
            date: "2025-05-16",
            location: "Dubai, UAE",
            image: "https://images.pexels.com/photos/3265451/pexels-photo-3265451.jpeg",
            excerpt: "Luxury wedding in the desert city",
            tags: ["luxury", "desert", "uae"],
          },
          {
            id: "12",
            title: "Grace & Daniel",
            date: "2025-06-12",
            location: "Ibadan, Nigeria",
            image: "https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg",
            excerpt: "Elegant Yoruba traditional ceremony",
            tags: ["yoruba", "nigeria", "traditional"],
          },
          {
            id: "13",
            title: "Chloe & Matthew",
            date: "2025-07-20",
            location: "Hawaii, USA",
            image: "https://images.pexels.com/photos/2659474/pexels-photo-2659474.jpeg",
            excerpt: "Seaside vows under palm trees",
            tags: ["beach", "island", "usa"],
          },
          {
            id: "14",
            title: "Victoria & Jack",
            date: "2025-08-18",
            location: "Marrakech, Morocco",
            image: "https://images.pexels.com/photos/3812762/pexels-photo-3812762.jpeg",
            excerpt: "Moroccan palace-themed celebration",
            tags: ["morocco", "cultural", "desert"],
          },
          {
            id: "15",
            title: "Zoe & Sebastian",
            date: "2025-09-12",
            location: "Barcelona, Spain",
            image: "https://images.pexels.com/photos/1295038/pexels-photo-1295038.jpeg",
            excerpt: "Mediterranean wedding by the sea",
            tags: ["spain", "europe", "beach"],
          },
          {
            id: "16",
            title: "Aria & Nathan",
            date: "2025-10-04",
            location: "Kigali, Rwanda",
            image: "https://images.pexels.com/photos/2698519/pexels-photo-2698519.jpeg",
            excerpt: "Eco-themed hilltop celebration",
            tags: ["eco", "rwanda", "nature"],
          },
          {
            id: "17",
            title: "Lily & Carter",
            date: "2025-11-22",
            location: "Queenstown, New Zealand",
            image: "https://images.pexels.com/photos/270575/pexels-photo-270575.jpeg",
            excerpt: "Lakefront wedding surrounded by mountains",
            tags: ["lake", "mountain", "nature"],
          },
          {
            id: "18",
            title: "Hannah & Andrew",
            date: "2025-12-15",
            location: "Abuja, Nigeria",
            image: "https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg",
            excerpt: "Northern Nigerian cultural wedding",
            tags: ["nigeria", "culture", "northern"],
          },
          {
            id: "19",
            title: "Scarlett & Leo",
            date: "2026-01-05",
            location: "Cairo, Egypt",
            image: "https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg",
            excerpt: "Timeless wedding near the pyramids",
            tags: ["egypt", "history", "desert"],
          },
          {
            id: "20",
            title: "Layla & Isaac",
            date: "2026-02-11",
            location: "Enugu, Nigeria",
            image: "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg",
            excerpt: "Igbo traditional ceremony with elegance",
            tags: ["igbo", "nigeria", "traditional"],
          },
          {
            id: "21",
            title: "Nora & Julian",
            date: "2026-03-23",
            location: "Istanbul, Turkey",
            image: "https://images.pexels.com/photos/3310692/pexels-photo-3310692.jpeg",
            excerpt: "Fusion wedding in a historic city",
            tags: ["turkey", "fusion", "historic"],
          },
        ];

        setWeddings(sampleWeddings);
        setFilteredWeddings(sampleWeddings);
      } catch (error) {
        console.error("Error fetching weddings:", error);
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
    <div className={`min-h-screen `}>
      {/* Hero */}
      <div
        className={`relative ${isDarkMode ? "bg-indigo-950" : "bg-indigo-900"} text-white py-20 rounded-4xl`}
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
                  <Link href={`/weddings/${wedding.id}`} className="block">
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
    </div>
  );
};

export default WeddingPageList;
