"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface OurStoryProps {
  title?: string;
  description?: string;
  storyItems?: Array<{
    title: string;
    text: string;
    image: string;
  }>;
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  gallery?: string[];
  guests?: Record<string, unknown>[];
  bankDetails?: Record<string, unknown>[];
  storyImage?: string;
  heroImage?: string;
  // Legacy support for ourStory prop
  ourStory?: {
    content?: string;
    imageUrl?: string;
  };
}

export default function OurStory(props: OurStoryProps) {
  // Extract data from props with fallbacks
  const title = props.title || "Our Love Story";
  const description =
    props.description || "Every love story is beautiful, but ours is our favorite";
  // Ensure storyItems is always an array
  let storyItems = props.storyItems;
  if (!Array.isArray(storyItems)) {
    storyItems = [
      {
        title: "How We Met",
        text:
          props.ourStory?.content ||
          "It was a rainy Tuesday at the local coffee shop. Sarah was reading her favorite book while Michael was working on his laptop. When Michael spilled his coffee, Sarah offered her napkins, and the rest is history.",
        image:
          props.storyImage ||
          props.ourStory?.imageUrl ||
          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        title: "First Date",
        text: "Our first official date was at the art museum downtown. We spent hours talking about our favorite pieces and discovered we both love impressionist paintings. The day ended with a sunset walk in the park.",
        image:
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        title: "The Proposal",
        text: "Michael proposed during a weekend getaway to the mountains. As we watched the sunrise from our cabin's deck, he got down on one knee and asked Sarah to be his adventure partner for life.",
        image:
          "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ];
  }

  // Ensure we have safe image sources
  const safeStoryItems = storyItems.map((item) => ({
    ...item,
    image:
      item.image && item.image.trim() !== ""
        ? item.image
        : "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
  }));

  const [isVisible, setIsVisible] = useState(false);
  const [imageScales, setImageScales] = useState<{ [key: number]: number }>({});
  const sectionRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
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

    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    Object.keys(imageRefs.current).forEach((key) => {
      const index = parseInt(key);
      const imageRef = imageRefs.current[index];
      if (imageRef) {
        const rect = imageRef.getBoundingClientRect();
        const scrollProgress = Math.max(
          0,
          Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
        );
        const scale = 1 + scrollProgress * 0.15;
        setImageScales((prev) => ({ ...prev, [index]: scale }));
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section
      id="luxe-story"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-sage-50 to-emerald-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 rounded-full bg-green-300 blur-2xl"></div>
        <div className="absolute bottom-48 right-20 w-56 h-56 rounded-full bg-emerald-300 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-20 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          <h2 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{description}</p>
        </div>

        <div className="space-y-24">
          {safeStoryItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-20`}
            >
              <div
                className={`lg:w-1/2 transition-all duration-1000 delay-${index * 200} transform ${isVisible ? "translate-x-0 opacity-100 scale-100" : `${index % 2 === 0 ? "translate-x-[-50px]" : "translate-x-[50px]"} opacity-0 scale-95`}`}
              >
                <div
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                  className="relative group"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    className="w-full h-80 object-cover rounded-2xl shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:shadow-3xl"
                    width={600}
                    height={400}
                    style={{ transform: `scale(${imageScales[index] || 1})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div
                className={`lg:w-1/2 text-center lg:text-left transition-all duration-1000 delay-${index * 200 + 100} transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              >
                <h3 className="text-xl md:text-4xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {item.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
