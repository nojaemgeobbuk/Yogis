/**
 * Journal Edit Screen - 일지 수정
 *
 * 웹의 JournalForm 컴포넌트에 해당 (편집 모드)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { updateJournalEntry } from '../services/supabaseService';
import DatePickerNative from '../components/DatePickerNative';

type Props = RootStackScreenProps<'JournalEdit'>;

const JournalEditScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { entry } = route.params;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 폼 상태
  const [date, setDate] = useState(new Date(entry.date));
  const [title, setTitle] = useState(entry.title || '');
  const [notes, setNotes] = useState(entry.notes.replace(/<[^>]*>/g, ''));
  const [hashtags, setHashtags] = useState(entry.hashtags?.join(', ') || '');
  const [duration, setDuration] = useState(entry.duration || '');
  const [intensity, setIntensity] = useState(entry.intensity || 0);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // 저장
  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedEntry = {
        id: entry.id,
        date: date.toISOString(),
        title,
        notes,
        hashtags: hashtags.split(',').map((t) => t.trim()).filter(Boolean),
        duration,
        intensity,
      };

      await updateJournalEntry(updatedEntry);
      Alert.alert('성공', '일지가 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 강도 선택
  const IntensityPicker = () => (
    <View style={styles.intensityContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setIntensity(star)}>
          <Text style={[styles.star, intensity >= star && styles.starActive]}>
            ⭐
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* 날짜 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>날짜</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateButton, isDark && styles.inputDark]}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={[styles.dateButtonText, isDark && styles.textLight]}>
              📅 {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
            </Text>
          </TouchableOpacity>
        </View>

        {/* 제목 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>제목</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={title}
            onChangeText={setTitle}
            placeholder="수련 제목"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          />
        </View>

        {/* 노트 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>
            수련 노트
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, isDark && styles.inputDark]}
            value={notes}
            onChangeText={setNotes}
            placeholder="오늘의 수련은 어떠셨나요?"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* 시간 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>
            수련 시간
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={duration}
            onChangeText={setDuration}
            placeholder="예: 60분"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          />
        </View>

        {/* 강도 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>강도</Text>
          <IntensityPicker />
        </View>

        {/* 해시태그 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>
            해시태그
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={hashtags}
            onChangeText={setHashtags}
            placeholder="빈야사, 아침요가, 힐링"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          />
        </View>

        {/* 버튼들 */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 날짜 선택 모달 */}
      <DatePickerNative
        selectedDate={date}
        onSelectDate={setDate}
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
      />
    </KeyboardAvoidingView>
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

  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#292524',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  inputDark: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderColor: '#334155',
  },
  textArea: {
    height: 150,
    paddingTop: 14,
  },

  dateButton: {
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#292524',
  },

  intensityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 28,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },

  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e7e5e4',
  },
  cancelButtonText: {
    color: '#57534e',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0d9488',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  textLight: {
    color: '#e2e8f0',
  },
});

export default JournalEditScreen;
