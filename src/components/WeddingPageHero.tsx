"use client";

// import { useState } from "react";
import { Heart, Calendar, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface WeddingPageProps {
  isDemoMode?: boolean;
}

export default function WeddingPageHero({ isDemoMode = false }: WeddingPageProps) {
  // const [selectedCategory, setSelectedCategory] = useState("all");
  // const [newMessage, setNewMessage] = useState("");
  // const [guestName, setGuestName] = useState("");
  // const router = useRouter();
  const { isDarkMode } = useTheme();

  // const coupleId = typeof params?.coupleId === "string" ? params.coupleId : null;

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
        {/* Overlays and visual effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"></div>

        {/* Content */}
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

            <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">Emily & David</h1>

            <div className="flex items-center justify-center gap-8 text-lg mb-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20">
                <Calendar className="h-5 w-5" />
                <span>June 15, 2024</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20">
                <MapPin className="h-5 w-5" />
                <span>Garden Valley Estate</span>
              </div>
            </div>

            <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
              Join us in celebrating our love story and the beginning of our forever together.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
