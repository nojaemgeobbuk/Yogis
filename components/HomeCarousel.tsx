import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path } from 'react-native-svg';
import type { JournalEntry } from '../types';
import AlbumCard from './AlbumCard';

interface HomeCarouselProps {
  entries: JournalEntry[];
  title?: string;
  subtitle?: string;
  onEntryClick?: (entry: JournalEntry) => void;
  showAllLink?: boolean;
  onShowAllClick?: () => void;
}

// Icons
const ChevronRightIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#A238FF" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </Svg>
);

const SparklesIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </Svg>
);

const HomeCarousel: React.FC<HomeCarouselProps> = ({
  entries,
  title,
  subtitle,
  onEntryClick,
  showAllLink = false,
  onShowAllClick,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.width - layoutMeasurement.width;
    if (maxScroll > 0) {
      setScrollProgress(contentOffset.x / maxScroll);
    }
  };

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      {(title || subtitle) && (
        <View style={styles.headerContainer}>
          <View>
            {title && (
              <View style={styles.titleRow}>
                <SparklesIcon />
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
            )}
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>

          {showAllLink && (
            <MotiPressable
              onPress={onShowAllClick}
              animate={({ pressed }) => ({
                'worklet': true,
                translateX: pressed ? 4 : 0,
                scale: pressed ? 0.95 : 1,
              })}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRightIcon />
            </MotiPressable>
          )}
        </View>
      )}

      {/* Carousel Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}
      >
        {/* Featured Card (First Entry - Large) */}
        {entries.length > 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.85, translateX: -30 }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={styles.cardWrapper}
          >
            <AlbumCard
              entry={entries[0]}
              size="xl"
              onClick={onEntryClick}
            />
          </MotiView>
        )}

        {/* Rest of the entries */}
        {entries.slice(1).map((entry, index) => (
          <MotiView
            key={entry.id}
            from={{ opacity: 0, scale: 0.8, translateX: -20 }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: (index + 1) * 80,
            }}
            style={styles.cardWrapper}
          >
            <AlbumCard
              entry={entry}
              size="lg"
              onClick={onEntryClick}
            />
          </MotiView>
        ))}

        {/* Add New Card (Ghost) */}
        <MotiPressable
          animate={({ pressed, hovered }) => ({
            'worklet': true,
            scale: pressed ? 0.95 : hovered ? 1.05 : 1,
          })}
          style={styles.addNewCard}
        >
          <MotiView
            animate={({ hovered }) => ({
              'worklet': true,
              rotate: hovered ? '90deg' : '0deg',
            })}
            style={styles.addIconContainer}
          >
            <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#A238FF" strokeWidth={2}>
              <Path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </Svg>
          </MotiView>
          <Text style={styles.addNewText}>New Session</Text>
        </MotiPressable>
      </ScrollView>

      {/* Scroll Progress Indicator */}
      {entries.length > 2 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <MotiView
              animate={{ width: `${scrollProgress * 100}%` }}
              transition={{ type: 'timing', duration: 100 }}
              style={styles.progressFill}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// Empty State Component
const EmptyState: React.FC = () => (
  <MotiView
    from={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'timing', duration: 400 }}
    style={styles.emptyStateCard}
  >
    {/* Vinyl Record Icon */}
    <MotiView
      from={{ rotate: '0deg' }}
      animate={{ rotate: '360deg' }}
      transition={{ type: 'timing', duration: 8000, loop: true }}
      style={styles.vinylContainer}
    >
      <View style={styles.vinylOuter}>
        <View style={styles.vinylMiddle}>
          <View style={styles.vinylInner}>
            <View style={styles.vinylCenter} />
          </View>
        </View>
        <View style={[styles.vinylGroove, { top: 8, right: 8, bottom: 8, left: 8 }]} />
        <View style={[styles.vinylGroove, { top: 16, right: 16, bottom: 16, left: 16 }]} />
        <View style={[styles.vinylGroove, { top: 32, right: 32, bottom: 32, left: 32 }]} />
      </View>
    </MotiView>

    <Text style={styles.emptyTitle}>No Sessions Yet</Text>
    <Text style={styles.emptySubtitle}>
      Start your practice journey. Each session becomes a track in your yoga playlist.
    </Text>

    <MotiPressable
      animate={({ pressed }) => ({
        'worklet': true,
        scale: pressed ? 0.95 : 1,
      })}
      style={styles.startButton}
    >
      <Svg width={20} height={20} fill="#fff" viewBox="0 0 24 24">
        <Path d="M8 5.14v14l11-7-11-7z" />
      </Svg>
      <Text style={styles.startButtonText}>Start First Session</Text>
    </MotiPressable>
  </MotiView>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A238FF',
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrapper: {
    marginRight: 12,
  },
  addNewCard: {
    width: 224,
    height: 224,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(162, 56, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#A238FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A238FF',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A238FF',
    borderRadius: 2,
  },
  // Empty State Styles
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(162, 56, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(162, 56, 255, 0.2)',
  },
  vinylContainer: {
    width: 96,
    height: 96,
    marginBottom: 24,
  },
  vinylOuter: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: '#1c1c22',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vinylMiddle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2a2a32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(162, 56, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#121216',
  },
  vinylGroove: {
    position: 'absolute',
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#A238FF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default HomeCarousel;
