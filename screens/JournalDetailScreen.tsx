/**
 * Journal Detail Screen - 일지 상세 보기
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'JournalDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const JournalDetailScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { entry } = route.params;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      {/* 헤더 정보 */}
      <View style={styles.header}>
        <Text style={[styles.date, isDark && styles.textMuted]}>
          {formatDate(entry.date)}
        </Text>
        {entry.title && (
          <Text style={[styles.title, isDark && styles.textLight]}>
            {entry.title}
          </Text>
        )}

        {/* 메타 정보 */}
        <View style={styles.metaRow}>
          {entry.duration && (
            <View style={[styles.metaItem, isDark && styles.metaItemDark]}>
              <Text style={styles.metaIcon}>⏱</Text>
              <Text style={[styles.metaText, isDark && styles.textMuted]}>
                {entry.duration}
              </Text>
            </View>
          )}
          {entry.intensity && (
            <View style={[styles.metaItem, isDark && styles.metaItemDark]}>
              <Text style={styles.metaIcon}>{'⭐'.repeat(entry.intensity)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 사진 */}
      {entry.photos && entry.photos.length > 0 && (
        <View style={styles.photosSection}>
          {entry.photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image
                source={{ uri: photo.url }}
                style={styles.photo}
                resizeMode="cover"
              />
              {photo.caption && (
                <Text style={[styles.photoCaption, isDark && styles.textMuted]}>
                  {photo.caption}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 노트 */}
      {entry.notes && (
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            수련 노트
          </Text>
          <Text style={[styles.notes, isDark && styles.textLight]}>
            {entry.notes.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      )}

      {/* 수련한 자세 */}
      {entry.poses && entry.poses.length > 0 && (
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            수련한 자세
          </Text>
          <View style={styles.posesContainer}>
            {entry.poses.map((pose, index) => (
              <View key={index} style={[styles.poseTag, isDark && styles.poseTagDark]}>
                <Text style={[styles.poseTagText, isDark && styles.poseTagTextDark]}>
                  {pose.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 해시태그 */}
      {entry.hashtags && entry.hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {entry.hashtags.map((tag, index) => (
            <Text key={index} style={[styles.hashtag, isDark && styles.hashtagDark]}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {/* 수정 버튼 */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('JournalEdit', { entry })}
      >
        <Text style={styles.editButtonText}>수정하기</Text>
      </TouchableOpacity>
    </ScrollView>
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
  content: {
    paddingBottom: 40,
  },

  header: {
    padding: 20,
  },
  date: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#292524',
    marginBottom: 16,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaItemDark: {
    backgroundColor: '#1e293b',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#57534e',
  },

  photosSection: {
    marginBottom: 20,
  },
  photoContainer: {
    marginBottom: 12,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  photoCaption: {
    padding: 12,
    fontSize: 14,
    color: '#78716c',
    fontStyle: 'italic',
  },

  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionDark: {
    backgroundColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 12,
  },
  notes: {
    fontSize: 15,
    lineHeight: 24,
    color: '#44403c',
  },

  posesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poseTag: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  poseTagDark: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
  },
  poseTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  poseTagTextDark: {
    color: '#5eead4',
  },

  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  hashtag: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '500',
  },
  hashtagDark: {
    color: '#5eead4',
  },

  editButton: {
    marginHorizontal: 20,
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default JournalDetailScreen;
