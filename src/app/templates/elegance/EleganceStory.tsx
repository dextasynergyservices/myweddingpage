"use client";

import React, { useEffect, useRef, useState } from "react";
import coupleStory1 from "./assets/couple-story1.jpg";
import coupleStory2 from "./assets/couple-story2.jpg";
import Image from "next/image";
import styles from "@/styles/templates/elegance.module.css";

interface OurStoryProps {
  title?: string;
  description?: string;
  stories?: Array<{
    title: string;
    date: string;
    story: string;
    image: any;
  }>;
}

const OurStory: React.FC<OurStoryProps> = (props) => {
  // Extract data from props with fallbacks
  const title = props.title || "Our Love Story";
  const description =
    props.description ||
    "Every love story is beautiful, but ours is our favorite. Here's how it all began...";

  const stories = props.stories || [
    {
      title: "How We Met",
      date: "September 2019",
      story:
        "It was a beautiful autumn day when our paths first crossed at a local coffee shop. James was reading a book about photography, and Emma couldn't help but notice the stunning sunset photo on the cover. A simple 'That's a beautiful shot' sparked a conversation that lasted for hours.",
      image: props.storyImage || coupleStory1,
    },
    {
      title: "The Proposal",
      date: "December 2023",
      story:
        "On a snowy winter evening, James recreated our first date at the same coffee shop where we met. As Emma sipped her favorite lavender latte, James got down on one knee among the twinkling fairy lights, asking her to be his forever adventure partner.",
      image: coupleStory2,
    },
  ];
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="story" className={`${styles.py24} ${styles.bgGradientSection}`}>
      <div className={`${styles.container} ${styles.mxAuto} ${styles.px4}`}>
        <div
          ref={sectionRef}
          className={`${styles.textCenter} ${styles.mb16} ${styles.transitionAll} ${styles.duration800} ${
            isVisible ? styles.animateFadeInUp : `${styles.opacity0} ${styles.translateY8}`
          }`}
        >
          <h2
            className={`${styles.fontDisplay} md:text-5xl text-2xl ${styles.fontBold} ${styles.textForeground} ${styles.mb6}`}
          >
            {title}
          </h2>
          <p
            className={`${styles.fontBody} ${styles.textXl} ${styles.textMutedForeground} ${styles.maxW3xl} ${styles.mxAuto}`}
          >
            {description}
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-12 max-w-6xl mx-auto`}>
          {stories.map((story, index) => (
            <div
              key={index}
              className={`${styles.overflowHidden} ${styles.bgGradientCard} ${styles.shadowElevated} ${styles.hoverShadowGlow} ${styles.transitionAll} ${styles.duration500} ${
                isVisible ? styles.animateScaleIn : `${styles.opacity0} ${styles.scale75}`
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={`${styles.relative} ${styles.h80} ${styles.overflowHidden} ${styles.group}`}
              >
                <Image
                  src={story.image.src}
                  alt={story.title}
                  width={600}
                  height={400}
                  className={`${styles.wFull} ${styles.hFull} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration700} ${styles.groupHoverScale110}`}
                  style={{
                    transform: `scale(${1 + scrollY * 0.0002})`,
                  }}
                />
                <div
                  className={`${styles.absolute} ${styles.inset0} ${styles.bgGradientRomantic} ${styles.opacity20} ${styles.groupHoverOpacity30} ${styles.transitionOpacity} ${styles.duration300}`}
                />
              </div>

              <div className={styles.p8}>
                <div
                  className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.mb4}`}
                >
                  <h3
                    className={`${styles.fontDisplay} ${styles.text2xl} ${styles.fontSemibold} ${styles.textPrimary}`}
                  >
                    {story.title}
                  </h3>
                  <span
                    className={`${styles.fontBody} ${styles.textSm} ${styles.fontMedium} ${styles.textAccent} ${styles.bgAccent10} ${styles.px3} ${styles.py1} ${styles.roundedFull}`}
                  >
                    {story.date}
                  </span>
                </div>

                <p
                  className={`${styles.fontBody} ${styles.textMutedForeground} ${styles.leadingRelaxed}`}
                >
                  {story.story}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurStory;
