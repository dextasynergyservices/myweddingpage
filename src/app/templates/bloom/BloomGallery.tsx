import { useState } from "react";
import { useScrollAnimation, useScrollScale } from "./hooks/useScrollAnimation";
import { Play, Image as ImageIcon } from "lucide-react";
// Gallery images - using public paths
import Image from "next/image";
import MediaModal from "@/components/ui/MediaModal";
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
  images = [],
  videos = [],
  title = "Our Gallery",
  description = "Capturing the beautiful moments of our journey together",
}: GalleryProps) => {
  const { elementRef, isVisible } = useScrollAnimation(0.1);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");

  // Modal state
  const [selectedMedia, setSelectedMedia] = useState<{
    id: string;
    url: string;
    type: "PHOTO" | "VIDEO";
    category: "before" | "during" | "after";
  } | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // If user has gallery data, use it instead of static images/videos
  const hasUserGallery = gallery.length > 0;
  // const _displayImages = hasUserGallery ? [] : images;
  // const _displayVideos = hasUserGallery ? [] : videos;

  // Modal handlers
  const handleMediaClick = (item: Record<string, unknown>, index: number) => {
    // Convert gallery item to MediaModal format
    const mediaItem = {
      id: item.id,
      url: item.src || item.url,
      type: item.type || "PHOTO",
      category: item.category,
    };
    setSelectedMedia(mediaItem);
    setSelectedMediaIndex(index);
  };

  const handleNavigate = (index: number) => {
    setSelectedMediaIndex(index);
    const item = filteredItems[index];
    const mediaItem = {
      id: item.id,
      url: "url" in item ? item.url : ((item as Record<string, unknown>).src as string),
      type: "type" in item ? item.type : "PHOTO",
      category: item.category,
    };
    setSelectedMedia(mediaItem);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  // Create gallery items from props - prioritize user gallery data
  const galleryItems = [
    // Add images from gallery prop (user data) - prioritize this
    ...gallery.map((item) => ({
      id: item.id,
      src: item.url,
      url: item.url, // For MediaModal compatibility
      alt: `Gallery ${item.id}`,
      aspectRatio: "aspect-[3/4]" as const,
      category: item.category,
      type: item.type,
    })),
    // Add images from images prop (fallback) - only if no user gallery
    ...(hasUserGallery
      ? []
      : images.map((image, index) => ({
          id: `image-${index}`,
          src: image,
          url: image, // For MediaModal compatibility
          alt: `Gallery Image ${index + 1}`,
          aspectRatio: "aspect-[3/4]" as const,
          category: "during" as const,
          type: "PHOTO" as const,
        }))),
    // Add videos from videos prop (fallback) - only if no user gallery
    // Note: These are just placeholder videos with thumbnails, not real video URLs
    ...(hasUserGallery
      ? []
      : videos.map((video) => ({
          id: video.id,
          src: video.thumbnail, // Thumbnail for display
          url: video.thumbnail, // Using thumbnail as URL since no real video URL is provided
          alt: video.title,
          aspectRatio: "aspect-[3/4]" as const,
          category: video.category,
          type: "VIDEO" as const,
        }))),
  ];

  // If no gallery data provided, use default fallback
  const defaultGalleryItems = [
    {
      id: "default-1",
      src: "/templates/bloom/assets/wedding-details-1.jpg",
      url: "/templates/bloom/assets/wedding-details-1.jpg", // For MediaModal compatibility
      alt: "Engagement ring selection",
      aspectRatio: "aspect-[3/4]" as const,
      category: "before" as const,
      type: "PHOTO" as const,
    },
  ];

  const finalGalleryItems = galleryItems.length > 0 ? galleryItems : defaultGalleryItems;

  // Filter items based on active category
  const filteredItems =
    activeCategory === "all"
      ? finalGalleryItems
      : finalGalleryItems.filter((item) => item.category === activeCategory);

  // Individual scroll hooks for each gallery item
  const scrollHook1 = useScrollScale(0.1);
  const scrollHook2 = useScrollScale(0.1);
  const scrollHook3 = useScrollScale(0.1);
  const scrollHook4 = useScrollScale(0.1);
  const scrollHook5 = useScrollScale(0.1);
  const scrollHook6 = useScrollScale(0.1);
  const scrollHook7 = useScrollScale(0.1);
  const scrollHook8 = useScrollScale(0.1);
  const scrollHook9 = useScrollScale(0.1);
  const scrollHook10 = useScrollScale(0.1);
  const scrollHook11 = useScrollScale(0.1);
  const scrollHook12 = useScrollScale(0.1);

  const scrollHooks = [
    scrollHook1,
    scrollHook2,
    scrollHook3,
    scrollHook4,
    scrollHook5,
    scrollHook6,
    scrollHook7,
    scrollHook8,
    scrollHook9,
    scrollHook10,
    scrollHook11,
    scrollHook12,
  ];

  const categories = [
    { id: "all", label: "All" },
    { id: "before", label: "Before Wedding" },
    { id: "during", label: "During Wedding" },
    { id: "after", label: "After Wedding" },
  ];

  return (
    <section className={`${styles.sectionPadding} ${styles.bgBackground} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className={`${styles.floatingElement} absolute top-40 right-10 opacity-5`}>
        <ImageIcon className={`w-40 h-40 text-primary ${styles.animateRomanticFloat}`} />
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
            className={`${styles.fontHeading} text-2xl md:text-5xl font-bold ${styles.textForeground} mb-6`}
          >
            {title}
          </h2>
          <div className={`${styles.bgGradientRose} w-24 h-1 mx-auto mb-8`}></div>
          <p className={`text-xl ${styles.textMuted} max-w-2xl mx-auto leading-relaxed`}>
            {description}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as GalleryCategory)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? `${styles.bgGradientRose} text-white shadow-lg`
                  : `${styles.textMuted} hover:${styles.bgGradientRose} hover:text-white hover:shadow-md`
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className={styles.masonryGrid}>
          {filteredItems.map((item, index) => {
            // Find the original index of this item in the full galleryItems array
            const originalIndex = galleryItems.findIndex(
              (originalItem) => originalItem.id === item.id
            );
            const { elementRef: itemRef, isVisible: itemVisible } = scrollHooks[originalIndex];

            return (
              <div
                key={item.id}
                ref={itemRef}
                className={`mb-6 break-inside-avoid transition-all duration-[2500ms] ease-out ${
                  itemVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                style={{
                  transitionDelay: `${index * 300}ms`,
                  transformOrigin: "center",
                }}
              >
                <div
                  className={`${styles.galleryItem} relative group cursor-pointer ${styles.roundedLg} overflow-hidden ${styles.shadowSoft} hover:${styles.shadowRomantic} ${styles.transitionRomantic}`}
                  onClick={() => handleMediaClick(item, index)}
                >
                  <div className={`${item.aspectRatio} overflow-hidden`}>
                    {"type" in item && item.type === "VIDEO" ? (
                      // For videos, check if we have a real video URL or just a thumbnail
                      item.url.includes(".mp4") ||
                      item.url.includes(".mov") ||
                      item.url.includes(".webm") ? (
                        <video
                          src={item.url}
                          className={`w-full h-full object-cover ${styles.transitionRomantic} group-hover:scale-105`}
                          preload="metadata"
                          poster={item.src} // Use thumbnail as poster
                        />
                      ) : (
                        // If no real video URL, display thumbnail as image with play button
                        <Image
                          src={item.src}
                          alt={item.alt}
                          className={`w-full h-full object-cover ${styles.transitionRomantic} group-hover:scale-105`}
                          width={400}
                          height={600}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )
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

                  {/* Video Play Icon */}
                  {"type" in item && item.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
    </section>
  );
};

export default Gallery;
