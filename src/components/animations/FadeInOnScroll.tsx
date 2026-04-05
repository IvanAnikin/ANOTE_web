"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface FadeInOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

const directionOffset = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: 30 },
  right: { x: -30 },
};

export function FadeInOnScroll({
  children,
  delay = 0,
  className,
  direction = "up",
}: FadeInOnScrollProps) {
  const offset = directionOffset[direction];
  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
