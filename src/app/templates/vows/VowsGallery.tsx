"use client";

import { useState } from "react";
import { useScrollAnimation, useScrollScale } from "@/app/templates/vows/hooks/useScrollAnimation";
// import galleryImage2 from "@/app/templates/vows/assets/gallery-2.jpg";
import Image from "next/image";
import MediaModal from "@/components/ui/MediaModal";
import styles from "@/styles/templates/vows.module.css";

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
}

interface GallerySectionProps extends GalleryProps {
  title?: string;
  description?: string;
  fallbackImages?: string[];
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  guests?: Record<string, unknown>[];
  bankDetails?: Record<string, unknown>[];
  storyImage?: string;
  heroImage?: string;
}

export const GallerySection = (props: GallerySectionProps) => {
  // Extract data from props with fallbacks
  // Prioritize user's gallery data over static template data
  const gallery = props.gallery || [];
  const title = props.title || "Our Gallery";
  const description =
    props.description || "Capturing the beautiful moments of our journey together";
  // const _displayImages = hasUserGallery ? [] : images;
  // const _displayVideos = hasUserGallery ? [] : videos;
  // const _fallbackImages = props.fallbackImages || [galleryImage1, galleryImage2];
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);
  const { scale: gallery1Scale } = useScrollScale();
  const { scale: gallery2Scale } = useScrollScale();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");

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
    <section className={`${styles.bgMuted}`}>
      <div className={styles.containerWedding}>
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className={`${styles.fontHeading} text-5xl md:text-6xl lg:text-7xl text-black mb-6`}>
            {title}
          </h2>
          <div className={`w-24 h-px ${styles.bgAccent} mx-auto mb-8`} />
          <p
            className={`${styles.fontBody} text-lg md:text-xl text-black/80 max-w-3xl mx-auto leading-relaxed`}
          >
            {description}
          </p>
        </div>

        {/* Tab Navigation - Only show if there are gallery items */}
        {finalGalleryItems.length > 0 && (
          <div className="flex flex-wrap text-black/80 justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id as GalleryCategory)}
                className={`px-6 py-3 rounded-full text-black/80 font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? `${styles.bgAccent} text-black/80 shadow-lg`
                    : `${styles.textMuted} hover:text-black/80 hover:shadow-md`
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
              <h3 className="font-serif text-2xl font-semibold text-black/80 mb-3">
                No Gallery Media Yet
              </h3>
              <p className="text-black/60 text-lg">
                Photos and videos will appear here once they are uploaded to the gallery.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paginatedItems.map((item, index) => (
              <div
                key={item.id}
                className={`transition-all duration-1000 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 200}ms`,
                  transform:
                    index === 0
                      ? `scale(${gallery1Scale})`
                      : index === filteredItems.length - 1
                        ? `scale(${gallery2Scale})`
                        : "scale(1)",
                }}
              >
                <div
                  className="relative group overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 cursor-pointer"
                  onClick={() => handleMediaClick(item, index)}
                >
                  <div className={`${item.aspectRatio} overflow-hidden`}>
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        width={600}
                        height={400}
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    : "bg-black text-white hover:bg-black/80"
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
                        ? "bg-black text-white"
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
                    : "bg-black text-white hover:bg-black/80"
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
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={selectedMedia !== null}
        onClose={handleCloseModal}
        media={selectedMedia}
        mediaList={filteredItems.map((item) => ({
          id: item.id as string,
          url:
            "url" in item
              ? (item.url as string)
              : ((item as Record<string, unknown>).src as string),
          type: ("type" in item ? item.type : "PHOTO") as "PHOTO" | "VIDEO",
          category: item.category as "during" | "before" | "after",
        }))}
        currentIndex={selectedMediaIndex}
        onNavigate={handleNavigate}
      />
    </section>
  );
};
