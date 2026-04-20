"use client";

import {
  useScrollAnimation,
  useScrollScale,
} from "@/app/templates/vows/hooks/useScrollAnimation";
import Image from "next/image";
import styles from "@/styles/templates/vows.module.css";

// Default story images using Cloudinary URLs
const defaultStoryImage1 =
  "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800";
const defaultStoryImage2 =
  "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800";

interface OurStorySectionProps {
  title?: string;
  description?: string;
  storyContent?: {
    howWeMet?: {
      title?: string;
      content?: string;
    };
    theProposal?: {
      title?: string;
      content?: string;
    };
  };
  storyImages?: {
    image1?: string;
    image2?: string;
  };
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  gallery?: string[];
  guests?: Record<string, unknown>[];
  bankDetails?: Record<string, unknown>[];
  storyImage?: string;
  // Legacy support for ourStory prop
  ourStory?: {
    content?: string;
    imageUrl?: string;
  };
}

export const OurStorySection = (props: OurStorySectionProps) => {
  // Extract data from props with fallbacks
  const title = props.title || "Our Story";
  const description =
    props.description ||
    "Every love story is beautiful, but ours is our favorite. From our first meeting to this magical moment, here's how our journey began.";

  // Extract story content from props (prioritize storyContent > ourStory.content)
  const storyContent = props.storyContent || {
    howWeMet: {
      title: "How We Met",
      content:
        props.ourStory?.content ||
        "It was a beautiful spring afternoon at the local coffee shop. Sarah was reading her favorite book when Michael accidentally spilled his coffee. What started as an embarrassing moment turned into the most wonderful conversation that lasted for hours.",
    },
    theProposal: {
      title: "The Proposal",
      content:
        "On a snowy December evening, Michael took Sarah back to that same coffee shop where they first met. As the snow fell gently outside, he got down on one knee and asked her to be his forever. Of course, she said yes!",
    },
  };

  // Extract story images from props (prioritize storyImages > storyImage > ourStory.imageUrl)
  const storyImages = props.storyImages || {
    image1: props.storyImage || props.ourStory?.imageUrl || defaultStoryImage1,
    image2: defaultStoryImage2,
  };

  // Ensure we have valid image sources (fallback to default images if empty)
  const safeStoryImages = {
    image1:
      storyImages.image1 && storyImages.image1.trim() !== ""
        ? storyImages.image1
        : defaultStoryImage1,
    image2:
      storyImages.image2 && storyImages.image2.trim() !== ""
        ? storyImages.image2
        : defaultStoryImage2,
  };
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);
  const { ref: image1Ref, scale: image1Scale } = useScrollScale();
  const { ref: image2Ref, scale: image2Scale } = useScrollScale();

  return (
    <section id="vows-story" className={`py-32 ${styles.bgBackground}`}>
      <div className={styles.containerWedding}>
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className={`${styles.fontHeading} text-5xl md:text-6xl lg:text-7xl text-black mb-6`}
          >
            {title}
          </h2>
          <div className={`w-24 h-px ${styles.bgAccent} mx-auto mb-8`} />
          <p
            className={`${styles.fontBody} text-lg md:text-xl text-black/80 max-w-3xl mx-auto leading-relaxed`}
          >
            {description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* First Story Block */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
          >
            <div className={`${styles.elegantCard} p-8 md:p-12`}>
              <h3
                className={`${styles.fontHeading} text-2xl md:text-3xl text-black/80 mb-4`}
              >
                {storyContent.howWeMet?.title}
              </h3>
              <p
                className={`${styles.fontBody} text-black/80 leading-relaxed mb-6`}
              >
                {storyContent.howWeMet?.content}
              </p>
            </div>
          </div>

          <div
            ref={image1Ref}
            className={`transition-all duration-1000 delay-600 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transform: `scale(${image1Scale})` }}
          >
            <div
              className={`relative overflow-hidden ${styles.roundedLg} ${styles.shadowElegant}`}
            >
              <Image
                src={safeStoryImages.image1}
                alt="Our first photo together"
                className="w-full h-auto object-cover"
                width={600}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Second Story Block - Reversed Order on Desktop */}
          <div
            ref={image2Ref}
            className={`lg:order-3 transition-all duration-1000 delay-800 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
            style={{ transform: `scale(${image2Scale})` }}
          >
            <div
              className={`relative overflow-hidden ${styles.roundedLg} ${styles.shadowElegant}`}
            >
              <Image
                src={safeStoryImages.image2}
                alt="During our engagement"
                className="w-full h-auto object-cover"
                width={600}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          <div
            className={`lg:order-4 transition-all duration-1000 delay-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className={`${styles.elegantCard} p-8 md:p-12`}>
              <h3
                className={`${styles.fontHeading} text-2xl md:text-3xl text-black/80 mb-4`}
              >
                {storyContent.theProposal?.title}
              </h3>
              <p
                className={`${styles.fontBody} text-black/80 leading-relaxed mb-6`}
              >
                {storyContent.theProposal?.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
