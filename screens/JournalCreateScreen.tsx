/**
 * Journal Create Screen - 새 일지 작성
 *
 * Native Stack으로 표시되는 일지 작성 화면
 * 웹의 JournalForm 컴포넌트에 해당
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import type { PhotoEntry, YogaPose } from '../types';
import { addJournalEntry, uploadImage } from '../services/supabaseService';
import { supabase } from '../services/supabaseService';
import { pickImage, isNativePlatform } from '../services/cameraService';
import { ALL_POSES } from '../yogaPoses';
import DatePickerNative from '../components/DatePickerNative';

type Props = RootStackScreenProps<'JournalCreate'>;

const INSPIRATIONAL_QUOTES = [
  "당신의 발이 있는 곳에 존재하세요.",
  "평온을 들이마시고, 긴장을 내쉬세요.",
  "가장 깊은 지혜는 고요함 속에 있습니다.",
];

const JournalCreateScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 폼 상태
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(0);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [poseQuery, setPoseQuery] = useState('');
  const [showPoseSuggestions, setShowPoseSuggestions] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const todaysQuote = useMemo(
    () => INSPIRATIONAL_QUOTES[new Date().getDate() % INSPIRATIONAL_QUOTES.length],
    []
  );

  // 자세 검색 필터
  const filteredPoses = useMemo(() => {
    if (!poseQuery.trim()) return [];
    const query = poseQuery.toLowerCase();
    return ALL_POSES.filter(
      (pose) =>
        pose.name.toLowerCase().includes(query) ||
        pose.sanskritName.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [poseQuery]);

  // 사진 추가
  const handleAddPhoto = async () => {
    if (photos.length >= 2) {
      Alert.alert('알림', '사진은 최대 2장까지 추가할 수 있습니다.');
      return;
    }

    try {
      const imageFile = await pickImage();
      if (!imageFile) return;

      let previewUrl: string;
      if (imageFile instanceof File) {
        previewUrl = URL.createObjectURL(imageFile);
      } else {
        previewUrl = imageFile.uri;
      }

      setPhotos((prev) => [...prev, { url: previewUrl, file: imageFile }]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '사진을 추가할 수 없습니다.');
    }
  };

  // 사진 삭제
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // 자세 추가
  const addPose = (pose: YogaPose) => {
    if (!poses.some((p) => p.name === pose.name)) {
      setPoses((prev) => [...prev, pose]);
    }
    setPoseQuery('');
    setShowPoseSuggestions(false);
  };

  // 자세 삭제
  const removePose = (poseName: string) => {
    setPoses((prev) => prev.filter((p) => p.name !== poseName));
  };

  // 저장
  const handleSave = async () => {
    if (!notes.trim() && photos.length === 0 && !title.trim()) {
      Alert.alert('알림', '제목, 사진, 또는 노트 중 하나는 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // 사진 업로드
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (photo.file) {
            const publicUrl = await uploadImage(photo.file, user.id);
            if (!publicUrl) throw new Error('이미지 업로드 실패');
            return { ...photo, url: publicUrl, file: undefined };
          }
          return photo;
        })
      );

      // 일지 저장
      const entry = {
        user_id: user.id,
        date: date.toISOString(),
        title,
        notes,
        hashtags: hashtags.split(',').map((t) => t.trim()).filter(Boolean),
        duration,
        intensity,
        photos: processedPhotos as PhotoEntry[],
        poses,
      };

      const result = await addJournalEntry(entry);
      if (result) {
        Alert.alert('성공', '일지가 저장되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 오늘의 명언 */}
        <View style={[styles.quoteCard, isDark && styles.quoteCardDark]}>
          <Text style={[styles.quoteText, isDark && styles.quoteTextDark]}>
            "{todaysQuote}"
          </Text>
        </View>

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
            placeholder="예: 상쾌한 아침 빈야사"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          />
        </View>

        {/* 사진 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>
            사진 (최대 2장)
          </Text>
          <View style={styles.photosRow}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo.url }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.photoRemoveBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 2 && (
              <TouchableOpacity
                style={[styles.addPhotoBtn, isDark && styles.addPhotoBtnDark]}
                onPress={handleAddPhoto}
              >
                <Text style={styles.addPhotoBtnIcon}>📷</Text>
                <Text style={[styles.addPhotoBtnText, isDark && styles.textMuted]}>
                  추가
                </Text>
              </TouchableOpacity>
            )}
          </View>
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

        {/* 수련 시간 & 강도 */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, isDark && styles.textLight]}>시간</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={duration}
              onChangeText={setDuration}
              placeholder="예: 60분"
              placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
            />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, isDark && styles.textLight]}>강도</Text>
            <View style={styles.intensityRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setIntensity(star)}>
                  <Text style={[styles.star, intensity >= star && styles.starActive]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 자세 검색 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>
            수련한 자세
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={poseQuery}
            onChangeText={(text) => {
              setPoseQuery(text);
              setShowPoseSuggestions(true);
            }}
            placeholder="자세 이름 검색..."
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
            onFocus={() => setShowPoseSuggestions(true)}
          />

          {/* 자세 추천 목록 */}
          {showPoseSuggestions && filteredPoses.length > 0 && (
            <View style={[styles.suggestions, isDark && styles.suggestionsDark]}>
              {filteredPoses.map((pose) => (
                <TouchableOpacity
                  key={pose.name}
                  style={styles.suggestionItem}
                  onPress={() => addPose(pose)}
                >
                  <Text style={[styles.suggestionName, isDark && styles.textLight]}>
                    {pose.name}
                  </Text>
                  <Text style={[styles.suggestionSanskrit, isDark && styles.textMuted]}>
                    {pose.sanskritName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 선택된 자세들 */}
          {poses.length > 0 && (
            <View style={styles.selectedPoses}>
              {poses.map((pose) => (
                <TouchableOpacity
                  key={pose.name}
                  style={[styles.poseTag, isDark && styles.poseTagDark]}
                  onPress={() => removePose(pose.name)}
                >
                  <Text style={[styles.poseTagText, isDark && styles.poseTagTextDark]}>
                    {pose.name} ✕
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 해시태그 */}
        <View style={styles.field}>
          <Text style={[styles.label, isDark && styles.textLight]}>해시태그</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={hashtags}
            onChangeText={setHashtags}
            placeholder="빈야사, 아침요가, 힐링"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
          />
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>일지 저장하기</Text>
          )}
        </TouchableOpacity>
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
    paddingBottom: 40,
  },

  quoteCard: {
    backgroundColor: '#ccfbf1',
    borderLeftWidth: 4,
    borderLeftColor: '#0d9488',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quoteCardDark: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  quoteText: {
    fontStyle: 'italic',
    fontSize: 15,
    color: '#0f766e',
    lineHeight: 22,
  },
  quoteTextDark: {
    color: '#5eead4',
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

  row: {
    flexDirection: 'row',
  },

  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  star: {
    fontSize: 24,
    marginRight: 4,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },

  photosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d6d3d1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtnDark: {
    borderColor: '#475569',
  },
  addPhotoBtnIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  addPhotoBtnText: {
    fontSize: 12,
    color: '#78716c',
  },

  suggestions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
  },
  suggestionsDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#292524',
  },
  suggestionSanskrit: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 2,
  },

  selectedPoses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
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

  saveButton: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
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

export default JournalCreateScreen;
