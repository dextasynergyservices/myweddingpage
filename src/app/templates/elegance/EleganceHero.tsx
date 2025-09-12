"use client";

import React, { useEffect, useState } from "react";
import { Heart, Calendar } from "lucide-react";
import weddingHero from "./assets/wedding-hero.jpg";
import styles from "@/styles/templates/elegance.module.css";
import Image from "next/image";

type HeroProps = Record<string, never>;

const Hero: React.FC<HeroProps> = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const imageScale = 1 + scrollY * 0.0005;
  const imageOpacity = Math.max(0.3, 1 - scrollY * 0.001);

  return (
    <section
      className={`${styles.relative} ${styles.minHScreen} ${styles.bgGradientSection} ${styles.overflowHidden}`}
    >
      <div
        className={`${styles.container} ${styles.mxAuto} ${styles.px4} ${styles.hScreen} ${styles.flex} ${styles.itemsCenter}`}
      >
        <div
          className={`${styles.flex} ${styles.flexCol} ${styles.lgGrid} ${styles.lgGridCols2} ${styles.gap8} ${styles.lgGap12} ${styles.itemsCenter} ${styles.wFull} relative top-36`}
        >
          {/* Image - First on mobile, second on desktop */}
          <div className={`${styles.relative} ${styles.wFull} ${styles.order1} ${styles.lgOrder2}`}>
            <div
              className={`${styles.relative} ${styles.overflowHidden} ${styles.rounded3xl} ${styles.shadowElevated}`}
            >
              <Image
                src={weddingHero.src}
                alt="Emma and James wedding photo"
                width={800}
                height={600}
                className={`${styles.wFull} ${styles.h300px} ${styles.smH400px} ${styles.lgH600px} ${styles.objectCover} ${styles.transitionTransform} ${styles.duration300} ${styles.easeOut}`}
                style={{
                  transform: `scale(${imageScale})`,
                  opacity: imageOpacity,
                }}
              />
              <div
                className={`${styles.absolute} ${styles.inset0} ${styles.bgGradientRomantic} ${styles.opacity20}`}
              />
            </div>
          </div>

          {/* Content - Second on mobile, first on desktop */}
          <div
            className={`${styles.textCenter} ${styles.lgTextLeft} ${styles.textForeground} ${styles.wFull} ${styles.order2} ${styles.lgOrder1} ${styles.pt16} ${styles.lgPt0}`}
          >
            <div className={styles.animateFadeInUp}>
              <Heart
                className={`w-12 h-12 mx-auto lg:mx-0 mb-6 animate-float ${styles.textAccent}`}
              />

              <h1
                className={`${styles.fontDisplay} text-2xl md:text-6xl lg:text-7xl font-bold mb-4 leading-none`}
              >
                Tamunomiebaka <span className={styles.textAccent}>&</span> Precious
              </h1>

              <div
                className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.lgJustifyStart} ${styles.mb4} ${styles.lgMb6} ${styles.textAccent}`}
              >
                <Calendar className={`w-6 h-6 md:w4 md:h4 lg:w4 lg:h4 ${styles.mr2}`} />
                <p
                  className={`${styles.textSm} ${styles.smTextBase} ${styles.lgTextXl} ${styles.fontLight} ${styles.trackingWider}`}
                >
                  December 14, 2024
                </p>
              </div>

              <p
                className={`${styles.textLg} ${styles.mdTextXl} ${styles.mb12} ${styles.maxW2xl} ${styles.mxAuto} ${styles.lgMx0} ${styles.leadingRelaxed} ${styles.textMutedForeground}`}
              >
                Join us as we celebrate our love story and begin our journey together as one.
              </p>

              <div
                className={`${styles.flex} ${styles.flexRow} ${styles.itemsCenter} ${styles.justifyCenter} ${styles.lgJustifyStart} ${styles.gap4} ${styles.lgGap6}`}
              >
                <button
                  className={`${styles.bgPrimary} ${styles.textPrimaryForeground} ${styles.px6} ${styles.py2} ${styles.lgPx8} ${styles.lgPy3} ${styles.textSm} ${styles.lgTextBase} ${styles.roundedLg} ${styles.fontSemibold} ${styles.transitionAll} ${styles.hoverBgPrimary80} ${styles.focusRingPrimary}`}
                >
                  RSVP Now
                </button>
                <button
                  className={`${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.px6} ${styles.py2} ${styles.lgPx8} ${styles.lgPy3} ${styles.textSm} ${styles.lgTextBase} ${styles.roundedLg} ${styles.fontSemibold} ${styles.transitionAll} ${styles.hoverBgPrimary10} ${styles.hoverTextPrimary} ${styles.focusRingPrimary}`}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
