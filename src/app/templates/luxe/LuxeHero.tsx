"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import styles from "@/styles/templates/luxe.module.css";
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

export default function Hero(props: HeroProps) {
  // Extract data from props (prioritize direct props over weddingData object)
  const brideName = props.brideName || props.weddingData?.brideName || "Bride";
  const groomName = props.groomName || props.weddingData?.groomName || "Groom";
  const venue = props.venue || props.weddingData?.venue || "Venue";
  // const _description =
  //   props.description ||
  //   props.weddingData?.welcomeMessage ||
  //   "Join us as we celebrate our love story and begin our journey together as one.";
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
  const heroImage =
    props.heroImage ||
    "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800";
  const [isVisible, setIsVisible] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        setImageScale(1 + rate * 0.001);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleScrollToStory = () => {
    const storySection = document.getElementById("luxe-story");
    if (storySection) {
      storySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-sage-50 to-emerald-50"
    >
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-rose-200/30 rounded-lg animate-pulse" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-sage-200/30 rounded-lg animate-bounce" />
      <div
        className="absolute bottom-32 left-1/4 w-12 h-12 bg-orange-200/30 rounded-lg animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Content */}
      <div
        className={`relative z-10 text-center transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Couple Image */}
          <div
            className={`mb-8 transition-all duration-1000 transform ${isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
          >
            <div ref={imageRef} className="relative inline-block">
              <div className="w-72 h-72 mx-auto rounded-lg overflow-hidden shadow-2xl ring-8 ring-rose-200/60 relative group">
                <Image
                  src={heroImage}
                  alt={`${brideName} & ${groomName}`}
                  width={288}
                  height={288}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                  style={{ transform: `scale(${imageScale})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white p-3 rounded-lg shadow-lg animate-bounce">
                <Heart className="w-6 h-6" fill="currentColor" />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-sage-400 to-emerald-500 text-white p-2 rounded-lg shadow-lg animate-pulse">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
            </div>
          </div>

          <h1
            className={`font-['Dancing_Script'] text-6xl md:text-7xl lg:text-8xl mb-4 text-rose-800 ${styles.animateFadeIn}`}
          >
            {brideName} & {groomName}
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-rose-300 to-sage-300 mx-auto mb-6 opacity-80" />
          <p className="font-['Playfair_Display'] text-xl md:text-2xl lg:text-5xl mb-4 tracking-wide text-rose-700">
            Together Forever
          </p>
          <p className="font-['Inter'] text-lg md:text-xl text-rose-600 mb-8">
            {weddingDate} • {venue}
          </p>
          <div className="animate-pulse">
            <button
              className="font-['Inter'] text-sm md:text-lg tracking-widest uppercase bg-white/20 backdrop-blur-sm border border-rose-200/30 px-8 py-3 rounded-lg hover:bg-white/30 transition-all duration-1000 text-rose-700"
              onClick={handleScrollToStory}
            >
              View Our Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
