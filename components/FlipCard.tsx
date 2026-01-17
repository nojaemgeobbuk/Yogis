/**
 * FlipCard Component
 * 터치 시 카드가 플립되어 앞/뒤를 보여주는 애니메이션
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - theme.spacing.xl * 2;

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  style?: any;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back, style }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 180;

    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
  };

  // 앞면 회전
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  // 뒷면 회전
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // 앞면 투명도
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  // 뒷면 투명도
  const backOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={flipCard}
      style={[styles.container, style]}
    >
      {/* 앞면 */}
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          {
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
      >
        {front}
      </Animated.View>

      {/* 뒷면 */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          {
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
        {back}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 200,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: theme.borderRadius.card,
    backgroundColor: theme.colors.bg_card,
    ...theme.shadows.card,
  },
  cardFront: {
    // 앞면
  },
  cardBack: {
    // 뒷면
  },
});

export default FlipCard;
