"use client";

import React from "react";
import { Camera, Gift, MessageCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import ParallaxBackground from "./ParallaxBackground";
import { useTheme } from "@/contexts/ThemeContext";

const HomeFeatures = () => {
  const { isDarkMode } = useTheme();

  return (
    <section
      id="features"
      className={`py-24 relative overflow-hidden ${
        isDarkMode
          ? "bg-gradient-to-br from-black/20 to-amber-900/20"
          : "bg-gradient-to-br from-amber-50/30 to-yellow-50/30"
      }`}
    >
      <ParallaxBackground speed={0.1}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
      </ParallaxBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center mb-20">
          <h2
            className={`text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Everything You Need
          </h2>
          <p
            className={`text-xl max-w-2xl mx-auto font-light ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Powerful tools designed for modern couples who want elegance and simplicity.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Camera,
              title: "Smart Galleries",
              description:
                "AI-powered photo organization with unlimited storage and instant sharing",
              color: "from-red-600 to-rose-700",
            },
            {
              icon: Gift,
              title: "Gift Management",
              description: "Seamless gift tracking with automated thank you notes and analytics",
              color: "from-blue-600 to-indigo-700",
            },
            {
              icon: MessageCircle,
              title: "Guest Engagement",
              description: "Interactive guestbook with real-time moderation and sentiment analysis",
              color: "from-orange-600 to-amber-700",
            },
            {
              icon: Users,
              title: "Couple Dashboard",
              description: "Intuitive control center with insights and collaboration tools",
              color: "from-green-600 to-emerald-700",
            },
          ].map((feature, index) => (
            <AnimatedSection key={index} animation="fadeUp" delay={index * 0.2} className="group">
              <motion.div
                className={`relative rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border overflow-hidden ${
                  isDarkMode
                    ? "bg-black/50 border-[#ab862b]/30 hover:border-[#ab862b]/50"
                    : "bg-white/80 border-amber-200 hover:border-[#ab862b]/30"
                }`}
                whileHover={{ y: -10 }}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isDarkMode
                      ? "bg-gradient-to-br from-black/30 to-[#ab862b]/10"
                      : "bg-gradient-to-br from-amber-50/50 to-yellow-50/30"
                  }`}
                ></div>

                <div className="relative z-10">
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`leading-relaxed font-light ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFeatures;
