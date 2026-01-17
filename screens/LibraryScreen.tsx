/**
 * Library Screen - 자세 도서관
 *
 * 웹의 PoseBookshelf 컴포넌트에 해당
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import type { YogaPose } from '../types';
import { ALL_POSES } from '../yogaPoses';

type Props = MainTabScreenProps<'Library'>;

const DIFFICULTY_COLORS = {
  Beginner: { bg: '#dcfce7', text: '#166534' },
  Intermediate: { bg: '#fef9c3', text: '#854d0e' },
  Advanced: { bg: '#fee2e2', text: '#991b1b' },
};

const LibraryScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // 필터링된 자세 목록
  const filteredPoses = useMemo(() => {
    return ALL_POSES.filter((pose) => {
      const matchesSearch =
        !searchQuery ||
        pose.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pose.sanskritName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        !selectedDifficulty || pose.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, selectedDifficulty]);

  // 난이도 필터 버튼
  const DifficultyFilter = () => (
    <View style={styles.filterContainer}>
      {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.filterButton,
            selectedDifficulty === level && styles.filterButtonActive,
            isDark && styles.filterButtonDark,
          ]}
          onPress={() =>
            setSelectedDifficulty(selectedDifficulty === level ? null : level)
          }
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedDifficulty === level && styles.filterButtonTextActive,
            ]}
          >
            {level === 'Beginner'
              ? '초급'
              : level === 'Intermediate'
              ? '중급'
              : '고급'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 자세 카드 렌더링
  const renderPose = ({ item }: { item: YogaPose }) => {
    const difficultyStyle = DIFFICULTY_COLORS[item.difficulty];

    return (
      <TouchableOpacity
        style={[styles.poseCard, isDark && styles.poseCardDark]}
        activeOpacity={0.7}
      >
        {/* 아이콘 영역 */}
        <View style={[styles.poseIconContainer, isDark && styles.poseIconContainerDark]}>
          <Text style={styles.poseIconPlaceholder}>🧘</Text>
        </View>

        {/* 정보 영역 */}
        <View style={styles.poseInfo}>
          <Text style={[styles.poseName, isDark && styles.textLight]}>
            {item.name}
          </Text>
          <Text style={[styles.poseSanskrit, isDark && styles.textMuted]}>
            {item.sanskritName}
          </Text>

          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyStyle.bg },
            ]}
          >
            <Text style={[styles.difficultyText, { color: difficultyStyle.text }]}>
              {item.difficulty === 'Beginner'
                ? '초급'
                : item.difficulty === 'Intermediate'
                ? '중급'
                : '고급'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          자세 도서관
        </Text>
        <Text style={[styles.headerSubtitle, isDark && styles.textMuted]}>
          {ALL_POSES.length}개의 요가 자세
        </Text>
      </View>

      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="자세 검색..."
          placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 난이도 필터 */}
      <DifficultyFilter />

      {/* 자세 목록 */}
      <FlatList
        data={filteredPoses}
        renderItem={renderPose}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.textMuted]}>
              검색 결과가 없습니다.
            </Text>
          </View>
        }
      />
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
  headerSubtitle: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 4,
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#292524',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  searchInputDark: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderColor: '#334155',
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e7e5e4',
  },
  filterButtonDark: {
    backgroundColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#0d9488',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534e',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },

  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },

  poseCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    margin: 8,
    maxWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  poseCardDark: {
    backgroundColor: '#1e293b',
  },

  poseIconContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  poseIconContainerDark: {
    backgroundColor: '#0f172a',
  },
  poseIconPlaceholder: {
    fontSize: 40,
  },

  poseInfo: {
    alignItems: 'flex-start',
  },
  poseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 2,
  },
  poseSanskrit: {
    fontSize: 11,
    color: '#78716c',
    marginBottom: 8,
  },

  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#78716c',
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default LibraryScreen;
