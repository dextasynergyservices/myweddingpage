"use client";

import { useScrollAnimation } from "@/app/templates/vows/hooks/useScrollAnimation";
import styles from "@/styles/templates/vows.module.css";

export const HeroSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.3);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-fixed ${styles.weddingHero}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/templates/vows/assets/hero-wedding.jpg')`,
        }}
      />

      {/* Content */}
      <div
        ref={ref}
        className={`relative z-10 text-center text-white transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className={styles.containerWedding}>
          <h1
            className={`${styles.fontScript} text-6xl md:text-8xl lg:text-9xl mb-4 ${styles.animateFadeUp}`}
          >
            Sarah & Michael
          </h1>
          <div className="h-px w-32 bg-white mx-auto mb-6 opacity-80" />
          <p className={`${styles.fontHeading} text-xl md:text-2xl lg:text-3xl mb-4 tracking-wide`}>
            Together Forever
          </p>
          <p className={`${styles.fontBody} text-lg md:text-xl text-gray-200 mb-8`}>
            October 15, 2024 • Napa Valley, California
          </p>
          <div className={styles.animatePulseGentle}>
            <button
              className={`${styles.fontBody} text-sm md:text-base tracking-widest uppercase bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300`}
            >
              Celebrate With Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
