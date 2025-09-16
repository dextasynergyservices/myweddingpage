"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Default story images using Cloudinary URLs
const defaultCoupleStory1 =
  "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800";
const defaultCoupleStory2 =
  "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800";

interface OurStoryProps {
  title?: string;
  description?: string;
  stories?: Array<{
    title: string;
    date: string;
    story: string;
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

const OurStory: React.FC<OurStoryProps> = (props) => {
  // Debug logging to see what props are being received
  console.log("EleganceStory - Received props:", props);
  console.log("EleganceStory - stories prop:", props.stories);
  console.log("EleganceStory - storyImage prop:", props.storyImage);

  // Extract data from props with fallbacks
  const title = props.title || "Our Love Story";
  const description =
    props.description ||
    "Every love story is beautiful, but ours is our favorite. Here's how it all began...";

  // Ensure stories is always an array
  let stories = props.stories;
  if (!Array.isArray(stories)) {
    stories = [
      {
        title: "How We Met",
        date: "September 2019",
        story:
          props.ourStory?.content ||
          "It was a beautiful autumn day when our paths first crossed at a local coffee shop. James was reading a book about photography, and Emma couldn't help but notice the stunning sunset photo on the cover. A simple 'That's a beautiful shot' sparked a conversation that lasted for hours.",
        image: props.storyImage || props.ourStory?.imageUrl || defaultCoupleStory1,
      },
      {
        title: "The Proposal",
        date: "December 2023",
        story:
          "On a snowy winter evening, James recreated our first date at the same coffee shop where we met. As Emma sipped her favorite lavender latte, James got down on one knee among the twinkling fairy lights, asking her to be his forever adventure partner.",
        image: defaultCoupleStory2,
      },
    ];
  }

  // Ensure we have safe image sources
  const safeStories = stories.map((story) => ({
    ...story,
    image:
      typeof story.image === "string"
        ? story.image && story.image.trim() !== ""
          ? story.image
          : defaultCoupleStory1
        : story.image,
  }));
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="elegance-story"
      className="py-24 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100"
    >
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-800 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-serif md:text-5xl text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          <p className="font-sans text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
        </div>

        <div className={`grid md:grid-cols-2 gap-12 max-w-6xl mx-auto`}>
          {safeStories.map((story, index) => (
            <div
              key={index}
              className={`overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative h-80 overflow-hidden group">
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  src={typeof story.image === "string" ? story.image : (story.image as any).src}
                  alt={story.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{
                    transform: `scale(${1 + scrollY * 0.0002})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-pink-600/20 group-hover:opacity-30 transition-opacity duration-300" />
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl font-semibold text-rose-600">{story.title}</h3>
                  <span className="font-sans text-sm font-medium text-rose-500 bg-rose-100 px-3 py-1 rounded-full">
                    {story.date}
                  </span>
                </div>

                <p className="font-sans text-gray-600 leading-relaxed">{story.story}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurStory;
