"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

type GalleryCategory = "all" | "before" | "during" | "after";

interface GalleryProps {
  gallery?: Array<{
    id: string;
    url: string;
    type: "PHOTO" | "VIDEO";
    category: "before" | "during" | "after";
    createdAt?: string;
  }>;
  images?: string[];
  videos?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    category: "before" | "during" | "after";
  }>;
  title?: string;
  description?: string;
}

export default function Gallery({
  gallery = [],
  images = [],
  videos = [],
  title = "Our Gallery",
  description = "Capturing the beautiful moments of our journey together",
}: GalleryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    src: string;
    alt: string;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Create gallery items from props
  const mediaItems = [
    // Add images from gallery prop
    ...gallery.map((item) => ({
      id: item.id,
      type: item.type === "PHOTO" ? "image" : "video",
      src: item.url,
      alt: `Gallery ${item.id}`,
      category: item.category,
    })),
    // Add images from images prop (fallback)
    ...images.map((image, index) => ({
      id: `image-${index}`,
      type: "image",
      src: image,
      alt: `Gallery Image ${index + 1}`,
      category: "during" as const,
    })),
    // Add videos from videos prop (fallback)
    ...videos.map((video) => ({
      id: video.id,
      type: "video",
      src: video.thumbnail,
      alt: video.title,
      category: video.category,
    })),
  ];

  // If no gallery data provided, use default fallback
  const defaultMediaItems = [
    {
      id: "default-1",
      type: "image",
      src: "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Engagement photo 1",
      category: "before" as const,
    },
  ];

  const finalMediaItems = mediaItems.length > 0 ? mediaItems : defaultMediaItems;

  // Filter items based on active category
  const filteredItems =
    activeCategory === "all"
      ? finalMediaItems
      : finalMediaItems.filter((item) => item.category === activeCategory);

  const categories = [
    { id: "all", label: "All" },
    { id: "before", label: "Before Wedding" },
    { id: "during", label: "During Wedding" },
    { id: "after", label: "After Wedding" },
  ];

  // const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
  //   setVideoRefs(prev => ({ ...prev, [index]: el }));
  // };

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-purple-300 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-36 h-36 rounded-full bg-pink-300 blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          <h2 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as GalleryCategory)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 hover:text-white hover:shadow-md"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`relative group cursor-pointer transition-all duration-700 transform hover:scale-105 ${
                isVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-12 opacity-0 scale-90"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() =>
                setSelectedMedia({
                  type: item.type as "image" | "video",
                  src: item.src,
                  alt: item.alt,
                })
              }
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                {item.type === "video" ? (
                  <video
                    // ref={setVideoRef(index)}
                    src={item.src}
                    poster={item.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    width={600}
                    height={400}
                  />
                )}

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

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  {item.type === "video" ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-purple-600" fill="currentColor" />
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <ImageIcon className="w-8 h-8 text-purple-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <div className="relative max-w-4xl w-full">
              {selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.src}
                  controls
                  autoPlay
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Image
                  src={selectedMedia.src}
                  alt={selectedMedia.alt}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
