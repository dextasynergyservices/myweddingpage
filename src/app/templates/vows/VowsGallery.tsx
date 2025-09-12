"use client";

import { useState } from "react";
import { useScrollAnimation, useScrollScale } from "@/app/templates/vows/hooks/useScrollAnimation";
import galleryImage1 from "@/app/templates/vows/assets/gallery-1.jpg";
import galleryImage2 from "@/app/templates/vows/assets/gallery-2.jpg";
import Image from "next/image";
import styles from "@/styles/templates/vows.module.css";

type GalleryCategory = "all" | "before" | "during" | "after";

export const GallerySection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);
  const { scale: gallery1Scale } = useScrollScale();
  const { scale: gallery2Scale } = useScrollScale();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");

  // Gallery items with categories
  const galleryItems = [
    {
      id: 1,
      src: galleryImage1,
      alt: "Engagement ring ceremony",
      category: "before" as const,
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 2,
      src: galleryImage2,
      alt: "Wedding bouquet preparation",
      category: "before" as const,
      aspectRatio: "aspect-square",
    },
    {
      id: 3,
      src: galleryImage1,
      alt: "Wedding ceremony moment",
      category: "during" as const,
      aspectRatio: "aspect-[4/3]",
    },
    {
      id: 4,
      src: galleryImage2,
      alt: "First dance celebration",
      category: "during" as const,
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 5,
      src: galleryImage1,
      alt: "Reception party",
      category: "during" as const,
      aspectRatio: "aspect-square",
    },
    {
      id: 6,
      src: galleryImage2,
      alt: "Honeymoon memories",
      category: "after" as const,
      aspectRatio: "aspect-[4/3]",
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

  return (
    <section className={`py-32 ${styles.bgMuted}`}>
      <div className={styles.containerWedding}>
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className={`${styles.fontHeading} text-5xl md:text-6xl lg:text-7xl ${styles.textForeground} mb-6`}
          >
            Gallery
          </h2>
          <div className={`w-24 h-px ${styles.bgAccent} mx-auto mb-8`} />
          <p
            className={`${styles.fontBody} text-lg md:text-xl ${styles.textMuted} max-w-3xl mx-auto leading-relaxed`}
          >
            Capturing the beautiful moments of our journey together. Each photo tells a story of
            love, laughter, and the memories we&apos;ve created.
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
                  ? `${styles.bgAccent} text-white shadow-lg`
                  : `${styles.textMuted} hover:${styles.bgAccent} hover:text-white hover:shadow-md`
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Dynamic Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item, index) => (
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
              <div className="relative group overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300">
                <div className={`${item.aspectRatio} overflow-hidden`}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={600}
                    height={400}
                  />
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

        <div className="text-center mt-16">
          <button className="font-body text-sm uppercase tracking-widest bg-black text-white px-8 py-4 rounded-full hover:bg-black/80 transition-colors duration-300">
            View Full Gallery
          </button>
        </div>
      </div>
    </section>
  );
};
