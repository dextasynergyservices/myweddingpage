"use client";

import { useState, useEffect } from "react";
import { Heart, MapPin, Calendar } from "lucide-react";
import { Button } from "./components/ui/button";
import { LiveStreamHero } from "@/components/LiveStreamHero";
import { formatWeddingDate } from "@/lib/dateUtils";
// Hero background image - using public path
import styles from "@/styles/templates/bloom.module.css";

interface WeddingHeroProps {
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

const WeddingHero = (props: WeddingHeroProps) => {
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
  const weddingDate = formatWeddingDate(dateValue);
  const heroImage = props.heroImage || "/templates/bloom/assets/wedding-hero.jpg";

  const handleScrollToStory = () => {
    const storySection = document.getElementById("bloom-story");
    if (storySection) {
      storySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToGallery = () => {
    const gallerySection = document.getElementById("bloom-gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
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
        weddingDate={weddingDate}
        venue={venue}
        subtitle="Two hearts, one beautiful journey"
        description={props.description}
        className={styles.heroSection}
        overlayClassName={styles.gradientHero}
        contentClassName={styles.heroContent}
      />
    );
  }

  return (
    <section
      className={`${styles.heroSection} relative min-h-screen flex items-center justify-center overflow-hidden`}
    >
      {/* Background Image */}
      <div
        className={`${styles.heroBackground} absolute inset-0 bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className={`${styles.gradientHero} absolute inset-0`}></div>
      </div>

      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className={`${styles.heroContent} relative z-10 text-center px-4 max-w-4xl mx-auto`}>
        <div className={`${styles.animateFadeInUp}`}>
          <h1
            className={`${styles.heroTitle} ${styles.textWhite} text-white font-heading text-3xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight`}
          >
            {brideName} & {groomName}
          </h1>

          {/* Date - icon above text on mobile */}
          <div
            className={`${styles.heroDateContainer} flex items-center justify-center gap-4 mb-4`}
          >
            <div className={`${styles.heroDateLine} h-px w-16`}></div>

            {/* Mobile: Icon above text */}
            <div className="flex flex-col items-center md:hidden">
              <Calendar className="w-5 h-5 text-white mb-2" />
              <p
                className={`${styles.heroDate} ${styles.textWhite} text-white font-heading text-xl md:text-xl lg:text-4xl xl:text-5xl sm:text-xl font-medium`}
              >
                {weddingDate}
              </p>
            </div>

            {/* Desktop: Icon beside text */}
            <div className="hidden md:flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <p
                className={`${styles.heroDate} ${styles.textWhite} text-white font-heading text-2xl md:text-3xl font-medium`}
              >
                {weddingDate}
              </p>
            </div>

            <div className={`${styles.heroDateLine} h-px w-16`}></div>
          </div>

          {/* Venue - icon above text on mobile for long venues */}
          {venue && (
            <div className="flex flex-col items-center justify-center mb-8 text-white max-w-full px-4">
              <MapPin className="w-6 h-6 mb-2 md:hidden" />
              <div className="hidden md:flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                <p className="font-heading text-xl md:text-2xl font-medium text-center md:text-left break-words max-w-full">
                  {venue}
                </p>
              </div>
              <p className="md:hidden font-heading text-xl md:text-2xl font-medium text-center break-words max-w-full">
                {venue}
              </p>
            </div>
          )}

          {/* <p
            className={`${styles.heroDescription} text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed`}
          >
            {description}
          </p> */}

          <div
            className={`${styles.heroButtonContainer} flex flex-col sm:flex-row gap-4 justify-center`}
          >
            <Button
              variant="elegant"
              size="lg"
              className={`${styles.heroButton} bg-white text-black hover:text-red-500 transition-colors duration-300 text-lg px-8 py-4 h-auto font-medium`}
              onClick={handleScrollToStory}
            >
              View Our Story
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`${styles.heroButtonOutline} ${styles.textWhite} text-white border-white text-lg px-8 py-4 h-auto font-medium hover:bg-white hover:text-primary`}
              onClick={handleScrollToGallery}
            >
              Gallery
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div
          className={`${styles.floatingHeart} absolute top-20 left-10 opacity-30 ${styles.animateRomanticFloat}`}
        >
          <Heart className={`${styles.floatingHeartIcon} ${styles.textWhite} text-white w-8 h-8`} />
        </div>
        <div
          className={`${styles.floatingHeart} absolute bottom-32 right-16 opacity-20 ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "1s" }}
        >
          <Heart className={`${styles.floatingHeartIcon} ${styles.textWhite} text-white w-6 h-6`} />
        </div>
        <div
          className={`${styles.floatingHeart} absolute top-40 right-20 opacity-25 ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "2s" }}
        >
          <Heart
            className={`${styles.floatingHeartIcon} ${styles.textWhite} text-white w-10 h-10`}
          />
        </div>
      </div>
    </section>
  );
};

export default WeddingHero;
