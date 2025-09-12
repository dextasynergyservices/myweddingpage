import { Heart } from "lucide-react";
import { Button } from "./components/ui/button";
// Hero background image - using public path
import styles from "@/styles/templates/bloom.module.css";

const WeddingHero = () => {
  return (
    <section
      className={`${styles.heroSection} relative min-h-screen flex items-center justify-center overflow-hidden`}
    >
      {/* Background Image */}
      <div
        className={`${styles.heroBackground} absolute inset-0 bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: `url('/templates/bloom/assets/wedding-hero.jpg')` }}
      >
        <div className={`${styles.gradientHero} absolute inset-0`}></div>
      </div>

      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className={`${styles.heroContent} relative z-10 text-center px-4 max-w-4xl mx-auto`}>
        <div className={`${styles.animateFadeInUp}`}>
          <Heart
            className={`${styles.heroIcon} w-16 h-16 mx-auto mb-8 text-primary-foreground animate-gentle-pulse`}
          />

          <h1
            className={`${styles.heroTitle} font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-primary-foreground mb-6 leading-tight`}
          >
            Sarah & James
          </h1>

          <div
            className={`${styles.heroDateContainer} flex items-center justify-center gap-4 mb-8`}
          >
            <div className={`${styles.heroDateLine} h-px bg-primary-foreground/50 w-16`}></div>
            <p
              className={`${styles.heroDate} font-heading text-2xl md:text-3xl text-primary-foreground/90 font-medium`}
            >
              June 15, 2024
            </p>
            <div className={`${styles.heroDateLine} h-px bg-primary-foreground/50 w-16`}></div>
          </div>

          <p
            className={`${styles.heroDescription} text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed`}
          >
            Two hearts, one beautiful journey. Join us as we celebrate our love and begin our
            forever together.
          </p>

          <div
            className={`${styles.heroButtonContainer} flex flex-col sm:flex-row gap-4 justify-center`}
          >
            <Button
              variant="elegant"
              size="lg"
              className={`${styles.heroButton} bg-white text-black hover:text-red-500 transition-colors duration-300 text-lg px-8 py-4 h-auto font-medium`}
            >
              View Our Story
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`${styles.heroButtonOutline} text-lg px-8 py-4 h-auto font-medium border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary`}
            >
              Gallery
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div
          className={`${styles.floatingHeart} absolute top-20 left-10 opacity-30 ${styles.animateRomanticFloat}`}
        >
          <Heart className={`${styles.floatingHeartIcon} w-8 h-8 text-primary-foreground`} />
        </div>
        <div
          className={`${styles.floatingHeart} absolute bottom-32 right-16 opacity-20 ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "1s" }}
        >
          <Heart className={`${styles.floatingHeartIcon} w-6 h-6 text-primary-foreground`} />
        </div>
        <div
          className={`${styles.floatingHeart} absolute top-40 right-20 opacity-25 ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "2s" }}
        >
          <Heart className={`${styles.floatingHeartIcon} w-10 h-10 text-primary-foreground`} />
        </div>
      </div>
    </section>
  );
};

export default WeddingHero;
