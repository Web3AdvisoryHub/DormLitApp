import { MotionProps } from "framer-motion";

// Fade in animation
export const fadeIn: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// Fade up animation
export const fadeUp: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4 }
};

// Stagger children animations
export const staggerContainer: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { staggerChildren: 0.1, delayChildren: 0.1 }
};

// Scale animation for cards
export const scaleUp: MotionProps = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.4, type: "spring", stiffness: 100 }
};

// Hover animations for buttons and cards
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 }
};

// Slide in from left
export const slideInLeft: MotionProps = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.5, type: "spring", damping: 25 }
};

// Slide in from right
export const slideInRight: MotionProps = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.5, type: "spring", damping: 25 }
};

// Rotate and scale
export const rotateIn: MotionProps = {
  initial: { opacity: 0, scale: 0, rotate: -10 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0, rotate: 10 },
  transition: { duration: 0.4, type: "spring", stiffness: 200 }
};

// Float animation for cards or elements
export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

// Glow pulse animation
export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 0 rgba(106, 13, 173, 0.4)",
      "0 0 15px rgba(106, 13, 173, 0.7)",
      "0 0 0 rgba(106, 13, 173, 0.4)"
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
};
