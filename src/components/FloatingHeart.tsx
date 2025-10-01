"use client";

import { motion } from "framer-motion";

const FloatingHeart = () => (
  <div className="fixed bottom-10 right-10 pointer-events-none z-50">
    <motion.div
      animate={{
        y: [-10, 10, -10],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* <Image src="/logoicon.png" alt="my wedding page" width={48} height={48} /> */}
    </motion.div>
  </div>
);

export default FloatingHeart;
