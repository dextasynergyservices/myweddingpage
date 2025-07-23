import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxBackgroundProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  speed = 0.5,
  className = "",
}) => {
  const ref = useRef(null);

  // Get scrollY value
  const { scrollY } = useScroll();

  // Map scroll position to parallax offset
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

export default ParallaxBackground;
