import { motion, HTMLMotionProps, Variants, AnimatePresence } from 'framer-motion';
import React from 'react';

// ============================================
// Animation Variants - Zen Style
// ============================================

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Stagger item variants (slide up)
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Fade in variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Scale up variants (for cards/buttons)
export const scaleVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Button variants with subtle scale
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
};

// ============================================
// Motion Components
// ============================================

// Animated Page Wrapper
interface PageWrapperProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, ...props }) => (
  <motion.div
    initial="initial"
    animate="enter"
    exit="exit"
    variants={pageVariants}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Card with hover effect
interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  enableHover?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  enableHover = true,
  ...props
}) => (
  <motion.div
    variants={enableHover ? cardHoverVariants : undefined}
    initial="initial"
    whileHover={enableHover ? "hover" : undefined}
    whileTap={enableHover ? "tap" : undefined}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Button with scale effect
interface MotionButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
}

export const MotionButton: React.FC<MotionButtonProps> = ({ children, ...props }) => (
  <motion.button
    variants={buttonVariants}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    {...props}
  >
    {children}
  </motion.button>
);

// Stagger Container
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ children, ...props }) => (
  <motion.div
    variants={staggerContainerVariants}
    initial="hidden"
    animate="visible"
    {...props}
  >
    {children}
  </motion.div>
);

// Stagger Item
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, ...props }) => (
  <motion.div
    variants={staggerItemVariants}
    {...props}
  >
    {children}
  </motion.div>
);

// Fade In component
interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
);

// Re-export framer-motion utilities
export { motion, AnimatePresence };
export type { Variants };
