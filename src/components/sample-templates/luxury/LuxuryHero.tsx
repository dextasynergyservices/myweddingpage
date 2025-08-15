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

export default function LuxuryHero() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
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
    <main className="max-h-screen transition-colors duration-300">
      <section className="relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Luxury texture overlay */}
        <div className="absolute inset-0 bg-[url('/luxury-texture.png')] opacity-20 mix-blend-overlay"></div>

        {/* Luxury decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-gold-400/10 to-gold-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-gold-500/10 to-amber-600/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-gold-500/10 rounded-full blur-xl"></div>

        {/* Gold foil accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center pt-12">
            <div className="flex justify-center mb-8">
              <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-full border border-gold-400/30 shadow-lg">
                <Heart className="h-20 w-20 text-gold-400" fill="currentColor" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-gold-500 to-amber-600 rounded-full animate-pulse shadow-gold"></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 tracking-tight text-gold-100">
              {weddingData.brideName} <span className="text-gold-400">&</span> {weddingData.groomName}
            </h1>

            <div className="flex items-center justify-center gap-8 text-xl mb-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-gold-400/20 text-gold-100">
                <Calendar className="h-6 w-6 text-gold-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-gold-400/20 text-gold-100">
                <MapPin className="h-6 w-6 text-gold-400" />
                <span>{weddingData.venue}</span>
              </div>
            </div>

            <p className="text-2xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed text-gold-200">
              {weddingData.welcomeMessage}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}