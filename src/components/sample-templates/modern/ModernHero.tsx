"use client";

import { Heart, Calendar, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface WeddingData {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  venue?: string;
  welcomeMessage?: string;
  colorTheme?: string;
}

interface ModernHeroProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  venue?: string;
  welcomeMessage?: string;
  colorTheme?: string;
  heroImage?: string;
  // Legacy support for weddingData prop
  weddingData?: WeddingData;
}

export default function ModernHero(props: ModernHeroProps) {
  const {} = useTheme();

  // Extract data from props (prioritize direct props over weddingData object)
  const brideName = props.brideName || props.weddingData?.brideName || "Bride";
  const groomName = props.groomName || props.weddingData?.groomName || "Groom";
  const venue = props.venue || props.weddingData?.venue || "Wedding Venue";
  const welcomeMessage =
    props.welcomeMessage ||
    props.weddingData?.welcomeMessage ||
    "Welcome to our wedding celebration";
  const dateValue = props.weddingDate || props.weddingData?.weddingDate;

  const weddingDate = dateValue ? new Date(dateValue) : new Date();

  const formattedDate = weddingDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="max-h-screen transition-colors duration-300">
      <section
        className="relative text-white overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: props.heroImage
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${props.heroImage})`
            : undefined,
          backgroundColor: props.heroImage ? undefined : "white",
        }}
      >
        {/* Modern geometric pattern - only show if no hero image */}
        {!props.heroImage && (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%),linear-gradient(135deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%)] bg-[length:40px_40px] opacity-10"></div>
        )}

        {/* Modern decorative elements - only show if no hero image */}
        {!props.heroImage && (
          <>
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 blur-3xl opacity-40"></div>
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div
            className={`text-center pt-12 ${props.heroImage ? "text-white" : "text-slate-900"}`}
          >
            <div className="flex justify-center mb-8">
              <div className="relative p-6 bg-white rounded-full shadow-lg border border-slate-200">
                <Heart
                  className="h-16 w-16 text-rose-500"
                  fill="currentColor"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-sans font-light mb-6 tracking-tighter text-slate-900">
              {brideName} <span className="text-slate-400">&</span> {groomName}
            </h1>

            <div className="flex items-center justify-center gap-8 text-lg mb-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-700">
                <Calendar className="h-5 w-5 text-rose-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-700">
                <MapPin className="h-5 w-5 text-rose-500" />
                <span>{venue}</span>
              </div>
            </div>

            <p className="text-xl opacity-80 max-w-2xl mx-auto font-light leading-relaxed text-slate-600">
              {welcomeMessage}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
