"use client";

import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/app/templates/vows/hooks/useScrollAnimation";
import { LiveStreamHero } from "@/components/LiveStreamHero";
import styles from "@/styles/templates/vows.module.css";

interface HeroSectionProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  venue?: string;
  subtitle?: string;
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

export const HeroSection = (props: HeroSectionProps) => {
  // Debug: Log all received props
  console.log("VowsHero: Received props:", props);

  // Livestream state
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(true);

  // Check for active livestream
  useEffect(() => {
    console.log("VowsHero: useEffect triggered");
    const fetchActiveStream = async () => {
      console.log("VowsHero: Starting fetchActiveStream");
      try {
        const response = await fetch("/api/public/active-stream");
        console.log("VowsHero: API response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("VowsHero: Received stream data:", data);
          setActiveStream(data.activeStream);
        } else if (response.status === 401) {
          // Unauthorized (not logged in) - this is expected for public pages
          console.log("VowsHero: Unauthorized (expected for public pages)");
          setActiveStream(null);
        } else {
          // Other error statuses
          console.log("VowsHero: API error status:", response.status);
          setActiveStream(null);
        }
      } catch (error) {
        console.error("VowsHero: Error fetching active stream:", error);
        setActiveStream(null);
      } finally {
        console.log("VowsHero: Setting isLoadingStream to false");
        setIsLoadingStream(false);
      }
    };

    fetchActiveStream();
  }, []);

  // Extract data from props (prioritize direct props over weddingData object)
  const brideName = props.brideName || props.weddingData?.brideName || "Bride";
  const groomName = props.groomName || props.weddingData?.groomName || "Groom";
  const venue = props.venue || props.weddingData?.venue || "Wedding Venue";
  // const _description =
  //   props.description ||
  //   props.weddingData?.welcomeMessage ||
  //   "Join us as we celebrate our love story";
  const dateValue = props.weddingDate || props.weddingData?.weddingDate;

  console.log("VowsHero - Received dateValue:", dateValue);
  console.log("VowsHero - Type of dateValue:", typeof dateValue);

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
    console.log("VowsHero - Using already formatted date:", formattedDate);
  } else {
    // Date needs to be formatted
    const weddingDate = dateValue ? new Date(dateValue) : new Date();
    console.log("VowsHero - Parsed weddingDate:", weddingDate);
    console.log("VowsHero - Is valid date:", !isNaN(weddingDate.getTime()));

    formattedDate = weddingDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    console.log("VowsHero - Final formattedDate:", formattedDate);
  }

  const heroImage = props.heroImage || "/templates/vows/assets/hero-wedding.jpg";
  const { ref } = useScrollAnimation(0.3);

  // Handle scroll to story section
  const handleScrollToStory = () => {
    const storySection = document.getElementById("vows-story");
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
    return (
      <LiveStreamHero
        stream={activeStream}
        brideName={brideName}
        groomName={groomName}
        weddingDate={formattedDate}
        venue={venue}
        subtitle={props.subtitle}
        description={props.description}
        className={styles.heroSection}
        overlayClassName={styles.gradientHero}
        contentClassName={styles.heroContent}
      />
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-fixed ${styles.weddingHero}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${heroImage}')`,
        }}
      />

      {/* Content */}
      <div
        ref={ref}
        className="relative z-10 text-center text-white transition-all duration-1000 opacity-100 translate-y-0"
      >
        <div className={styles.containerWedding}>
          <h1
            className={`${styles.fontScript} text-6xl md:text-8xl lg:text-9xl mb-4 ${styles.animateFadeUp}`}
          >
            {brideName} & {groomName}
          </h1>
          <div className="h-px w-32 bg-white mx-auto mb-6 opacity-80" />
          <p className={`${styles.fontHeading} text-xl md:text-2xl lg:text-3xl mb-4 tracking-wide`}>
            {props.subtitle || "Together Forever"}
          </p>
          <p className={`${styles.fontBody} text-lg md:text-xl text-gray-200 mb-8`}>
            {formattedDate} • {venue}
          </p>
          <div className={styles.animatePulseGentle}>
            <button
              onClick={handleScrollToStory}
              className={`${styles.fontBody} text-sm md:text-base tracking-widest uppercase bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer`}
            >
              Our Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
