"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";

interface OurStoryData {
  content: string;
  imageUrl: string;
}

interface RusticOurStoryProps {
  content?: string;
  imageUrl?: string;
  story?: string;
  storyImage?: string;
  // Legacy support for ourStory prop
  ourStory?: OurStoryData;
}

export default function RusticOurStory(props: RusticOurStoryProps) {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);

  // Extract data from props (prioritize direct props over ourStory object)
  const content =
    props.content || props.story || props.ourStory?.content || "Our love story will appear here...";
  const imageUrl =
    props.imageUrl || props.storyImage || props.ourStory?.imageUrl || "/default-story.jpg";

  const paragraphs = content.split("\n").filter((p: string) => p.trim() !== "");
  const preview = paragraphs.slice(0, 3).join("\n\n");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-8 md:p-12 shadow-lg border mb-16 ${
          isDarkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-3xl md:text-4xl font-light mb-4 md:mb-6 tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Our Love Story
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {preview.split("\n\n").map((para: string, idx: number) => (
              <p
                key={idx}
                className={`leading-relaxed text-base md:text-lg font-light mb-4 md:mb-6 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                {para}
              </p>
            ))}

            {paragraphs.length > 3 && (
              <div className="mt-4">
                <button onClick={() => setOpen(true)} className="text-indigo-600 hover:underline">
                  Read full story
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="relative">
              <Image
                src={imageUrl}
                alt="Our love story"
                width={600}
                height={400}
                className="rounded-3xl shadow-2xl max-w-full h-auto"
                priority
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 blur-xl"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Our Love Story"
        maxWidth="max-w-4xl"
        forceLight
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {paragraphs.map((para: string, idx: number) => (
              <p
                key={idx}
                className={`leading-relaxed text-base md:text-lg mb-4 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                {para}
              </p>
            ))}
          </div>
          <div className="flex justify-center">
            <Image
              src={imageUrl}
              alt="Couple portrait used in the story section"
              width={800}
              height={600}
              className="rounded-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
