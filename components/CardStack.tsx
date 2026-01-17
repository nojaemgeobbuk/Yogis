import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';
import type { JournalEntry } from '../types';
import JournalCard from './JournalCard';

interface CardStackProps {
  entries: JournalEntry[];
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onGenerateSouvenir: (entry: JournalEntry) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isSelectionMode: boolean;
  selectedEntries: Set<string>;
  onToggleSelection: (id: string) => void;
}

const CardStack: React.FC<CardStackProps> = ({
  entries,
  onEditEntry,
  onDeleteEntry,
  onGenerateSouvenir,
  onToggleFavorite,
  isSelectionMode,
  selectedEntries,
  onToggleSelection,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const filteredEntries = showFavoritesOnly
    ? entries.filter((entry) => entry.is_favorite)
    : entries;

  if (filteredEntries.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyTitle}>
          {showFavoritesOnly
            ? '아직 즐겨찾기한 수련 일지가 없습니다.'
            : '새로운 수련 이야기를 기록해보세요.'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {showFavoritesOnly
            ? '즐겨찾기 아이콘(★)을 눌러 중요한 수련을 표시해보세요.'
            : '조건에 맞는 일지가 없습니다. 검색어를 변경하거나 새로운 일지를 작성해보세요.'}
        </Text>
      </MotiView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Favorites Toggle */}
      {!isSelectionMode && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.filterContainer}
        >
          <MotiPressable
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            animate={({ pressed }) => ({
              'worklet': true,
              scale: pressed ? 0.95 : 1,
            })}
            style={[
              styles.filterButton,
              showFavoritesOnly && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                showFavoritesOnly && styles.filterButtonTextActive,
              ]}
            >
              {showFavoritesOnly ? '★ 즐겨찾기만 보기' : '전체 보기'}
            </Text>
          </MotiPressable>
        </MotiView>
      )}

      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        <AnimatePresence>
          {filteredEntries.map((entry, index) => (
            <MotiView
              key={entry.id}
              from={{ opacity: 0, translateY: 60, scale: 0.9 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                mass: 0.8,
                delay: index * 100,
              }}
              style={[
                styles.cardWrapper,
                { width: isSelectionMode ? '48%' : '100%' },
              ]}
            >
              <MotiPressable
                onPress={() => {
                  if (isSelectionMode) {
                    onToggleSelection(entry.id);
                  }
                }}
                animate={({ pressed, hovered }) => ({
                  'worklet': true,
                  scale: pressed ? 0.98 : hovered ? 1.02 : 1,
                  translateY: hovered ? -4 : 0,
                })}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.cardPressable}
              >
                <JournalCard
                  entry={entry}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                  onGenerateSouvenir={onGenerateSouvenir}
                  onToggleFavorite={onToggleFavorite}
                  isHovered={hoveredIndex === index}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedEntries.has(entry.id)}
                  onToggleSelection={onToggleSelection}
                />
              </MotiPressable>
            </MotiView>
          ))}
        </AnimatePresence>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
  },
  filterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27272a',
  },
  filterButtonActive: {
    backgroundColor: '#fbbf24',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a3a3a3',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  cardWrapper: {
    minHeight: 550,
    marginBottom: 16,
  },
  cardPressable: {
    flex: 1,
  },
});

export default CardStack;
