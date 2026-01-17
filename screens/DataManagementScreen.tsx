/**
 * Data Management Screen - 데이터 관리
 *
 * 웹의 DataManagementModal에 해당
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getJournalEntries } from '../services/supabaseService';

const DataManagementScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(false);

  // JSON 백업 내보내기
  const handleExportJSON = async () => {
    setLoading(true);
    try {
      const entries = await getJournalEntries();
      const json = JSON.stringify(entries, null, 2);
      const fileName = `yoga_journal_backup_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: '일지 백업 내보내기',
        });
      } else {
        Alert.alert('성공', `파일이 저장되었습니다: ${fileName}`);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '내보내기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 마크다운 내보내기
  const handleExportMarkdown = async () => {
    setLoading(true);
    try {
      const entries = await getJournalEntries();
      let markdown = '# Yoga Journal Backup\n\n';

      entries.forEach((entry) => {
        const date = new Date(entry.date).toLocaleDateString('ko-KR');
        markdown += `## ${entry.title || date}\n`;
        markdown += `**날짜**: ${date}\n\n`;

        if (entry.duration) {
          markdown += `**수련 시간**: ${entry.duration}\n\n`;
        }

        if (entry.intensity) {
          markdown += `**강도**: ${'⭐'.repeat(entry.intensity)}\n\n`;
        }

        if (entry.notes) {
          markdown += `### 노트\n${entry.notes.replace(/<[^>]*>/g, '')}\n\n`;
        }

        if (entry.poses && entry.poses.length > 0) {
          markdown += `### 수련한 자세\n`;
          entry.poses.forEach((pose) => {
            markdown += `- ${pose.name} (${pose.sanskritName})\n`;
          });
          markdown += '\n';
        }

        if (entry.hashtags && entry.hashtags.length > 0) {
          markdown += `**태그**: ${entry.hashtags.map((t) => `#${t}`).join(' ')}\n`;
        }

        markdown += '\n---\n\n';
      });

      const fileName = `yoga_journal_${Date.now()}.md`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, markdown);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/markdown',
          dialogTitle: '일지 마크다운 내보내기',
        });
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '내보내기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const ActionButton = ({
    icon,
    title,
    subtitle,
    onPress,
    variant = 'default',
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    variant?: 'default' | 'danger';
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        isDark && styles.actionButtonDark,
        variant === 'danger' && styles.actionButtonDanger,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionContent}>
        <Text
          style={[
            styles.actionTitle,
            isDark && styles.textLight,
            variant === 'danger' && styles.actionTitleDanger,
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, isDark && styles.textMuted]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      )}

      {/* 내보내기 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          내보내기
        </Text>

        <ActionButton
          icon="📦"
          title="JSON 백업 내보내기"
          subtitle="모든 데이터를 JSON 형식으로 저장"
          onPress={handleExportJSON}
        />

        <ActionButton
          icon="📝"
          title="마크다운으로 내보내기"
          subtitle="읽기 쉬운 마크다운 문서로 변환"
          onPress={handleExportMarkdown}
        />
      </View>

      {/* 복원 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          복원
        </Text>

        <ActionButton
          icon="📥"
          title="백업에서 복원"
          subtitle="JSON 백업 파일에서 데이터 복원"
          onPress={() =>
            Alert.alert('준비 중', '복원 기능이 준비 중입니다.')
          }
        />
      </View>

      {/* 위험 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          위험 영역
        </Text>

        <ActionButton
          icon="⚠️"
          title="모든 데이터 삭제"
          subtitle="이 작업은 되돌릴 수 없습니다"
          variant="danger"
          onPress={() =>
            Alert.alert(
              '경고',
              '정말로 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: () =>
                    Alert.alert('알림', '데이터 삭제 기능이 준비 중입니다.'),
                },
              ]
            )
          }
        />
      </View>

      <Text style={[styles.notice, isDark && styles.textMuted]}>
        💡 정기적인 백업을 권장합니다. 백업 파일은 안전한 곳에 보관하세요.
      </Text>
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
    padding: 20,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 16,
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonDark: {
    backgroundColor: '#1e293b',
  },
  actionButtonDanger: {
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
    marginBottom: 4,
  },
  actionTitleDanger: {
    color: '#ef4444',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#78716c',
  },

  notice: {
    fontSize: 13,
    color: '#78716c',
    textAlign: 'center',
    lineHeight: 20,
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default DataManagementScreen;
