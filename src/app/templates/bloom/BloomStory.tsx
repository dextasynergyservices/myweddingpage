import { useScrollAnimation, useScrollScale } from "./hooks/useScrollAnimation";
import { Heart, Calendar, MapPin, Sparkles } from "lucide-react";
// Couple portrait - using public path
import Image from "next/image";
import styles from "@/styles/templates/bloom.module.css";

const OurStory = () => {
  const { elementRef: storyRef, isVisible: storyVisible } = useScrollAnimation(0.2);
  const { elementRef: timelineRef, isVisible: timelineVisible } = useScrollAnimation(0.1);
  const { elementRef: imageRef, isVisible: imageVisible } = useScrollScale(0.2);

  const milestones = [
    {
      date: "March 2018",
      title: "First Meeting",
      description:
        "We met at a coffee shop in downtown. It was love at first sight, though neither of us wanted to admit it.",
      icon: Heart,
    },
    {
      date: "December 2019",
      title: "First Adventure",
      description:
        "Our first trip together to the mountains. We knew we were meant to explore the world side by side.",
      icon: MapPin,
    },
    {
      date: "2022",
      title: "The Proposal",
      description:
        "Under the stars at our favorite spot by the lake, James got down on one knee and asked the question that changed everything.",
      icon: Sparkles,
    },
    {
      date: "June 2024",
      title: "Our Wedding",
      description:
        'Today, we say "I do" and begin our greatest adventure yet - a lifetime of love together.',
      icon: Calendar,
    },
  ];

  return (
    <section
      className={`${styles.sectionPadding} ${styles.bgGradientPrimary} relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div className={`${styles.floatingElement} absolute top-20 left-10 opacity-10`}>
        <Heart className={`w-32 h-32 text-primary ${styles.animateRomanticFloat}`} />
      </div>
      <div className={`${styles.floatingElement} absolute bottom-20 right-16 opacity-10`}>
        <Heart
          className={`w-24 h-24 text-accent ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className={`${styles.containerBloom} mx-auto px-4`}>
        {/* Header */}
        <div
          ref={storyRef}
          className={`text-center mb-20 transition-all duration-1000 ${
            storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2
            className={`${styles.fontHeading} text-2xl md:text-5xl font-bold ${styles.textForeground} mb-6`}
          >
            Our Love Story
          </h2>
          <div className={`${styles.bgGradientRose} w-24 h-1 mx-auto mb-8`}></div>
          <p className={`text-xl ${styles.textMuted} max-w-3xl mx-auto leading-relaxed`}>
            Every love story is beautiful, but ours is our favorite. Here&apos;s how two hearts
            found their way to each other and decided to walk together forever.
          </p>
        </div>

        {/* Story Content */}
        <div className={`${styles.storyContent} grid lg:grid-cols-2 gap-16 items-center mb-20`}>
          {/* Image */}
          <div
            ref={imageRef}
            className={`transition-all duration-[3000ms] ease-out delay-700 ${
              imageVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
            style={{
              transformOrigin: "center",
            }}
          >
            <div className={`${styles.storyImageContainer} relative group`}>
              <Image
                src="/templates/bloom/assets/couple-portrait.jpg"
                alt="Sarah and James"
                className={`w-full ${styles.roundedLg} ${styles.shadowElegant} transition-romantic group-hover:shadow-glow`}
                width={600}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className={`absolute inset-0 ${styles.roundedLg} bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-romantic`}
              ></div>
            </div>
          </div>

          {/* Story Text */}
          <div
            className={`transition-all duration-[1500ms] delay-700 ${
              storyVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className={`${styles.storyText} space-y-6`}>
              <h3
                className={`${styles.fontHeading} md:text-4xl text-xl font-semibold ${styles.textForeground}`}
              >
                A Love That Bloomed
              </h3>
              <p className={`text-lg ${styles.textMuted} leading-relaxed`}>
                What started as a chance encounter at our favorite coffee shop has blossomed into a
                love that fills our hearts with joy every single day. We&apos;ve laughed together,
                dreamed together, and supported each other through all of life&apos;s beautiful
                moments.
              </p>
              <p className={`text-lg ${styles.textMuted} leading-relaxed`}>
                From quiet Sunday mornings to adventurous weekend getaways, we&apos;ve built a
                foundation of friendship, trust, and unconditional love that we can&apos;t wait to
                celebrate with all of you.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div
          ref={timelineRef}
          className={`transition-all duration-[1500ms] ${
            timelineVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <h3
            className={`${styles.fontHeading} md:text-4xl text-xl font-semibold text-center ${styles.textForeground} mb-16`}
          >
            Our Journey Together
          </h3>

          <div className={`${styles.timelineContainer} relative`}>
            {/* Timeline Line */}
            <div
              className={`${styles.timelineLine} absolute left-1/2 transform -translate-x-1/2 w-1 ${styles.gradientRomantic} h-full hidden md:block`}
            ></div>

            <div className={`${styles.timelineItems} space-y-16`}>
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative grid md:grid-cols-2 gap-8 items-center transition-all duration-[1200ms] ${
                    timelineVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 300}ms` }}
                >
                  {/* Content */}
                  <div
                    className={`${index % 2 === 0 ? "md:text-right md:pr-8" : "md:col-start-2 md:pl-8"}`}
                  >
                    <div
                      className={`${styles.bgCard} p-8 ${styles.roundedLg} ${styles.shadowSoft} hover:${styles.shadowRomantic} ${styles.transitionRomantic}`}
                    >
                      <div className={`${styles.timelineItemHeader} flex items-center gap-3 mb-4`}>
                        <milestone.icon className={`${styles.timelineIcon} w-6 h-6 text-primary`} />
                        <span className={`${styles.timelineDate} font-medium text-primary`}>
                          {milestone.date}
                        </span>
                      </div>
                      <h4
                        className={`${styles.fontHeading} text-2xl font-semibold ${styles.textForeground} mb-3`}
                      >
                        {milestone.title}
                      </h4>
                      <p className={`${styles.textMuted} leading-relaxed`}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div
                    className={`${styles.timelineDot} absolute left-1/2 transform -translate-x-1/2 w-4 h-4 ${styles.gradientRomantic} rounded-full border-4 border-background hidden md:block`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
