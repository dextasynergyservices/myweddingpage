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
      className={`py-24 relative overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
    >
      <ParallaxBackground speed={0.1}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
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
              color: "from-blue-500 to-indigo-600",
            },
            {
              icon: Gift,
              title: "Gift Management",
              description: "Seamless gift tracking with automated thank you notes and analytics",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: MessageCircle,
              title: "Guest Engagement",
              description: "Interactive guestbook with real-time moderation and sentiment analysis",
              color: "from-purple-500 to-pink-600",
            },
            {
              icon: Users,
              title: "Couple Dashboard",
              description: "Intuitive control center with insights and collaboration tools",
              color: "from-amber-500 to-orange-600",
            },
          ].map((feature, index) => (
            <AnimatedSection key={index} animation="fadeUp" delay={index * 0.2} className="group">
              <motion.div
                className={`relative rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border overflow-hidden ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 hover:border-slate-500"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
                whileHover={{ y: -10 }}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-600/50 to-slate-700"
                      : "bg-gradient-to-br from-slate-50/50 to-white"
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
