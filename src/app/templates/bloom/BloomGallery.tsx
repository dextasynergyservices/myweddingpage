import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
// Gallery images - using public paths
import Image from "next/image";
import MediaModal from "@/components/ui/MediaModal";
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import styles from "@/styles/templates/bloom.module.css";

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
  title?: string;
  description?: string;
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  guests?: Record<string, unknown>[];
  bankDetails?: Record<string, unknown>[];
  storyImage?: string;
  heroImage?: string;
}

const Gallery = ({
  gallery = [],
  title = "Our Gallery",
  description = "Capturing the beautiful moments of our journey together",
}: GalleryProps) => {
  const { elementRef, isVisible } = useScrollAnimation(0.1);
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
      url:
        "url" in item
          ? (item.url as string)
          : ((item as Record<string, unknown>).src as string),
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
    aspectRatio: "aspect-[3/4]" as const,
    category: item.category,
    type: item.type,
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

  console.log("Pagination debug:", {
    currentPage,
    totalPages,
    filteredItemsLength: filteredItems.length,
    startIndex,
    endIndex,
    paginatedItemsLength: paginatedItems.length,
  });

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
      elementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    // Scroll to top of gallery section after state update
    setTimeout(() => {
      elementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handlePageClick = (page: number) => {
    console.log("Clicking page:", page, "Current page:", currentPage);
    setCurrentPage(page);
    // Scroll to top of gallery section after state update
    setTimeout(() => {
      elementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "before", label: "Before Wedding" },
    { id: "during", label: "During Wedding" },
    { id: "after", label: "After Wedding" },
  ];

  return (
    <section
      id="bloom-gallery"
      className={`${styles.sectionPadding} ${styles.bgBackground} relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div
        className={`${styles.floatingElement} absolute top-40 right-10 opacity-5`}
      >
        <ImageIcon
          className={`w-40 h-40 text-primary ${styles.animateRomanticFloat}`}
        />
      </div>

      <div className={`${styles.containerBloom} mx-auto px-4`}>
        {/* Header */}
        <div
          ref={elementRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2
            className={`${styles.fontHeading} text-2xl md:text-5xl font-bold text-black mb-6`}
          >
            {title}
          </h2>
          <div
            className={`${styles.bgGradientRose} w-24 h-1 mx-auto mb-8`}
          ></div>
          <p
            className={`text-xl text-black/80 max-w-2xl mx-auto leading-relaxed`}
          >
            {description}
          </p>
        </div>

        {/* Tab Navigation - Only show if there are gallery items */}
        {finalGalleryItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12 text-black/80">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  handleCategoryChange(category.id as GalleryCategory)
                }
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? `${styles.bgGradientRose} text-black/80 shadow-lg`
                    : `text-black/80 hover:${styles.bgGradientRose} hover:text-white hover:shadow-md`
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
                className="w-24 h-24 mx-auto mb-6 text-rose-200"
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
                Photos and videos will appear here once they are uploaded to the
                gallery.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paginatedItems.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className={`transition-all duration-1000 ${
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${index * 200}ms`,
                  }}
                >
                  <div
                    className={`${styles.galleryItem} relative group cursor-pointer ${styles.roundedLg} overflow-hidden ${styles.shadowSoft} hover:${styles.shadowRomantic} ${styles.transitionRomantic}`}
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
                          className={`w-full h-full object-cover ${styles.transitionRomantic} group-hover:scale-105`}
                          width={400}
                          height={600}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                    </div>

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
              );
            })}
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
                    : `bg-black text-white hover:opacity-80`
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                        currentPage === page
                          ? `bg-black text-white`
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : `bg-black text-white hover:opacity-80`
                }`}
              >
                Next
              </button>
            </div>

            {/* Page Info */}
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {filteredItems.length} total
              items
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
          id: item.id,
          url:
            "url" in item
              ? item.url
              : ((item as Record<string, unknown>).src as string),
          type: "type" in item ? item.type : "PHOTO",
          category: item.category,
        }))}
        currentIndex={selectedMediaIndex}
        onNavigate={handleNavigate}
      />
    </section>
  );
};

export default Gallery;
