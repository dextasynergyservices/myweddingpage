"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Gift, Check } from "lucide-react";
import Image from "next/image";

interface GiftRegistryProps {
  title?: string;
  description?: string;
  gifts?: Array<{
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    purchased?: boolean;
  }>;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
}

export default function GiftRegistry({
  title = "Gift Registry",
  description = "Your presence at our wedding is the greatest gift of all. If you'd like to help us start our new life together, here are some items we'd love to have in our home.",
  gifts = [
    {
      id: 1,
      name: "Kitchen Stand Mixer",
      description: "Professional-grade mixer for our baking adventures together",
      price: "$350",
      image: "https://images.unsplash.com/photo-1586909194449-5a4b03a1c5d8?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 2,
      name: "Fine China Dinner Set",
      description: "Elegant dinnerware for hosting family and friends",
      price: "$280",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      purchased: true,
    },
    {
      id: 3,
      name: "Cozy Throw Blankets",
      description: "Soft blankets for movie nights and lazy Sundays",
      price: "$120",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 4,
      name: "Coffee Table Books",
      description: "Beautiful photography books for our living room",
      price: "$120",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 5,
      name: "Garden Tool Set",
      description: "Premium tools for our future garden together",
      price: "$150",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 6,
      name: "Wine Glass Collection",
      description: "Crystal glasses for celebrating special moments",
      price: "$200",
      image: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?w=400&h=300&fit=crop",
      purchased: false,
    },
  ],
  bankDetails = {
    bankName: "Access Bank",
    accountNumber: "1234567890",
    accountName: "John & Jane Doe",
  },
}: GiftRegistryProps) {
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
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">{description}</p>
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
