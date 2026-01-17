/**
 * Footprint Screen - 발자취
 *
 * 월간 분석 및 통계 화면
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import type { JournalEntry } from '../types';
import { getJournalEntries } from '../services/supabaseService';

type Props = MainTabScreenProps<'Footprint'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FootprintScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const loadEntries = async () => {
      const data = await getJournalEntries();
      setEntries(data || []);
    };
    loadEntries();
  }, []);

  // 선택된 월의 일지만 필터링
  const monthlyEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === selectedMonth.getMonth() &&
        entryDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
  }, [entries, selectedMonth]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalSessions = monthlyEntries.length;
    const totalDuration = monthlyEntries.reduce((acc, entry) => {
      const minutes = parseInt(entry.duration || '0', 10);
      return acc + (isNaN(minutes) ? 0 : minutes);
    }, 0);
    const avgIntensity =
      totalSessions > 0
        ? monthlyEntries.reduce((acc, entry) => acc + (entry.intensity || 0), 0) /
          totalSessions
        : 0;

    // 가장 많이 한 자세
    const poseCount: Record<string, number> = {};
    monthlyEntries.forEach((entry) => {
      entry.poses?.forEach((pose) => {
        poseCount[pose.name] = (poseCount[pose.name] || 0) + 1;
      });
    });
    const topPoses = Object.entries(poseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalSessions, totalDuration, avgIntensity, topPoses };
  }, [monthlyEntries]);

  // 월 이동
  const changeMonth = (delta: number) => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const formatMonth = (date: Date) =>
    `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        isDark && styles.containerDark,
      ]}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>
          발자취
        </Text>
      </View>

      {/* 월 선택 */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
          <Text style={[styles.monthButtonText, isDark && styles.textLight]}>◀</Text>
        </TouchableOpacity>
        <Text style={[styles.monthText, isDark && styles.textLight]}>
          {formatMonth(selectedMonth)}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
          <Text style={[styles.monthButtonText, isDark && styles.textLight]}>▶</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 통계 카드들 */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={[styles.statLabel, isDark && styles.textMuted]}>
              수련 횟수
            </Text>
          </View>

          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <Text style={styles.statValue}>{stats.totalDuration}</Text>
            <Text style={[styles.statLabel, isDark && styles.textMuted]}>
              총 수련 시간(분)
            </Text>
          </View>

          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <Text style={styles.statValue}>{stats.avgIntensity.toFixed(1)}</Text>
            <Text style={[styles.statLabel, isDark && styles.textMuted]}>
              평균 강도
            </Text>
          </View>
        </View>

        {/* 자주 수련한 자세 */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            자주 수련한 자세 Top 5
          </Text>

          {stats.topPoses.length > 0 ? (
            stats.topPoses.map(([name, count], index) => (
              <View key={name} style={styles.poseRow}>
                <View style={styles.poseRank}>
                  <Text style={styles.poseRankText}>{index + 1}</Text>
                </View>
                <Text style={[styles.poseName, isDark && styles.textLight]}>
                  {name}
                </Text>
                <View style={styles.poseCountContainer}>
                  <View
                    style={[
                      styles.poseCountBar,
                      { width: `${(count / stats.topPoses[0][1]) * 100}%` },
                    ]}
                  />
                  <Text style={[styles.poseCount, isDark && styles.textMuted]}>
                    {count}회
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, isDark && styles.textMuted]}>
              이번 달 수련 기록이 없습니다.
            </Text>
          )}
        </View>

        {/* 수련 캘린더 히트맵 (간략화) */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            수련 캘린더
          </Text>
          <View style={styles.calendarGrid}>
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasEntry = monthlyEntries.some(
                (e) => new Date(e.date).getDate() === day
              );
              return (
                <View
                  key={day}
                  style={[
                    styles.calendarDay,
                    hasEntry && styles.calendarDayActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      hasEntry && styles.calendarDayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f4',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#115e59',
  },

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  monthButton: {
    padding: 12,
  },
  monthButtonText: {
    fontSize: 18,
    color: '#0d9488',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
    marginHorizontal: 20,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: '#1e293b',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0d9488',
  },
  statLabel: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 4,
    textAlign: 'center',
  },

  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 16,
  },

  poseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  poseRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  poseRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  poseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
  },
  poseCountContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  poseCountBar: {
    height: 4,
    backgroundColor: '#0d9488',
    borderRadius: 2,
    marginBottom: 4,
  },
  poseCount: {
    fontSize: 12,
    color: '#78716c',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (SCREEN_WIDTH - 80) / 7,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
  },
  calendarDayActive: {
    backgroundColor: '#0d9488',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#78716c',
  },
  calendarDayTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  emptyText: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
    paddingVertical: 20,
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default FootprintScreen;
