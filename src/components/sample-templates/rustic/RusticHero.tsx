"use client";

import { Heart, Calendar, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface WeddingData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  welcomeMessage: string;
  colorTheme?: string;
}

export default function RusticHero() {
  const { isDarkMode } = useTheme();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeddingData = async () => {
      try {
        const response = await fetch("/api/wedding-data");
        const data = await response.json();
        if (response.ok) setWeddingData(data);
      } catch (error) {
        console.error("Error fetching wedding data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeddingData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!weddingData) return <div>Error loading wedding data</div>;

  const formattedDate = new Date(weddingData.weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <main
      className={`max-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800"
          : "bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50"
      }`}
    >
      <section
        className="relative text-stone-800 overflow-hidden bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800"
        style={{ backgroundColor: weddingData.colorTheme }}
      >
        {/* Rustic texture overlay */}
        <div className="absolute inset-0 bg-[url('/rustic-texture.png')] opacity-10 mix-blend-overlay"></div>

        {/* Rustic decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-brown-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-brown-400/20 to-amber-600/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-300/20 to-orange-400/20 rounded-full blur-xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center pt-12">
            <div className="flex justify-center mb-8">
              <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-amber-300/30">
                <Heart className="h-16 w-16 text-amber-100" fill="currentColor" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-500 to-brown-600 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 tracking-tight text-amber-100">
              {weddingData.brideName} & {weddingData.groomName}
            </h1>

            <div className="flex items-center justify-center gap-8 text-lg mb-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-amber-300/20 text-amber-100">
                <Calendar className="h-5 w-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-amber-300/20 text-amber-100">
                <MapPin className="h-5 w-5" />
                <span>{weddingData.venue}</span>
              </div>
            </div>

            <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed text-amber-100">
              {weddingData.welcomeMessage}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}