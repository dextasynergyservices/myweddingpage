"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MediaModal from "@/components/ui/MediaModal";

type GalleryCategory = "all" | "before" | "during" | "after";

interface GalleryProps {
  gallery?: Array<{
    id: string;
    url: string;
    type: "PHOTO" | "VIDEO";
    category: "before" | "during" | "after";
    createdAt?: string;
  }>;
  images?: string[];
  videos?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    category: "before" | "during" | "after";
  }>;
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  guests?: Record<string, unknown>[];
  bankDetails?: Record<string, unknown>[];
  storyImage?: string;
  heroImage?: string;
}

const Gallery: React.FC<GalleryProps> = (props) => {
  // Extract data from props with fallbacks
  const gallery = props.gallery || [];
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3 rows of 2 items each

  // Modal state
  const [selectedMedia, setSelectedMedia] = useState<{
    id: string;
    url: string;
    type: "PHOTO" | "VIDEO";
    category: "before" | "during" | "after";
  } | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);
  // const _displayImages = hasUserGallery ? [] : images;
  // const _displayVideos = hasUserGallery ? [] : videos;

  // Modal handlers
  const handleMediaClick = (item: Record<string, unknown>, index: number) => {
    // Convert gallery item to MediaModal format
    const mediaItem = {
      id: item.id as string,
      url: (item.src || item.url) as string,
      type: (item.type || "PHOTO") as "PHOTO" | "VIDEO",
      category: item.category as "during" | "before" | "after",
    };
    setSelectedMedia(mediaItem);
    setSelectedMediaIndex(index);
  };

  const handleNavigate = (index: number) => {
    setSelectedMediaIndex(index);
    const item = filteredItems[index];
    const mediaItem = {
      id: item.id as string,
      url: "url" in item ? (item.url as string) : ((item as Record<string, unknown>).src as string),
      type: ("type" in item ? item.type : "PHOTO") as "PHOTO" | "VIDEO",
      category: item.category as "during" | "before" | "after",
    };
    setSelectedMedia(mediaItem);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  // Create gallery items from props - ONLY use user gallery data
  const galleryItems = gallery.map((item) => ({
    id: item.id,
    src: item.url,
    url: item.url, // For MediaModal compatibility
    alt: `Gallery ${item.id}`,
    category: item.category,
    type: item.type,
    aspectRatio: "aspect-square" as const,
  }));

  // Use user gallery items if available, otherwise empty array (no fallback to template images)
  const finalGalleryItems = galleryItems;

  // Filter items based on active category
  const filteredItems =
    activeCategory === "all"
      ? finalGalleryItems
      : finalGalleryItems.filter((item) => item.category === activeCategory);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when category changes
  const handleCategoryChange = (category: GalleryCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    // Scroll to top of gallery section after state update
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    // Scroll to top of gallery section after state update
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of gallery section after state update
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "before", label: "Before Wedding" },
    { id: "during", label: "During Wedding" },
    { id: "after", label: "After Wedding" },
  ];

  return (
    <section id="elegance-gallery" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-800 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-serif md:text-5xl text-2xl font-bold text-gray-900 mb-6">
            Our Gallery
          </h2>
          <p className="font-sans text-xl text-gray-600 max-w-3xl mx-auto">
            Capturing the beautiful moments of our journey together
          </p>
        </div>

        {/* Tab Navigation - Only show if there are gallery items */}
        {finalGalleryItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id as GalleryCategory)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-rose-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-rose-600 hover:text-white hover:shadow-md"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty State - Show when no gallery items */}
        {finalGalleryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <svg
                className="w-24 h-24 mx-auto mb-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="font-serif text-2xl font-semibold text-gray-800 mb-3">
                No Gallery Media Yet
              </h3>
              <p className="text-gray-600 text-lg">
                Photos and videos will appear here once they are uploaded to the gallery.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
            {paginatedItems.map((item, index) => (
              <div
                key={item.id}
                className={`group cursor-pointer overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleMediaClick(item, index)}
              >
                <div className={`relative ${item.aspectRatio} overflow-hidden`}>
                  {"type" in item && item.type === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center bg-black cursor-pointer">
                      <video className="w-full h-full object-cover">
                        <source src={item.url} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{
                        transform: `scale(${1 + scrollY * 0.0001})`,
                      }}
                    />
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {item.category === "before"
                        ? "Before Wedding"
                        : item.category === "during"
                          ? "During Wedding"
                          : item.category === "after"
                            ? "After Wedding"
                            : ""}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {finalGalleryItems.length > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center mt-16 space-y-4">
            {/* Page Numbers */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-rose-600 text-white hover:opacity-80"
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentPage === page
                        ? "bg-rose-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-rose-600 text-white hover:opacity-80"
                }`}
              >
                Next
              </button>
            </div>

            {/* Page Info */}
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {filteredItems.length} total items
            </p>
          </div>
        )}

        {/* Media Modal */}
        <MediaModal
          isOpen={selectedMedia !== null}
          onClose={handleCloseModal}
          media={selectedMedia}
          mediaList={filteredItems.map((item) => ({
            id: item.id,
            url: "url" in item ? item.url : ((item as Record<string, unknown>).src as string),
            type: "type" in item ? item.type : "PHOTO",
            category: item.category,
          }))}
          currentIndex={selectedMediaIndex}
          onNavigate={handleNavigate}
        />
      </div>
    </section>
  );
};

export default Gallery;
