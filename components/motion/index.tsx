import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MotiView, MotiText, MotiImage, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';

// ============================================
// Animation Transition Configs for Moti
// ============================================

// Standard easing transition
export const standardTransition = {
  type: 'timing' as const,
  duration: 350,
};

// Spring transition
export const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

// Soft spring transition
export const softSpringTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// Quick spring transition
export const quickSpringTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 25,
};

// ============================================
// Animation State Presets
// ============================================

// Page transition states
export const pageAnimationStates = {
  from: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.02,
  },
};

// Fade in states
export const fadeInStates = {
  from: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

// Slide up states
export const slideUpStates = {
  from: {
    opacity: 0,
    translateY: 30,
  },
  animate: {
    opacity: 1,
    translateY: 0,
  },
};

// Pop states (for buttons, cards)
export const popStates = {
  from: {
    opacity: 0,
    scale: 0.8,
    translateY: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    translateY: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
};

// Bubble states
export const bubbleStates = {
  from: {
    opacity: 0,
    scale: 0.5,
    rotate: '-10deg',
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: '0deg',
  },
};

// Card hover/press states
export const cardPressStates = {
  pressed: {
    scale: 0.98,
  },
  hovered: {
    scale: 1.02,
    translateY: -4,
  },
};

// Button press states
export const buttonPressStates = {
  pressed: {
    scale: 0.95,
  },
  hovered: {
    scale: 1.05,
  },
};

// ============================================
// Motion Components
// ============================================

// Animated Page Wrapper
interface PageWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, style, delay = 0 }) => (
  <MotiView
    from={pageAnimationStates.from}
    animate={pageAnimationStates.animate}
    exit={pageAnimationStates.exit}
    transition={{ ...standardTransition, delay }}
    style={style}
  >
    {children}
  </MotiView>
);

// Animated Card with press effect
interface MotionCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  enablePress?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  style,
  onPress,
  enablePress = true,
}) => {
  if (!enablePress) {
    return (
      <MotiView
        from={slideUpStates.from}
        animate={slideUpStates.animate}
        transition={springTransition}
        style={style}
      >
        {children}
      </MotiView>
    );
  }

  return (
    <MotiPressable
      onPress={onPress}
      animate={({ pressed, hovered }) => {
        'worklet';
        return {
          scale: pressed ? 0.98 : hovered ? 1.02 : 1,
          translateY: pressed ? 0 : hovered ? -4 : 0,
        };
      }}
      transition={springTransition}
      style={style}
    >
      {children}
    </MotiPressable>
  );
};

// Animated Button with scale effect
interface MotionButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  style,
  onPress,
  disabled = false,
}) => (
  <MotiPressable
    onPress={onPress}
    disabled={disabled}
    animate={({ pressed, hovered }) => {
      'worklet';
      return {
        scale: pressed ? 0.95 : hovered ? 1.05 : 1,
        opacity: disabled ? 0.5 : 1,
      };
    }}
    transition={springTransition}
    style={style}
  >
    {children}
  </MotiPressable>
);

// Stagger Container - wraps children for staggered animations
interface StaggerContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  style,
  delay = 0,
}) => (
  <MotiView
    from={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ ...standardTransition, delay }}
    style={style}
  >
    {children}
  </MotiView>
);

// Stagger Item
interface StaggerItemProps {
  children: React.ReactNode;
  style?: ViewStyle;
  index?: number;
  delay?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  style,
  index = 0,
  delay = 0,
}) => (
  <MotiView
    from={slideUpStates.from}
    animate={slideUpStates.animate}
    transition={{
      ...springTransition,
      delay: delay + index * 80,
    }}
    style={style}
  >
    {children}
  </MotiView>
);

// Fade In component
interface FadeInProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  style,
  delay = 0,
  duration = 400,
}) => (
  <MotiView
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'timing',
      duration,
      delay,
    }}
    style={style}
  >
    {children}
  </MotiView>
);

// Pop In component (for cards/buttons with spring bounce)
interface PopInProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export const PopIn: React.FC<PopInProps> = ({
  children,
  style,
  delay = 0,
}) => (
  <MotiView
    from={popStates.from}
    animate={popStates.animate}
    exit={popStates.exit}
    transition={{
      ...springTransition,
      delay,
    }}
    style={style}
  >
    {children}
  </MotiView>
);

// Slide Up component (for modals/sheets)
interface SlideUpProps {
  children: React.ReactNode;
  style?: ViewStyle;
  visible?: boolean;
}

export const SlideUp: React.FC<SlideUpProps> = ({
  children,
  style,
  visible = true,
}) => (
  <AnimatePresence>
    {visible && (
      <MotiView
        from={{ opacity: 0, translateY: 100 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 100 }}
        transition={softSpringTransition}
        style={style}
      >
        {children}
      </MotiView>
    )}
  </AnimatePresence>
);

// ============================================
// Re-export moti utilities
// ============================================
export { MotiView, MotiText, MotiImage, AnimatePresence, MotiPressable };
