"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "./components/ui/button";
import { LiveStreamHero } from "@/components/LiveStreamHero";
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
  // const _venue = props.venue || props.weddingData?.venue || "Venue";
  // const _description =
  //   props.description ||
  //   props.weddingData?.welcomeMessage ||
  //   "Two hearts, one beautiful journey. Join us as we celebrate our love and begin our forever together.";
  const dateValue = props.weddingDate || props.weddingData?.weddingDate || "Date";

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

  const weddingDate = isAlreadyFormatted
    ? dateValue
    : dateValue && dateValue !== "Date"
      ? new Date(dateValue).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Date";
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
          <Heart
            className={`${styles.heroIcon} w-16 h-16 mx-auto mb-8 text-primary-foreground animate-gentle-pulse`}
          />

          <h1
            className={`${styles.heroTitle} font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-primary-foreground mb-6 leading-tight`}
          >
            {brideName} & {groomName}
          </h1>

          <div
            className={`${styles.heroDateContainer} flex items-center justify-center gap-4 mb-8`}
          >
            <div className={`${styles.heroDateLine} h-px bg-primary-foreground/50 w-16`}></div>
            <p
              className={`${styles.heroDate} font-heading text-2xl md:text-3xl text-primary-foreground/90 font-medium`}
            >
              {weddingDate}
            </p>
            <div className={`${styles.heroDateLine} h-px bg-primary-foreground/50 w-16`}></div>
          </div>

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
              className={`${styles.heroButtonOutline} text-lg px-8 py-4 h-auto font-medium border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary`}
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
          <Heart className={`${styles.floatingHeartIcon} w-8 h-8 text-primary-foreground`} />
        </div>
        <div
          className={`${styles.floatingHeart} absolute bottom-32 right-16 opacity-20 ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "1s" }}
        >
          <Heart className={`${styles.floatingHeartIcon} w-6 h-6 text-primary-foreground`} />
        </div>
        <div
          className={`${styles.floatingHeart} absolute top-40 right-20 opacity-25 ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "2s" }}
        >
          <Heart className={`${styles.floatingHeartIcon} w-10 h-10 text-primary-foreground`} />
        </div>
      </div>
    </section>
  );
};

export default WeddingHero;
