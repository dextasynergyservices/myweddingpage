"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Gift, Check } from "lucide-react";
import Image from "next/image";

export default function GiftRegistry() {
  const [isVisible, setIsVisible] = useState(false);
  const [purchasedItems] = useState<number[]>([]);
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
      { threshold: 0.1 }
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
        const scale = 1 + scrollProgress * 0.1;
        setImageScales((prev) => ({ ...prev, [index]: scale }));
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const gifts = [
    {
      name: "Stand Mixer",
      description: "Professional-grade kitchen mixer for baking adventures",
      price: "₦299,000",
      image:
        "https://images.pexels.com/photos/4226876/pexels-photo-4226876.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Dining Table Set",
      description: "Beautiful oak dining table with 6 chairs",
      price: "₦899,000",
      image:
        "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Coffee Machine",
      description: "Espresso machine for perfect morning coffee",
      price: "₦449,000",
      image:
        "https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Bedding Set",
      description: "Luxury Egyptian cotton sheets and comforter",
      price: "₦199,000",
      image:
        "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Garden Tool Set",
      description: "Complete set for our new garden",
      price: "₦129,000",
      image:
        "https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Wine Glasses",
      description: "Crystal wine glasses set of 8",
      price: "₦89,000",
      image:
        "https://images.pexels.com/photos/1407309/pexels-photo-1407309.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 left-16 w-44 h-44 rounded-full bg-orange-300 blur-2xl"></div>
        <div className="absolute bottom-40 right-24 w-52 h-52 rounded-full bg-amber-300 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          <h2 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Gift Registry
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Help us start our new journey together with these thoughtful gifts
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Gift className="w-5 h-5" />
            <span>
              Your presence is the greatest gift, but if you&apos;d like to give something
              special...
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gifts.map((gift, index) => (
            <div
              key={index}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 overflow-hidden ${
                isVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-12 opacity-0 scale-90"
              } ${purchasedItems.includes(index) ? "ring-2 ring-green-500" : ""}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative">
                <div
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                >
                  <Image
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-48 object-cover transition-transform duration-300"
                    style={{ transform: `scale(${imageScales[index] || 1})` }}
                    width={600}
                    height={400}
                  />
                </div>
                {purchasedItems.includes(index) && (
                  <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{gift.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{gift.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-600">{gift.price}</span>
                </div>

                <button className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-900">
                  Purchase Gift
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-16 transition-all duration-1000 delay-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Prefer to Give Cash?</h3>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105">
              Gift Cash
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
