"use client";

import { Target, Eye } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useTheme } from "@/contexts/ThemeContext";

const MissionVision = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
      <AnimatedSection animation="fadeRight">
        <div
          className={`${
            isDarkMode ? "bg-slate-800/80" : "bg-white/80"
          } backdrop-blur-xl rounded-3xl shadow-2xl border ${
            isDarkMode ? "border-slate-700/50" : "border-white/20"
          } p-12`}
        >
          <div className="flex items-center gap-4 mb-8">
            <Target className="h-8 w-8 text-indigo-600" />
            <h2 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Our Mission
            </h2>
          </div>
          <p
            className={`text-lg leading-relaxed font-light ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            To empower couples with the tools and platform they need to create, share, and celebrate
            their perfect wedding day. We&apos;re committed to making wedding planning stress-free
            and joyful, allowing couples to focus on what matters most - their love story.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="fadeLeft" delay={0.2}>
        <div
          className={`${
            isDarkMode ? "bg-slate-800/80" : "bg-white/80"
          } backdrop-blur-xl rounded-3xl shadow-2xl border ${
            isDarkMode ? "border-slate-700/50" : "border-white/20"
          } p-12`}
        >
          <div className="flex items-center gap-4 mb-8">
            <Eye className="h-8 w-8 text-purple-600" />
            <h2 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Our Vision
            </h2>
          </div>
          <p
            className={`text-lg leading-relaxed font-light ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            To become the world&apos;s most trusted wedding platform, where every couple can create
            their dream wedding experience. We envision a future where technology seamlessly
            enhances the most important moments in people&apos;s lives.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default MissionVision;
