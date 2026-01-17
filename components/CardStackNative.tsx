/**
 * CardStack Native Component
 * 네이버페이 스타일의 카드 스택 레이아웃 (React Native)
 * 여러 카드가 겹쳐진 형태로 표시되며, 각 카드는 플립 가능
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import FlipCard from './FlipCard';
import { theme } from '../theme';
import type { JournalEntry } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardStackProps {
  entries: JournalEntry[];
  onCardPress?: (entry: JournalEntry) => void;
}

const CardStackNative: React.FC<CardStackProps> = ({ entries, onCardPress }) => {
  // 최신 3개만 스택으로 표시
  const stackEntries = entries.slice(0, 3);

  const renderCardFront = (entry: JournalEntry) => (
    <View style={styles.cardContent}>
      {/* 날짜 */}
      <Text style={styles.date}>
        {new Date(entry.date).toLocaleDateString('ko-KR', {
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })}
      </Text>

      {/* 제목 */}
      {entry.title && (
        <Text style={styles.title} numberOfLines={2}>
          {entry.title}
        </Text>
      )}

      {/* 해시태그 */}
      {entry.hashtags && entry.hashtags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.hashtags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 힌트 텍스트 */}
      <Text style={styles.hint}>탭하여 상세보기</Text>
    </View>
  );

  const renderCardBack = (entry: JournalEntry) => (
    <View style={styles.cardContent}>
      {/* 수련 정보 */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>수련 시간</Text>
        <Text style={styles.detailValue}>{entry.duration || '-'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>강도</Text>
        <Text style={styles.detailValue}>
          {'⭐'.repeat(entry.intensity || 0)}
        </Text>
      </View>

      {/* 수련 자세 */}
      {entry.poses && entry.poses.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>자세</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {entry.poses.map((p) => p.name).join(', ')}
          </Text>
        </View>
      )}

      {/* 노트 (일부) */}
      {entry.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.detailLabel}>노트</Text>
          <Text style={styles.notesText} numberOfLines={3}>
            {entry.notes.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      )}

      <Text style={styles.hint}>탭하여 돌아가기</Text>
    </View>
  );

  if (stackEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 작성된 일지가 없습니다</Text>
        <Text style={styles.emptySubtext}>
          하단의 초록색 버튼을 눌러 기록을 시작하세요
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={SCREEN_WIDTH}
      decelerationRate="fast"
      contentContainerStyle={styles.scrollContent}
    >
      {stackEntries.map((entry, index) => (
        <View key={entry.id} style={styles.cardWrapper}>
          {/* 스택 효과를 위한 배경 카드들 */}
          {index < 2 && (
            <>
              <View
                style={[
                  styles.stackCard,
                  styles.stackCard1,
                  { opacity: 0.3 - index * 0.1 },
                ]}
              />
              <View
                style={[
                  styles.stackCard,
                  styles.stackCard2,
                  { opacity: 0.2 - index * 0.1 },
                ]}
              />
            </>
          )}

          {/* 메인 카드 */}
          <FlipCard
            front={renderCardFront(entry)}
            back={renderCardBack(entry)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: theme.spacing.lg,
  },
  cardWrapper: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 스택 배경 카드
  stackCard: {
    position: 'absolute',
    width: SCREEN_WIDTH - theme.spacing.xl * 2,
    height: 200,
    borderRadius: theme.borderRadius.card,
    backgroundColor: theme.colors.bg_card,
  },
  stackCard1: {
    top: -8,
    transform: [{ scale: 0.95 }],
  },
  stackCard2: {
    top: -16,
    transform: [{ scale: 0.9 }],
  },

  // 카드 내용
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.txt_primary,
    marginBottom: theme.spacing.sm,
  },

  // 태그
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(3, 199, 90, 0.15)',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // 상세 정보
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.txt_secondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.txt_primary,
    flex: 1,
    textAlign: 'right',
  },

  // 노트
  notesContainer: {
    marginTop: theme.spacing.xs,
  },
  notesText: {
    fontSize: 12,
    color: theme.colors.txt_secondary,
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },

  // 힌트
  hint: {
    fontSize: 11,
    color: theme.colors.txt_secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.txt_primary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.txt_secondary,
    textAlign: 'center',
  },
});

export default CardStackNative;
