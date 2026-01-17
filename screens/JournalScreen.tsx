/**
 * Journal Screen - 일지 목록 및 작성
 *
 * 웹의 App.tsx "/" 라우트에 해당
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  useColorScheme,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { MainTabScreenProps } from '../navigation/types';
import type { JournalEntry } from '../types';
import {
  getJournalEntries,
  deleteJournalEntry,
  deleteImage,
} from '../services/supabaseService';
import CardStackNative from '../components/CardStackNative';
import { theme } from '../theme';

// 타입 정의
type Props = MainTabScreenProps<'Journal'>;

const JournalScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // 상태
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'stack' | 'list'>('stack'); // 카드 스택 or 리스트

  // 데이터 로드
  const loadEntries = useCallback(async () => {
    try {
      const fetchedEntries = await getJournalEntries();
      setEntries(fetchedEntries || []);
    } catch (error) {
      console.error('Failed to load entries:', error);
      Alert.alert('오류', '일지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, [loadEntries]);

  // 검색 필터
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.notes.toLowerCase().includes(query) ||
        entry.hashtags?.some((tag) => tag.toLowerCase().includes(query)) ||
        entry.poses?.some(
          (pose) =>
            pose.name.toLowerCase().includes(query) ||
            pose.sanskritName.toLowerCase().includes(query)
        )
    );
  }, [entries, searchQuery]);

  // 일지 삭제
  const handleDelete = useCallback(
    async (entry: JournalEntry) => {
      Alert.alert('삭제 확인', '이 일지를 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 사진 삭제
              if (entry.photos?.length > 0) {
                await Promise.all(entry.photos.map((p) => deleteImage(p.url)));
              }
              // 일지 삭제
              await deleteJournalEntry(entry.id);
              setEntries((prev) => prev.filter((e) => e.id !== entry.id));
            } catch (error) {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]);
    },
    []
  );

  // 일지 카드 렌더링
  const renderItem = useCallback(
    ({ item }: { item: JournalEntry }) => (
      <TouchableOpacity
        style={[styles.card, isDark && styles.cardDark]}
        onPress={() => navigation.navigate('JournalDetail', { entry: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardDate, isDark && styles.textLight]}>
            {new Date(item.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {item.is_favorite && <Text style={styles.favoriteIcon}>⭐</Text>}
        </View>

        {item.title && (
          <Text
            style={[styles.cardTitle, isDark && styles.textLight]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        )}

        {item.hashtags && item.hashtags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.hashtags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, isDark && styles.tagDark]}>
                <Text style={[styles.tagText, isDark && styles.tagTextDark]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('JournalEdit', { entry: item })}
          >
            <Text style={styles.iconButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.iconButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [isDark, navigation, handleDelete]
  );

  // 테마 스타일
  const themedStyles = {
    container: [
      styles.container,
      { paddingTop: insets.top },
      isDark && styles.containerDark,
    ],
    searchInput: [styles.searchInput, isDark && styles.searchInputDark],
  };

  return (
    <View style={themedStyles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>
          Yoga Journal
        </Text>
        <Text style={[styles.headerSubtitle, isDark && styles.textMuted]}>
          나만의 수련과 성장을 위한 공간
        </Text>
      </View>

      {/* 검색바 & 보기 모드 전환 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[themedStyles.searchInput, { flex: 1 }]}
          placeholder="일지 검색..."
          placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.viewModeSwitch}>
          <Text style={[styles.viewModeLabel, isDark && styles.textMuted]}>
            {viewMode === 'stack' ? '📚' : '📝'}
          </Text>
          <Switch
            value={viewMode === 'stack'}
            onValueChange={(value) => setViewMode(value ? 'stack' : 'list')}
            trackColor={{ false: '#3D3D3D', true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 카드 스택 또는 리스트 */}
      {viewMode === 'stack' ? (
        <CardStackNative entries={filteredEntries} />
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDark && styles.textMuted]}>
                {loading ? '로딩 중...' : '아직 작성된 일지가 없습니다.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg_main, // #121212
  },
  containerDark: {
    backgroundColor: theme.colors.bg_main,
  },

  // 헤더
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.txt_primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.txt_secondary,
    marginTop: 4,
  },

  // 검색 & 보기 모드
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewModeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeLabel: {
    fontSize: 18,
  },
  searchInput: {
    backgroundColor: theme.colors.bg_card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.txt_primary,
    borderWidth: 1,
    borderColor: theme.colors.border_light,
  },
  searchInputDark: {
    backgroundColor: theme.colors.bg_card,
    color: theme.colors.txt_primary,
    borderColor: theme.colors.border_light,
  },

  // 리스트
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // 카드
  card: {
    backgroundColor: theme.colors.bg_card,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  cardDark: {
    backgroundColor: theme.colors.bg_card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 13,
    color: theme.colors.txt_secondary,
    fontWeight: '500',
  },
  favoriteIcon: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.txt_primary,
    marginBottom: 8,
  },

  // 태그
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(3, 199, 90, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagDark: {
    backgroundColor: 'rgba(3, 199, 90, 0.15)',
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tagTextDark: {
    color: theme.colors.primary,
  },

  // 카드 푸터
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border_light,
    paddingTop: 12,
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  iconButtonText: {
    fontSize: 18,
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.txt_secondary,
  },

  // 텍스트 스타일
  textLight: {
    color: theme.colors.txt_primary,
  },
  textMuted: {
    color: theme.colors.txt_secondary,
  },
});

export default JournalScreen;
