"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import galleryPreview from "./assets/gallery-preview.jpg";
import styles from "@/styles/templates/elegance.module.css";
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
  const images = props.images || [];
  const videos = props.videos || [];
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const sectionRef = useRef<HTMLDivElement>(null);

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

  // If user has gallery data, use it instead of static images/videos
  const hasUserGallery = gallery.length > 0;
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

  // Create gallery items from props - prioritize user gallery data
  const galleryItems = [
    // Add images from gallery prop (user data) - prioritize this
    ...gallery.map((item) => ({
      id: item.id,
      src: item.url,
      url: item.url, // For MediaModal compatibility
      alt: `Gallery ${item.id}`,
      category: item.category,
      type: item.type,
      aspectRatio: "aspect-square" as const,
    })),
    // Add images from images prop (fallback) - only if no user gallery
    ...(hasUserGallery
      ? []
      : images.map((image, index) => ({
          id: `image-${index}`,
          src: image,
          url: image, // For MediaModal compatibility
          alt: `Gallery Image ${index + 1}`,
          category: "during" as const,
          type: "PHOTO" as const,
          aspectRatio: "aspect-square" as const,
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
          category: video.category,
          type: "VIDEO" as const,
          aspectRatio: "aspect-square" as const,
        }))),
  ];

  // If no gallery data provided, use default fallback
  const defaultGalleryItems = [
    {
      id: "default-1",
      src: galleryPreview.src,
      url: galleryPreview.src, // For MediaModal compatibility
      alt: "Engagement Photos",
      category: "before" as const,
      type: "PHOTO" as const,
      aspectRatio: "aspect-square" as const,
    },
  ];

  const finalGalleryItems = galleryItems.length > 0 ? galleryItems : defaultGalleryItems;

  // Filter items based on active category
  const filteredItems =
    activeCategory === "all"
      ? finalGalleryItems
      : finalGalleryItems.filter((item) => item.category === activeCategory);

  const categories = [
    { id: "all", label: "All" },
    { id: "before", label: "Before Wedding" },
    { id: "during", label: "During Wedding" },
    { id: "after", label: "After Wedding" },
  ];

  return (
    <section id="gallery" className={`${styles.py24} ${styles.bgBackground}`}>
      <div className={`${styles.container} ${styles.mxAuto} ${styles.px4}`}>
        <div
          ref={sectionRef}
          className={`${styles.textCenter} ${styles.mb16} ${styles.transitionAll} ${styles.duration800} ${
            isVisible ? styles.animateFadeInUp : `${styles.opacity0} ${styles.translateY8}`
          }`}
        >
          <h2
            className={`${styles.fontDisplay} md:text-5xl text-2xl ${styles.fontBold} ${styles.textForeground} ${styles.mb6}`}
          >
            Our Gallery
          </h2>
          <p
            className={`${styles.fontBody} ${styles.textXl} ${styles.textMutedForeground} ${styles.maxW3xl} ${styles.mxAuto}`}
          >
            Capturing the beautiful moments of our journey together
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
                  ? `${styles.bgPrimary} text-white shadow-lg`
                  : `${styles.textMutedForeground} hover:${styles.bgPrimary} hover:text-white hover:shadow-md`
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto`}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`${styles.group} ${styles.cursorPointer} ${styles.overflowHidden} ${styles.bgCard} ${styles.shadowElevated} ${styles.hoverShadowGlow} ${styles.transitionAll} ${styles.duration500} ${
                isVisible ? styles.animateScaleIn : `${styles.opacity0} ${styles.scale75}`
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleMediaClick(item, index)}
            >
              <div className={`${styles.relative} ${item.aspectRatio} ${styles.overflowHidden}`}>
                {"type" in item && item.type === "VIDEO" ? (
                  // For videos, check if we have a real video URL or just a thumbnail
                  item.url.includes(".mp4") ||
                  item.url.includes(".mov") ||
                  item.url.includes(".webm") ? (
                    <video
                      src={item.url}
                      className={`${styles.wFull} ${styles.hFull} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration700} ${styles.groupHoverScale110}`}
                      preload="metadata"
                      poster={item.src} // Use thumbnail as poster
                    />
                  ) : (
                    // If no real video URL, display thumbnail as image with play button
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={400}
                      height={400}
                      className={`${styles.wFull} ${styles.hFull} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration700} ${styles.groupHoverScale110}`}
                    />
                  )
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={400}
                    height={400}
                    className={`${styles.wFull} ${styles.hFull} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration700} ${styles.groupHoverScale110}`}
                    style={{
                      transform: `scale(${1 + scrollY * 0.0001})`,
                    }}
                  />
                )}

                {/* Category Badge */}
                <div className={`${styles.absolute} ${styles.top3} ${styles.left3}`}>
                  <div
                    className={`${styles.bgBlack50} ${styles.textWhite} ${styles.px2} ${styles.py1} ${styles.roundedFull} ${styles.textXs} ${styles.fontMedium}`}
                  >
                    {item.category === "before"
                      ? "Before Wedding"
                      : item.category === "during"
                        ? "During Wedding"
                        : item.category === "after"
                          ? "After Wedding"
                          : ""}
                  </div>
                </div>

                {/* Video Play Icon */}
                {"type" in item && item.type === "VIDEO" && (
                  <div
                    className={`${styles.absolute} ${styles.inset0} ${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter}`}
                  >
                    <div
                      className={`${styles.w16} ${styles.h16} ${styles.bgWhite80} ${styles.roundedFull} ${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.opacity0} ${styles.groupHoverOpacity100} ${styles.transitionOpacity} ${styles.duration300}`}
                    >
                      <Play
                        className={`${styles.w8} ${styles.h8} ${styles.textPrimary} ${styles.ml1}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
      </div>
    </section>
  );
};

export default Gallery;
