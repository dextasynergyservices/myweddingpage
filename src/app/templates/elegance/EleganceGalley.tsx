"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Image as ImageIcon, X } from "lucide-react";
import galleryPreview from "./assets/gallery-preview.jpg";
import styles from "@/styles/templates/elegance.module.css";
import Image from "next/image";

type GalleryCategory = "all" | "before" | "during" | "after";

type GalleryProps = Record<string, never>;

const Gallery: React.FC<GalleryProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    src: string;
    title: string;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const galleryItems = [
    {
      id: 1,
      type: "image" as const,
      src: galleryPreview.src,
      title: "Engagement Photos",
      description: "Our romantic engagement session",
      category: "before" as const,
    },
    {
      id: 2,
      type: "video" as const,
      src: "#",
      title: "Proposal Video",
      description: "The moment he asked forever",
      category: "before" as const,
    },
    {
      id: 3,
      type: "image" as const,
      src: galleryPreview.src,
      title: "Pre-Wedding",
      description: "Getting ready for our big day",
      category: "before" as const,
    },
    {
      id: 4,
      type: "video" as const,
      src: "#",
      title: "Wedding Ceremony",
      description: "Our beautiful ceremony",
      category: "during" as const,
    },
    {
      id: 5,
      type: "image" as const,
      src: galleryPreview.src,
      title: "Wedding Highlights",
      description: "Our ceremony and celebration",
      category: "during" as const,
    },
    {
      id: 6,
      type: "image" as const,
      src: galleryPreview.src,
      title: "Reception",
      description: "Dancing the night away",
      category: "during" as const,
    },
    {
      id: 7,
      type: "image" as const,
      src: galleryPreview.src,
      title: "Family & Friends",
      description: "Surrounded by love",
      category: "during" as const,
    },
    {
      id: 8,
      type: "image" as const,
      src: galleryPreview.src,
      title: "Honeymoon",
      description: "Our first adventure together",
      category: "after" as const,
    },
  ];

  // Filter items based on active category
  const filteredItems =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const categories = [
    { id: "all", label: "All" },
    { id: "before", label: "Before Wedding" },
    { id: "during", label: "During Wedding" },
    { id: "after", label: "After Wedding" },
  ];

  const openModal = (item: (typeof galleryItems)[0]) => {
    setSelectedMedia({ type: item.type, src: item.src, title: item.title });
  };

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
              onClick={() => openModal(item)}
            >
              <div className={`${styles.relative} ${styles.aspectSquare} ${styles.overflowHidden}`}>
                <Image
                  src={item.src}
                  alt={item.title}
                  width={400}
                  height={400}
                  className={`${styles.wFull} ${styles.hFull} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration700} ${styles.groupHoverScale110}`}
                  style={{
                    transform: `scale(${1 + scrollY * 0.0001})`,
                  }}
                />

                {/* Overlay */}
                <div
                  className={`${styles.absolute} ${styles.inset0} ${styles.bgPrimary20} ${styles.opacity0} ${styles.groupHoverOpacity100} ${styles.transitionOpacity} ${styles.duration300} ${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter}`}
                >
                  {item.type === "video" ? (
                    <Play
                      className={`${styles.w16} ${styles.h16} ${styles.textWhite}`}
                      fill="currentColor"
                    />
                  ) : (
                    <ImageIcon className={`${styles.w16} ${styles.h16} ${styles.textWhite}`} />
                  )}
                </div>

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

                {/* Type indicator */}
                <div className={`${styles.absolute} ${styles.top3} ${styles.right3}`}>
                  <div
                    className={`${styles.bgBlack50} ${styles.textWhite} ${styles.px2} ${styles.py1} ${styles.roundedFull} ${styles.textXs} ${styles.fontMedium}`}
                  >
                    {item.type === "video" ? "VIDEO" : "PHOTO"}
                  </div>
                </div>
              </div>

              <div className={styles.p4}>
                <h3
                  className={`${styles.fontDisplay} ${styles.textLg} ${styles.fontSemibold} ${styles.textForeground} ${styles.mb1}`}
                >
                  {item.title}
                </h3>
                <p className={`${styles.fontBody} ${styles.textSm} ${styles.textMutedForeground}`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedMedia && (
          <div
            className={`${styles.fixed} ${styles.inset0} ${styles.bgBlack90} ${styles.z50} ${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.p4}`}
          >
            <div
              className={`${styles.relative} ${styles.maxW4xl} ${styles.maxH90vh} ${styles.wFull}`}
            >
              <button
                className={`${styles.absolute} ${styles.negTop12} ${styles.right0} ${styles.textWhite} ${styles.borderWhite} ${styles.hoverBgWhite} ${styles.hoverTextBlack}`}
                onClick={() => setSelectedMedia(null)}
              >
                <X className={`${styles.w4} ${styles.h4}`} />
              </button>

              {selectedMedia.type === "image" ? (
                <Image
                  src={selectedMedia.src}
                  alt={selectedMedia.title}
                  width={800}
                  height={600}
                  className={`${styles.wFull} ${styles.hFull} ${styles.objectContain} ${styles.roundedLg}`}
                />
              ) : (
                <div
                  className={`${styles.bgGray800} ${styles.roundedLg} ${styles.p8} ${styles.textCenter}`}
                >
                  <Play
                    className={`${styles.w20} ${styles.h20} ${styles.textWhite} ${styles.mxAuto} ${styles.mb4}`}
                  />
                  <p className={`${styles.textWhite} ${styles.textLg}`}>Video coming soon!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
