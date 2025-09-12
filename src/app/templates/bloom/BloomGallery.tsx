import { useState } from "react";
import { useScrollAnimation, useScrollScale } from "./hooks/useScrollAnimation";
import { X, Play, Image as ImageIcon } from "lucide-react";
// Gallery images - using public paths
import Image from "next/image";
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
}

const Gallery = ({
  gallery = [],
  images = [],
  videos = [],
  title = "Our Gallery",
  description = "Capturing the beautiful moments of our journey together",
}: GalleryProps) => {
  const { elementRef, isVisible } = useScrollAnimation(0.1);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    src: string;
    alt: string;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");

  // Create gallery items from props
  const galleryItems = [
    // Add images from gallery prop
    ...gallery.map((item) => ({
      id: item.id,
      type: item.type === "PHOTO" ? ("image" as const) : ("video" as const),
      src: item.url,
      alt: `Gallery ${item.id}`,
      aspectRatio: "aspect-[3/4]" as const,
      category: item.category,
    })),
    // Add images from images prop (fallback)
    ...images.map((image, index) => ({
      id: `image-${index}`,
      type: "image" as const,
      src: image,
      alt: `Gallery Image ${index + 1}`,
      aspectRatio: "aspect-[3/4]" as const,
      category: "during" as const,
    })),
    // Add videos from videos prop (fallback)
    ...videos.map((video) => ({
      id: video.id,
      type: "video" as const,
      src: video.thumbnail,
      alt: video.title,
      aspectRatio: "aspect-[3/4]" as const,
      category: video.category,
    })),
  ];

  // If no gallery data provided, use default fallback
  const defaultGalleryItems = [
    {
      id: "default-1",
      type: "image" as const,
      src: "/templates/bloom/assets/wedding-details-1.jpg",
      alt: "Engagement ring selection",
      aspectRatio: "aspect-[3/4]" as const,
      category: "before" as const,
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
                  onClick={() =>
                    setSelectedMedia({ type: item.type, src: item.src.toString(), alt: item.alt })
                  }
                >
                  {item.type === "image" ? (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      className={`w-full h-auto object-cover ${styles.transitionRomantic} group-hover:scale-105`}
                      width={400}
                      height={600}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className={`${item.aspectRatio} ${styles.videoPlaceholder} bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative`}
                    >
                      <Play
                        className={`${styles.videoPlayIcon} w-16 h-16 text-primary-foreground opacity-80 group-hover:opacity-100 ${styles.transitionSmooth}`}
                      />
                      <div
                        className={`${styles.videoOverlay} absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent`}
                      ></div>
                    </div>
                  )}

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

                  {/* Overlay */}
                  <div
                    className={`${styles.galleryOverlay} absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 ${styles.transitionRomantic} flex items-end`}
                  >
                    <div className={`${styles.galleryOverlayContent} p-4 text-primary-foreground`}>
                      <p className={`${styles.galleryOverlayText} font-medium`}>{item.alt}</p>
                      {item.type === "video" && (
                        <p className={`${styles.galleryOverlaySubtext} text-sm opacity-80`}>
                          Click to play video
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Type Icon */}
                  <div
                    className={`${styles.galleryTypeIcon} absolute top-4 right-4 opacity-0 group-hover:opacity-100 ${styles.transitionSmooth}`}
                  >
                    {item.type === "video" ? (
                      <Play
                        className={`${styles.galleryTypeIconPlay} w-6 h-6 text-primary-foreground`}
                      />
                    ) : (
                      <ImageIcon
                        className={`${styles.galleryTypeIconImage} w-6 h-6 text-primary-foreground`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedMedia && (
        <div
          className={`${styles.galleryModal} fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 ${styles.animateFadeInUp}`}
        >
          <div className={`${styles.galleryModalContent} relative max-w-4xl max-h-full`}>
            <button
              onClick={() => setSelectedMedia(null)}
              className={`${styles.galleryModalClose} absolute -top-12 right-0 text-white hover:text-primary ${styles.transitionSmooth}`}
            >
              <X className={`${styles.galleryModalCloseIcon} w-8 h-8`} />
            </button>

            {selectedMedia.type === "image" ? (
              <Image
                src={selectedMedia.src}
                alt={selectedMedia.alt}
                width={800}
                height={600}
                className={`${styles.galleryModalImage} max-w-full max-h-[80vh] object-contain rounded-lg`}
              />
            ) : (
              <div
                className={`${styles.galleryModalVideo} bg-primary/20 rounded-lg p-8 text-center text-white`}
              >
                <Play
                  className={`${styles.galleryModalVideoIcon} w-16 h-16 mx-auto mb-4 opacity-60`}
                />
                <p className={`${styles.galleryModalVideoText} text-lg`}>
                  Video player would be implemented here
                </p>
                <p className={`${styles.galleryModalVideoSubtext} text-sm opacity-60 mt-2`}>
                  {selectedMedia.alt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
