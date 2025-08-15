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

export default function ModernHero() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-500"></div>
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
      <section className="relative text-slate-900 overflow-hidden bg-white">
        {/* Modern geometric pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%),linear-gradient(135deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%)] bg-[length:40px_40px] opacity-10"></div>

        {/* Modern decorative elements */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 blur-3xl opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center pt-12">
            <div className="flex justify-center mb-8">
              <div className="relative p-6 bg-white rounded-full shadow-lg border border-slate-200">
                <Heart className="h-16 w-16 text-rose-500" fill="currentColor" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-sans font-light mb-6 tracking-tighter text-slate-900">
              {weddingData.brideName} <span className="text-slate-400">&</span> {weddingData.groomName}
            </h1>

            <div className="flex items-center justify-center gap-8 text-lg mb-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-700">
                <Calendar className="h-5 w-5 text-rose-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-700">
                <MapPin className="h-5 w-5 text-rose-500" />
                <span>{weddingData.venue}</span>
              </div>
            </div>

            <p className="text-xl opacity-80 max-w-2xl mx-auto font-light leading-relaxed text-slate-600">
              {weddingData.welcomeMessage}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}