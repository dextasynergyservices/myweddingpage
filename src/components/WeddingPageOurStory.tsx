"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function WeddingPageOurStory() {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`rounded-3xl p-12 shadow-lg border mb-16 ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
      }`}
    >
      <div className="text-center mb-12">
        <h2
          className={`text-4xl font-light mb-6 tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Our Love Story
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className={`leading-relaxed mb-6 text-lg font-light ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Our journey began five years ago when we met at a coffee shop in downtown Portland. What
            started as a chance encounter over spilled coffee became the foundation of our beautiful
            love story.
          </p>
          <p
            className={`leading-relaxed text-lg font-light ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Through adventures around the world, quiet Sunday mornings, and everything in between,
            we've built a love that's strong, genuine, and full of joy. Today, we're excited to
            start this new chapter as husband and wife.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Emily and David"
              className="rounded-3xl shadow-2xl max-w-full h-auto"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
