import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { MotiView, MotiImage } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path } from 'react-native-svg';
import type { JournalEntry } from '../types';

type AlbumCardSize = 'sm' | 'md' | 'lg' | 'xl';

interface AlbumCardProps {
  entry: JournalEntry;
  size?: AlbumCardSize;
  onClick?: (entry: JournalEntry) => void;
  showFavorite?: boolean;
}

const sizeMap: Record<AlbumCardSize, { width: number; height: number }> = {
  sm: { width: 128, height: 128 },
  md: { width: 160, height: 160 },
  lg: { width: 224, height: 224 },
  xl: { width: 280, height: 280 },
};

const titleFontSizeMap: Record<AlbumCardSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
};

const durationFontSizeMap: Record<AlbumCardSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
};

// Heart icon for favorites
const HeartIcon: React.FC<{ filled?: boolean; size?: number }> = ({ filled, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#CCFF00' : 'none'} stroke="#CCFF00" strokeWidth={2}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </Svg>
);

const AlbumCard: React.FC<AlbumCardProps> = ({
  entry,
  size = 'md',
  onClick,
  showFavorite = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const hasPhoto = entry.photos && entry.photos.length > 0 && entry.photos[0].url;
  const photoUrl = hasPhoto ? entry.photos[0].url : null;
  const cardSize = sizeMap[size];

  // Format duration for display
  const formatDuration = (duration?: string): string => {
    if (!duration) return '';
    const match = duration.match(/(\d+)/);
    if (match) {
      const mins = parseInt(match[1], 10);
      if (mins >= 60) {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
      }
      return `${mins}m`;
    }
    return duration;
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const displayTitle = entry.title || '수련 기록';
  const displayDuration = formatDuration(entry.duration);
  const displayDate = formatDate(entry.date);

  return (
    <MotiPressable
      onPress={() => onClick?.(entry)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      animate={({ pressed }) => {
        'worklet';
        return {
          scale: pressed ? 0.95 : 1,
        };
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      style={[
        styles.container,
        {
          width: cardSize.width,
          height: cardSize.height,
        },
      ]}
    >
      {/* Background Image or Gradient */}
      {photoUrl ? (
        <MotiImage
          source={{ uri: photoUrl }}
          style={styles.backgroundImage}
          animate={{
            scale: isPressed ? 1.1 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      ) : (
        <View style={styles.gradientBackground} />
      )}

      {/* Gradient Overlay */}
      <View style={styles.gradientOverlay} />

      {/* Favorite Badge */}
      {showFavorite && entry.is_favorite && (
        <MotiView
          style={styles.favoriteBadge}
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <HeartIcon filled size={20} />
        </MotiView>
      )}

      {/* Pose Count Badge */}
      {entry.poses && entry.poses.length > 0 && (
        <MotiView
          style={styles.poseBadge}
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 100 }}
        >
          <Text style={styles.poseBadgeText}>{entry.poses.length} poses</Text>
        </MotiView>
      )}

      {/* Content at Bottom */}
      <MotiView
        style={styles.contentContainer}
        animate={{
          translateY: isPressed ? -4 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Text
          style={[styles.title, { fontSize: titleFontSizeMap[size] }]}
          numberOfLines={1}
        >
          {displayTitle}
        </Text>

        <View style={styles.metaContainer}>
          {displayDuration && (
            <>
              <Text style={[styles.metaText, { fontSize: durationFontSizeMap[size] }]}>
                {displayDuration}
              </Text>
              <View style={styles.metaDot} />
            </>
          )}
          <Text style={[styles.metaText, { fontSize: durationFontSizeMap[size] }]}>
            {displayDate}
          </Text>
        </View>
      </MotiView>

      {/* Intensity Indicator */}
      {entry.intensity && entry.intensity > 0 && (
        <View style={styles.intensityContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <MotiView
              key={level}
              style={[
                styles.intensityDot,
                {
                  backgroundColor:
                    level <= (entry.intensity || 0) ? '#CCFF00' : 'rgba(255,255,255,0.2)',
                },
              ]}
              animate={{
                scale: isPressed && level <= (entry.intensity || 0) ? 1.3 : 1,
              }}
              transition={{ type: 'spring', delay: level * 50 }}
            />
          ))}
        </View>
      )}
    </MotiPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#A238FF',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Simulating gradient with a semi-transparent black overlay
    // For proper gradient, use expo-linear-gradient or react-native-linear-gradient
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  poseBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(162, 56, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  poseBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.7)',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  intensityContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 2,
    zIndex: 10,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default AlbumCard;
