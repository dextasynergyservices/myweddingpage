"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

const videos = [
  {
    title: "Getting Started",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  { title: "Advanced Tips", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
];

const HowToVideos = () => {
  const { isDarkMode } = useTheme();
  return (
    <AnimatedSection className={`py-16 px-6 ${isDarkMode ? "bg-slate-800" : " bg-gray-50"}`}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className={`text-3xl font-bold mb-10 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Video Tutorials
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="overflow-hidden rounded-xl"
            >
              <iframe
                width="100%"
                height="315"
                src={video.url}
                title={video.title}
                allowFullScreen
                className="rounded-xl"
              ></iframe>
              <p className={`mt-2 font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {video.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default HowToVideos;
