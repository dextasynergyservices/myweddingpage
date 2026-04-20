"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import ParallaxBackground from "./ParallaxBackground";
import AnimatedSection from "./AnimatedSection";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";

const listItemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.5 + i * 0.1 },
  }),
  hover: { x: 5 },
};

const footerLinkVariant = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: 1 + i * 0.1 },
  }),
  hover: { y: -2 },
};

const Footer = () => {
  const { isDarkMode } = useTheme();
  const listRef = useRef(null);
  const isInView = useInView(listRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <>
      {/* Footer */}
      <footer
        className={`py-20 relative overflow-hidden ${
          isDarkMode ? "bg-black text-white" : "bg-black text-white"
        }`}
      >
        <ParallaxBackground speed={0.05}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#ab862b]/30 to-amber-500/10 rounded-full blur-3xl"></div>
        </ParallaxBackground>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <AnimatedSection animation="fadeRight" className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="p-2 rounded-xl"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Image
                    src={"/logowhite.png"}
                    alt="my wedding page"
                    width={300}
                    height={100}
                  />
                </motion.div>
              </div>
              <p className="text-white leading-relaxed font-light text-lg max-w-md">
                Creating beautiful, modern wedding experiences for couples who
                value elegance and simplicity.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.2}>
              <h3 className="text-lg font-medium mb-6">Platform</h3>
              <ul ref={listRef} className="space-y-3 text-white font-light">
                {["Wedding Pages", "Packages", "Login"].map((item, i) => (
                  <motion.li
                    key={item}
                    className="hover:text-white transition-colors duration-300 cursor-pointer"
                    variants={listItemVariant}
                    custom={i}
                    initial="hidden"
                    animate={controls}
                    whileHover="hover"
                  >
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}>
                      {item}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.4}>
              <h3 className="text-lg font-medium mb-6">Support</h3>
              <ul className="space-y-3 text-white font-light">
                {["How To", "Contact"].map((item, i) => (
                  <motion.li
                    key={item}
                    className="hover:text-white transition-colors duration-300 cursor-pointer"
                    variants={listItemVariant}
                    custom={i}
                    initial="hidden"
                    animate={controls}
                    whileHover="hover"
                  >
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}>
                      {item}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="fadeUp" delay={0.6}>
            <div className="border-t border-[#ab862b] mt-16 pt-8 flex flex-col justify-between items-center">
              <p className="text-white font-light">
                &copy; {new Date().getFullYear()} Myweddingpage. All rights
                reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                {["Privacy", "Terms", "Cookies"].map((item, i) => (
                  <motion.span
                    key={item}
                    className="text-white hover:text-white transition-colors duration-300 cursor-pointer font-light"
                    variants={footerLinkVariant}
                    custom={i}
                    initial="hidden"
                    animate={controls}
                    whileHover="hover"
                  >
                    <Link href={`/${item.toLowerCase()}`}>{item}</Link>
                  </motion.span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </footer>

      {/* Floating Element */}
      {/* <FloatingHeart /> */}
    </>
  );
};

export default Footer;
