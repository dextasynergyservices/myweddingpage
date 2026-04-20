"use client";

import { Heart, Calendar, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface WeddingData {
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string;
  welcomeMessage: string;
  template?: {
    name: string;
    thumbnail_url: string;
  };
  colorTheme?: string;
}

interface WeddingPageHeroProps {
  isDemoMode?: boolean;
}

export default function WeddingPageHero({ isDemoMode = false }: WeddingPageHeroProps) {
  const { isDarkMode } = useTheme();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeddingData = async () => {
      try {
        const response = await fetch("/api/user/wedding-data");
        const data = await response.json();

        if (response.ok) {
          setWeddingData(data);
        }
      } catch (error) {
        console.error("Error fetching wedding data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeddingData();
  }, []);

  if (loading || !weddingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <main
      className={`max-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <section
        className={`relative text-white overflow-hidden ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900"
            : "bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center pt-12">
            <div className="flex justify-center mb-8">
              <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
                {isDemoMode && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Demo
                  </div>
                )}
                <Heart className="h-16 w-16 text-white" fill="currentColor" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
              {weddingData.brideName} & {weddingData.groomName}
            </h1>

            <div className="flex items-center justify-center gap-8 text-lg mb-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20">
                <Calendar className="h-5 w-5" />
                <span>{weddingData.weddingDate}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20">
                <MapPin className="h-5 w-5" />
                <span>{weddingData.venue}</span>
              </div>
            </div>

            <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
              {weddingData.welcomeMessage}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
