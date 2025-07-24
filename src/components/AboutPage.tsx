"use client";

import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import AboutHero from "@/components/AboutHero";
import { AboutStats } from "@/components/AboutStats";
import MissionVision from "@/components/MissionVision";
import Values from "@/components/Values";
import Team from "@/components/Team";
import AboutCTA from "@/components/AboutCTA";
// import AboutHeader from './AboutPage/AboutHeader';

const AboutPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      {/* <AboutHeader /> */}

      {/* Page Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <AboutHero />
        <AboutStats />
        <MissionVision />
        <Values />
        <Team />
        <AboutCTA />
      </div>
    </div>
  );
};

export default AboutPage;
