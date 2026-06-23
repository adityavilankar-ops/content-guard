import { ReactNode } from "react";
import { motion } from "motion/react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  scaleEffect?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  scaleEffect = false,
}: ScrollRevealProps) {
  // Translate direction to offset values
  const offsets = {
    up: { y: 35, x: 0 },
    down: { y: -35, x: 0 },
    left: { y: 0, x: 35 },
    right: { y: 0, x: -35 },
    none: { y: 0, x: 0 },
  };

  const selectedOffset = offsets[direction];

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: selectedOffset.y,
        x: selectedOffset.x,
        scale: scaleEffect ? 0.95 : 1,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 1.02, 0.43, 1.01], // Fluid custom cubic-bezier ease out
      }}
    >
      {children}
    </motion.div>
  );
}
