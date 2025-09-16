"use client";

import React, { useEffect, useState } from "react";
import { Heart, Calendar } from "lucide-react";
import weddingHero from "./assets/wedding-hero.jpg";
import styles from "@/styles/templates/elegance.module.css";
import Image from "next/image";

interface HeroProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  venue?: string;
  description?: string;
  heroImage?: string;
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  gallery?: string[];
  guests?: Record<string, unknown>[];
  bankDetails?: Record<string, unknown>[];
  // Legacy support for weddingData prop
  weddingData?: {
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    venue?: string;
    welcomeMessage?: string;
  };
}

const Hero: React.FC<HeroProps> = (props) => {
  // Extract data from props (prioritize direct props over weddingData object)
  const brideName = props.brideName || props.weddingData?.brideName || "Bride";
  const groomName = props.groomName || props.weddingData?.groomName || "Groom";
  // const _venue = props.venue || props.weddingData?.venue || "Wedding Venue";
  // const _description =
  //   props.description ||
  //   props.weddingData?.welcomeMessage ||
  //   "Join us as we celebrate our love story and begin our journey together as one.";
  const dateValue = props.weddingDate || props.weddingData?.weddingDate;

  // Check if the date is already formatted (contains month name like "October")
  const isAlreadyFormatted =
    typeof dateValue === "string" &&
    (dateValue.includes("January") ||
      dateValue.includes("February") ||
      dateValue.includes("March") ||
      dateValue.includes("April") ||
      dateValue.includes("May") ||
      dateValue.includes("June") ||
      dateValue.includes("July") ||
      dateValue.includes("August") ||
      dateValue.includes("September") ||
      dateValue.includes("October") ||
      dateValue.includes("November") ||
      dateValue.includes("December"));

  let formattedDate;
  if (isAlreadyFormatted) {
    // Date is already formatted, use it directly
    formattedDate = dateValue;
  } else {
    // Date needs to be formatted
    const weddingDate = dateValue ? new Date(dateValue) : new Date();
    formattedDate = weddingDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const heroImage = props.heroImage || weddingHero.src;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const imageScale = 1 + scrollY * 0.0005;
  const imageOpacity = Math.max(0.3, 1 - scrollY * 0.001);

  const handleScrollToGallery = () => {
    const gallerySection = document.getElementById("elegance-gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToStory = () => {
    const storySection = document.getElementById("elegance-story");
    if (storySection) {
      storySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className={`${styles.relative} ${styles.minHScreen} ${styles.bgGradientSection} ${styles.overflowHidden}`}
    >
      <div
        className={`${styles.container} ${styles.mxAuto} ${styles.px4} ${styles.hScreen} ${styles.flex} ${styles.itemsCenter}`}
      >
        <div
          className={`${styles.flex} ${styles.flexCol} ${styles.lgGrid} ${styles.lgGridCols2} ${styles.gap8} ${styles.lgGap12} ${styles.itemsCenter} ${styles.wFull} relative top-36`}
        >
          {/* Image - First on mobile, second on desktop */}
          <div className={`${styles.relative} ${styles.wFull} ${styles.order1} ${styles.lgOrder2}`}>
            <div
              className={`${styles.relative} ${styles.overflowHidden} ${styles.rounded3xl} ${styles.shadowElevated}`}
            >
              <Image
                src={heroImage}
                alt={`${brideName} and ${groomName} wedding photo`}
                width={800}
                height={600}
                className={`${styles.wFull} ${styles.h300px} ${styles.smH400px} ${styles.lgH600px} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration300} ${styles.easeOut}`}
                style={{
                  transform: `scale(${imageScale})`,
                  opacity: imageOpacity,
                }}
              />
              <div
                className={`${styles.absolute} ${styles.inset0} ${styles.bgGradientRomantic} ${styles.opacity20}`}
              />
            </div>
          </div>

          {/* Content - Second on mobile, first on desktop */}
          <div
            className={`${styles.textCenter} ${styles.lgTextLeft} ${styles.textForeground} ${styles.wFull} ${styles.order2} ${styles.lgOrder1} ${styles.pt16} ${styles.lgPt0}`}
          >
            <div className={styles.animateFadeInUp}>
              <Heart className="w-12 h-12 mx-auto lg:mx-0 mb-6 animate-float text-amber-500" />

              <h1
                className={`${styles.fontDisplay} text-2xl md:text-6xl lg:text-7xl font-bold mb-4 leading-none text-gray-900`}
              >
                {brideName} <span className="text-amber-500">&</span> {groomName}
              </h1>

              <div
                className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.lgJustifyStart} ${styles.mb4} ${styles.lgMb6} text-amber-500`}
              >
                <Calendar className={`w-6 h-6 md:w4 md:h4 lg:w4 lg:h4 ${styles.mr2}`} />
                <p
                  className={`${styles.textSm} ${styles.smTextBase} ${styles.lgTextXl} ${styles.fontLight} ${styles.trackingWider} text-amber-500`}
                >
                  {formattedDate}
                </p>
              </div>

              {/* <p
                className={`${styles.textLg} ${styles.mdTextXl} ${styles.mb12} ${styles.maxW2xl} ${styles.mxAuto} ${styles.lgMx0} ${styles.leadingRelaxed} ${styles.textMutedForeground}`}
              >
                {description}
              </p> */}

              <div
                className={`${styles.flex} ${styles.flexRow} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.lgJustifyStart} ${styles.gap4} ${styles.lgGap6}`}
              >
                <button
                  className="bg-rose-400 text-white px-6 py-2 lg:px-8 lg:py-3 text-sm lg:text-base rounded-lg font-semibold transition-all duration-300 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                  onClick={handleScrollToGallery}
                >
                  View Gallery
                </button>
                <button
                  className="border-2 border-rose-400 text-rose-400 px-6 py-2 lg:px-8 lg:py-3 text-sm lg:text-base rounded-lg font-semibold transition-all duration-300 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                  onClick={handleScrollToStory}
                >
                  View Our Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
