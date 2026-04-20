"use client";

import React, { useEffect, useState } from "react";
import { Heart, Calendar, MapPin } from "lucide-react";
import { LiveStreamHero } from "@/components/LiveStreamHero";
import weddingHero from "./assets/wedding-hero.jpg";
import styles from "@/styles/templates/elegance.module.css";
import Image from "next/image";
import { formatWeddingDate } from "@/lib/dateUtils";

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

interface Stream {
  id: string;
  name: string;
  youtubeUrl: string;
  youtubeId: string;
  camera: string;
  quality: string;
  isActive: boolean;
  viewerCount: number;
  createdAt: string;
  updatedAt: string;
}

const Hero: React.FC<HeroProps> = (props) => {
  // Livestream state
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(true);

  // Check for active livestream
  useEffect(() => {
    const fetchActiveStream = async () => {
      try {
        const response = await fetch("/api/public/active-stream");
        if (response.ok) {
          const data = await response.json();
          setActiveStream(data.activeStream);
        } else if (response.status === 401) {
          // Unauthorized (not logged in) - this is expected for public pages
          setActiveStream(null);
        }
      } catch (error) {
        console.error("Error fetching active stream:", error);
        setActiveStream(null);
      } finally {
        setIsLoadingStream(false);
      }
    };

    fetchActiveStream();
  }, []);

  // Extract data from props (prioritize direct props over weddingData object)
  const brideName = props.brideName || props.weddingData?.brideName || "Bride";
  const groomName = props.groomName || props.weddingData?.groomName || "Groom";
  const venue = props.venue || props.weddingData?.venue || "";
  const dateValue = props.weddingDate || props.weddingData?.weddingDate;

  // Use timezone-agnostic date formatting
  const formattedDate = formatWeddingDate(dateValue);

  const heroImage = props.heroImage || weddingHero.src;
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Disable scale effect on mobile to prevent zooming/cropping issues
  const imageScale = isMobile ? 1 : 1 + scrollY * 0.0005;
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

  // Show loading state while checking for livestream
  if (isLoadingStream) {
    return (
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  // If there's an active livestream, show LiveStreamHero instead
  if (activeStream) {
    const venue = props.venue || props.weddingData?.venue || "Wedding Venue";
    return (
      <LiveStreamHero
        stream={activeStream}
        brideName={brideName}
        groomName={groomName}
        weddingDate={formattedDate}
        venue={venue}
        subtitle="Timeless Elegance"
        description={props.description}
        className={`${styles.relative} ${styles.minHScreen} ${styles.bgGradientSection}`}
        overlayClassName="bg-black/40"
        contentClassName="text-center"
      />
    );
  }

  return (
    <section
      className={`${styles.relative} ${styles.minHScreen} ${styles.bgGradientSection} ${styles.overflowHidden} ${styles.avoidTopSpace}`}
    >
      <div
        className={`${styles.container} ${styles.mxAuto} ${styles.px4} ${styles.flex} ${styles.itemsCenter} min-h-screen py-20 md:py-24`}
      >
        <div
          className={`${styles.flex} ${styles.flexCol} ${styles.lgGrid} ${styles.lgGridCols2} ${styles.gap8} ${styles.lgGap12} ${styles.itemsCenter} ${styles.wFull}`}
        >
          {/* Content - First on mobile, first on desktop */}
          <div
            className={`${styles.wFull} ${styles.order1} ${styles.lgOrder1} mb-8 lg:mb-0 flex flex-col items-center lg:items-start`}
          >
            <div
              className={`${styles.animateFadeInUp} w-full flex flex-col items-center lg:items-start`}
            >
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-4 sm:mb-6 animate-float text-amber-500" />

              <h1
                className={`${styles.fontDisplay} text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight text-gray-900 text-center lg:text-left`}
              >
                {brideName} <span className="text-amber-500">&</span>{" "}
                {groomName}
              </h1>

              <div
                className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.lgJustifyStart} ${styles.mb4} ${styles.lgMb6} text-amber-500`}
              >
                <Calendar
                  className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 ${styles.mr2}`}
                />
                <p
                  className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl ${styles.fontLight} ${styles.trackingWider} text-amber-500`}
                >
                  {formattedDate}
                </p>
              </div>

              {/* Venue */}
              {venue && (
                <div
                  className={`flex flex-col items-center lg:flex-row lg:items-center justify-center lg:justify-start mb-4 lg:mb-6 text-amber-500 max-w-full px-4 sm:px-0`}
                >
                  <MapPin
                    className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-2 lg:mb-0 lg:mr-2`}
                  />
                  <p
                    className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light tracking-wider text-amber-500 text-center lg:text-left break-words max-w-full`}
                  >
                    {venue}
                  </p>
                </div>
              )}

              {/* <p
                className={`${styles.textLg} ${styles.mdTextXl} ${styles.mb12} ${styles.maxW2xl} ${styles.mxAuto} ${styles.lgMx0} ${styles.leadingRelaxed} ${styles.textMutedForeground}`}
              >
                {description}
              </p> */}

              <div
                className={`pb-32 flex flex-row items-center justify-center lg:justify-start gap-4 lg:gap-6 w-full`}
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

          {/* Image - Second on mobile, second on desktop */}
          <div
            className={`${styles.relative} ${styles.wFull} ${styles.order2} ${styles.lgOrder2} flex justify-center items-center`}
          >
            <div
              className={`${styles.relative} ${styles.overflowHidden} ${styles.rounded3xl} ${styles.shadowElevated} min-h-[600px] sm:min-h-[550px] aspect-[3/4] sm:aspect-[4/5] md:aspect-[5/6] lg:aspect-[5/6] w-full max-w-full`}
            >
              <Image
                src={heroImage}
                alt={`${brideName} and ${groomName} wedding photo`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover object-center transition-transform duration-300 ease-out"
                style={{
                  transform: `scale(${imageScale})`,
                  opacity: imageOpacity,
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              <div
                className={`${styles.absolute} ${styles.inset0} ${styles.bgGradientRomantic} ${styles.opacity20}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
