/**
 * Settings Screen - 설정
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../services/authService';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, isDark && styles.settingItemDark]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, isDark && styles.textLight]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, isDark && styles.textMuted]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (showArrow && <Text style={styles.arrow}>›</Text>)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      {/* 계정 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          계정
        </Text>
        <SettingItem
          icon="👤"
          title="프로필 설정"
          subtitle="이름, 프로필 사진 변경"
          onPress={() => Alert.alert('준비 중', '프로필 설정 기능이 준비 중입니다.')}
        />
        <SettingItem
          icon="🔑"
          title="비밀번호 변경"
          onPress={() => Alert.alert('준비 중', '비밀번호 변경 기능이 준비 중입니다.')}
        />
      </View>

      {/* 앱 설정 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          앱 설정
        </Text>
        <SettingItem
          icon="🔔"
          title="알림 설정"
          subtitle="수련 리마인더 설정"
          onPress={() => Alert.alert('준비 중', '알림 설정 기능이 준비 중입니다.')}
        />
        <SettingItem
          icon="🌙"
          title="다크 모드"
          subtitle="시스템 설정 따름"
          showArrow={false}
          rightElement={
            <Switch
              value={isDark}
              disabled
              trackColor={{ false: '#d6d3d1', true: '#5eead4' }}
              thumbColor={isDark ? '#0d9488' : '#ffffff'}
            />
          }
        />
      </View>

      {/* 데이터 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          데이터
        </Text>
        <SettingItem
          icon="💾"
          title="데이터 관리"
          subtitle="백업, 복원, 내보내기"
          onPress={() => navigation.navigate('DataManagement' as never)}
        />
        <SettingItem
          icon="🗑️"
          title="캐시 삭제"
          onPress={() =>
            Alert.alert('캐시 삭제', '캐시가 삭제되었습니다.', [{ text: '확인' }])
          }
        />
      </View>

      {/* 정보 섹션 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>
          정보
        </Text>
        <SettingItem
          icon="ℹ️"
          title="앱 버전"
          subtitle="1.0.0"
          showArrow={false}
        />
        <SettingItem
          icon="📄"
          title="이용약관"
          onPress={() => Alert.alert('준비 중', '이용약관 페이지가 준비 중입니다.')}
        />
        <SettingItem
          icon="🔒"
          title="개인정보 처리방침"
          onPress={() => Alert.alert('준비 중', '개인정보 처리방침 페이지가 준비 중입니다.')}
        />
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={[styles.footer, isDark && styles.textMuted]}>
        Created with passion for mindfulness and technology.
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
    paddingBottom: 40,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  settingItemDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#0f172a',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#292524',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#78716c',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#a8a29e',
    fontWeight: '300',
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a8a29e',
    marginTop: 32,
    paddingHorizontal: 20,
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default SettingsScreen;
