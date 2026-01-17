import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path } from 'react-native-svg';
import type { JournalEntry } from '../types';
import HomeCarousel from './HomeCarousel';
import PlayerDetailView from './PlayerDetailView';
import AlbumCard from './AlbumCard';

interface YogilogHomeProps {
  entries: JournalEntry[];
  onAddEntry?: () => void;
  onEditEntry?: (entry: JournalEntry) => void;
  onDeleteEntry?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

// Icons
const PlusIcon = () => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#121216" strokeWidth={2.5}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </Svg>
);

const FireIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </Svg>
);

const HeartIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </Svg>
);

const YogilogHome: React.FC<YogilogHomeProps> = ({
  entries,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Calculate stats
  const totalSessions = entries.length;
  const currentStreak = calculateStreak(entries);
  const favoriteCount = entries.filter((e) => e.is_favorite).length;

  // Get recent entries (last 10)
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get favorite entries
  const favoriteEntries = entries.filter((e) => e.is_favorite);

  // Get this week's entries
  const thisWeekEntries = getThisWeekEntries(entries);

  // Handle entry click to open player view
  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleClosePlayer = () => {
    setSelectedEntry(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Yogilog</Text>
              <Text style={styles.headerSubtitle}>Your practice, your playlist</Text>
            </View>

            {/* Add Button */}
            <MotiPressable
              onPress={onAddEntry}
              animate={({ pressed }) => ({
                'worklet': true,
                scale: pressed ? 0.95 : 1,
              })}
              style={styles.addButton}
            >
              <PlusIcon />
              <Text style={styles.addButtonText}>New</Text>
            </MotiPressable>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon={<CalendarIcon />}
              value={totalSessions}
              label="Sessions"
              color="purple"
            />
            <StatCard
              icon={<FireIcon />}
              value={currentStreak}
              label="Day Streak"
              color="lime"
            />
            <StatCard
              icon={<HeartIcon />}
              value={favoriteCount}
              label="Favorites"
              color="pink"
            />
          </View>
        </MotiView>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Recent Sessions Carousel */}
          <HomeCarousel
            entries={recentEntries}
            title="Recent Sessions"
            subtitle="Your latest practice records"
            onEntryClick={handleEntryClick}
            showAllLink={entries.length > 10}
          />

          {/* This Week Section */}
          {thisWeekEntries.length > 0 && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 200 }}
              style={styles.section}
            >
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={styles.sectionHeader}
              >
                <FireIcon />
                <Text style={styles.sectionTitle}>This Week</Text>
              </MotiView>
              <View style={styles.gridContainer}>
                {thisWeekEntries.slice(0, 4).map((entry, index) => (
                  <MotiView
                    key={entry.id}
                    from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      delay: index * 80,
                    }}
                    style={styles.gridItem}
                  >
                    <AlbumCard entry={entry} size="md" onClick={handleEntryClick} />
                  </MotiView>
                ))}
              </View>
            </MotiView>
          )}

          {/* Favorites Section */}
          {favoriteEntries.length > 0 && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300 }}
              style={styles.section}
            >
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={styles.sectionHeader}
              >
                <HeartIcon />
                <Text style={styles.sectionTitle}>Favorites</Text>
              </MotiView>
              <View style={styles.favoritesGrid}>
                {favoriteEntries.slice(0, 6).map((entry, index) => (
                  <MotiView
                    key={entry.id}
                    from={{ opacity: 0, scale: 0.8, rotate: '-5deg' }}
                    animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25,
                      delay: index * 60,
                    }}
                    style={styles.favoriteItem}
                  >
                    <AlbumCard entry={entry} size="sm" onClick={handleEntryClick} />
                  </MotiView>
                ))}
              </View>
            </MotiView>
          )}

          {/* Empty State */}
          {entries.length === 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.emptyState}
            >
              <View style={styles.emptyStateCard}>
                <View style={styles.emptyIconContainer}>
                  <Svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="#A238FF" strokeWidth={1.5}>
                    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </Svg>
                </View>
                <Text style={styles.emptyTitle}>Start Your Journey</Text>
                <Text style={styles.emptySubtitle}>
                  Record your first yoga session and watch your practice playlist grow.
                </Text>
                <MotiPressable
                  onPress={onAddEntry}
                  animate={({ pressed }) => ({
                    'worklet': true,
                    scale: pressed ? 0.95 : 1,
                  })}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Create First Session</Text>
                </MotiPressable>
              </View>
            </MotiView>
          )}
        </View>
      </ScrollView>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <PlayerDetailView
            entry={selectedEntry}
            onClose={handleClosePlayer}
            onEdit={(entry) => {
              handleClosePlayer();
              onEditEntry?.(entry);
            }}
            onDelete={(id) => {
              handleClosePlayer();
              onDeleteEntry?.(id);
            }}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </AnimatePresence>
    </View>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'purple' | 'lime' | 'pink';
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  const colorStyles = {
    purple: { bg: 'rgba(162, 56, 255, 0.2)', text: '#c084fc' },
    lime: { bg: 'rgba(204, 255, 0, 0.2)', text: '#CCFF00' },
    pink: { bg: 'rgba(255, 0, 85, 0.2)', text: '#FF0055' },
  };

  return (
    <MotiPressable
      animate={({ hovered }) => ({
        'worklet': true,
        scale: hovered ? 1.02 : 1,
      })}
      style={[styles.statCard, { backgroundColor: colorStyles[color].bg }]}
    >
      <View style={[styles.statIconContainer, { color: colorStyles[color].text }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </MotiPressable>
  );
};

// Helper: Calculate streak
function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedDates = [...new Set(entries.map((e) => e.date.split('T')[0]))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const latestDate = new Date(sortedDates[0]);
  latestDate.setHours(0, 0, 0, 0);

  // Check if latest entry is today or yesterday
  if (latestDate < yesterday) return 0;

  let streak = 1;
  let currentDate = latestDate;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);

    const expectedPrev = new Date(currentDate);
    expectedPrev.setDate(expectedPrev.getDate() - 1);

    if (prevDate.getTime() === expectedPrev.getTime()) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

// Helper: Get this week's entries
function getThisWeekEntries(entries: JournalEntry[]): JournalEntry[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  return entries
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121216',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121216',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  mainContent: {
    gap: 32,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteItem: {
    width: '31%',
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.8)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(162, 56, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  },
  emptyButton: {
    backgroundColor: '#A238FF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default YogilogHome;
