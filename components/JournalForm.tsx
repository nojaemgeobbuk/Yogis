import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path, Circle } from 'react-native-svg';
import type { JournalEntry, PhotoEntry } from '../types';
import DatePicker from './DatePicker';

// Import extracted hooks
import { useJournalForm, usePhotoHandling } from '../hooks';

// --- Icon Components ---
const XIcon = ({ size = 16, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Svg>
);

const CalendarIcon = ({ size = 16, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
    <Path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" />
  </Svg>
);

const ClockIcon = ({ size = 16, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
    <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
  </Svg>
);

const PhotoIcon = ({ size = 24, color = '#888' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </Svg>
);

const SearchIcon = ({ size = 20, color = '#888' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </Svg>
);

// Mood/Intensity Options
const moodOptions = [
  { value: 1, icon: '🌱', label: 'Gentle', color: '#86efac' },
  { value: 2, icon: '🌿', label: 'Light', color: '#4ade80' },
  { value: 3, icon: '🧘', label: 'Balanced', color: '#CCFF00' },
  { value: 4, icon: '🔥', label: 'Intense', color: '#fb923c' },
  { value: 5, icon: '⚡', label: 'Power', color: '#FF0055' },
];

interface JournalFormProps {
  userId: string;
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'user_id'>) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onCancelEdit: () => void;
  entryToEdit: JournalEntry | null;
}

const JournalForm: React.FC<JournalFormProps> = ({
  userId,
  onAddEntry,
  entryToEdit,
  onUpdateEntry,
  onCancelEdit,
}) => {
  // Use extracted hooks
  const form = useJournalForm(entryToEdit);
  const photoHandler = usePhotoHandling(entryToEdit?.photos || []);

  // Sync photos when entryToEdit changes
  useEffect(() => {
    if (entryToEdit) {
      photoHandler.setPhotos(entryToEdit.photos);
    } else {
      photoHandler.resetPhotos();
    }
  }, [entryToEdit]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (photoHandler.isUploading) return;

    const isNoteEmpty = form.formState.notes.trim().length === 0;

    if (isNoteEmpty && photoHandler.photos.length === 0 && !form.formState.title.trim()) {
      Alert.alert('알림', '제목, 사진, 또는 노트 중 하나는 입력해주세요.');
      return;
    }

    try {
      // Upload photos and get processed photos with URLs
      const processedPhotos = await photoHandler.uploadPhotos(userId);

      // Get form data and add photos
      const formData = form.getFormData();
      const commonData = {
        ...formData,
        photos: processedPhotos,
      };

      if (entryToEdit) {
        onUpdateEntry({ ...entryToEdit, ...commonData });
      } else {
        onAddEntry(commonData);
      }

      form.setIsSuccess(true);
      setTimeout(() => {
        form.setIsSuccess(false);
        if (!entryToEdit) {
          form.resetForm();
          photoHandler.resetPhotos();
        }
      }, 2000);
    } catch (error: any) {
      console.error('저장 중 에러 발생:', error);
      Alert.alert('오류', error.message || '저장 중 문제가 발생했습니다.');
    }
  }, [form, photoHandler, userId, entryToEdit, onAddEntry, onUpdateEntry]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.formCard}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>
            {entryToEdit ? 'Edit Session' : 'Studio Session'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {entryToEdit ? 'Remix your track' : 'Record your practice'}
          </Text>
        </MotiView>

        {/* Inspirational Quote */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 200 }}
          style={styles.quoteContainer}
        >
          <Text style={styles.quoteText}>"{form.todaysQuote}"</Text>
        </MotiView>

        {/* Track Title */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.inputSection}
        >
          <Text style={styles.label}>Track Title</Text>
          <TextInput
            value={form.formState.title}
            onChangeText={form.setTitle}
            placeholder="Morning Flow..."
            placeholderTextColor="#666"
            style={styles.titleInput}
          />
        </MotiView>

        {/* Track Metadata */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          style={styles.inputSection}
        >
          <Text style={styles.label}>Track Metadata</Text>
          <View style={styles.metadataRow}>
            {/* Date Pill */}
            <MotiPressable
              onPress={() => form.setDatePickerOpen(!form.isDatePickerOpen)}
              animate={({ pressed }) => ({
                'worklet': true,
                scale: pressed ? 0.98 : 1,
              })}
              style={styles.metadataPill}
            >
              <CalendarIcon size={16} color="#aaa" />
              <Text style={styles.metadataPillText}>{form.formattedDate}</Text>
            </MotiPressable>

            {/* Duration Pill */}
            <View style={styles.metadataPill}>
              <ClockIcon size={16} color="#aaa" />
              <TextInput
                value={form.formState.duration}
                onChangeText={form.setDuration}
                placeholder="60 min"
                placeholderTextColor="#666"
                style={styles.metadataInput}
              />
            </View>
          </View>

          {/* Hashtags */}
          <View style={[styles.metadataPill, { marginTop: 12, flex: 1 }]}>
            <Text style={styles.hashtagSymbol}>#</Text>
            <TextInput
              value={form.formState.hashtags}
              onChangeText={form.setHashtags}
              placeholder="vinyasa, morning, healing"
              placeholderTextColor="#666"
              style={[styles.metadataInput, { flex: 1 }]}
            />
          </View>
        </MotiView>

        {/* Album Art (Photos) */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          style={styles.inputSection}
        >
          <Text style={styles.label}>
            Album Art <Text style={styles.labelHint}>(max {photoHandler.maxPhotos})</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
            <AnimatePresence>
              {photoHandler.photos.map((photo, index) => (
                <MotiView
                  key={photo.url}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={styles.photoContainer}
                >
                  <Image source={{ uri: photo.url }} style={styles.photoImage} />
                  <Pressable
                    onPress={() => photoHandler.handleRemovePhoto(index)}
                    style={styles.photoRemoveBtn}
                  >
                    <XIcon size={12} color="#fff" />
                  </Pressable>
                </MotiView>
              ))}
            </AnimatePresence>

            {photoHandler.canAddMorePhotos && (
              <MotiPressable
                onPress={photoHandler.handleNativeImagePick}
                animate={({ pressed }) => ({
                  'worklet': true,
                  scale: pressed ? 0.95 : 1,
                })}
                style={styles.addPhotoBtn}
              >
                <PhotoIcon size={24} color="#888" />
                <Text style={styles.addPhotoBtnText}>Add</Text>
              </MotiPressable>
            )}
          </ScrollView>
        </MotiView>

        {/* Liner Notes */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          style={styles.inputSection}
        >
          <Text style={styles.label}>Liner Notes</Text>
          <TextInput
            value={form.formState.notes}
            onChangeText={form.setNotes}
            placeholder="How was your practice today? Write your thoughts..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            textAlignVertical="top"
          />
        </MotiView>

        {/* Vibe / Intensity */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700 }}
          style={styles.inputSection}
        >
          <Text style={styles.label}>Vibe / Intensity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {moodOptions.map((mood) => {
              const isSelected = form.formState.intensity === mood.value;
              return (
                <MotiPressable
                  key={mood.value}
                  onPress={() => form.setIntensity(mood.value)}
                  animate={({ pressed }) => ({
                    'worklet': true,
                    scale: pressed ? 0.95 : 1,
                  })}
                  style={[
                    styles.moodButton,
                    isSelected && {
                      borderColor: mood.color,
                      backgroundColor: `${mood.color}20`,
                    },
                  ]}
                >
                  <Text style={styles.moodIcon}>{mood.icon}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && { color: mood.color },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </MotiPressable>
              );
            })}
          </ScrollView>
        </MotiView>

        {/* Featured Poses */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 800 }}
          style={styles.inputSection}
        >
          <Text style={styles.label}>Featured Poses (Asanas)</Text>
          <View style={styles.poseSearchRow}>
            <View style={styles.poseSearchContainer}>
              <SearchIcon size={18} color="#888" />
              <TextInput
                value={form.poseQuery}
                onChangeText={(text) => {
                  form.setPoseQuery(text);
                  form.setShowPoseSuggestions(true);
                }}
                onFocus={() => form.setShowPoseSuggestions(true)}
                placeholder="Search poses..."
                placeholderTextColor="#666"
                style={styles.poseSearchInput}
              />
            </View>
            <MotiPressable
              onPress={() => form.setManualFormOpen(!form.isManualFormOpen)}
              animate={({ pressed }) => ({
                'worklet': true,
                scale: pressed ? 0.95 : 1,
              })}
              style={styles.customPoseBtn}
            >
              <Text style={styles.customPoseBtnText}>+ Custom</Text>
            </MotiPressable>
          </View>

          {/* Pose Suggestions */}
          <AnimatePresence>
            {form.showPoseSuggestions && form.poseQuery && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                style={styles.poseSuggestionsList}
              >
                {form.filteredPoses.length > 0 ? (
                  form.filteredPoses.slice(0, 5).map((pose) => (
                    <Pressable
                      key={pose.name}
                      onPress={() => form.addPoseToEntry(pose)}
                      style={styles.poseSuggestionItem}
                    >
                      <Text style={styles.poseSuggestionName}>{pose.name}</Text>
                      <Text style={styles.poseSuggestionSanskrit}>{pose.sanskritName}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.noResultsText}>No results found</Text>
                )}
              </MotiView>
            )}
          </AnimatePresence>

          {/* Selected Poses Tags */}
          <View style={styles.selectedPosesContainer}>
            <AnimatePresence>
              {form.formState.poses.map((pose) => (
                <MotiView
                  key={pose.name}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={styles.poseTag}
                >
                  <Text style={styles.poseTagText}>{pose.name}</Text>
                  <Pressable
                    onPress={() => form.handleRemovePose(pose.name)}
                    style={styles.poseTagRemove}
                  >
                    <XIcon size={12} color="#d4a3ff" />
                  </Pressable>
                </MotiView>
              ))}
            </AnimatePresence>
          </View>

          {/* Manual Pose Form */}
          <AnimatePresence>
            {form.isManualFormOpen && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={styles.manualPoseForm}
              >
                <Text style={styles.manualPoseTitle}>Add Custom Pose</Text>
                <View style={styles.manualPoseInputs}>
                  <TextInput
                    placeholder="Pose name"
                    placeholderTextColor="#666"
                    value={form.manualPose.name}
                    onChangeText={(text) => form.setManualPose((prev) => ({ ...prev, name: text }))}
                    style={styles.manualPoseInput}
                  />
                  <TextInput
                    placeholder="Sanskrit name"
                    placeholderTextColor="#666"
                    value={form.manualPose.sanskritName}
                    onChangeText={(text) => form.setManualPose((prev) => ({ ...prev, sanskritName: text }))}
                    style={styles.manualPoseInput}
                  />
                </View>
                <MotiPressable
                  onPress={form.handleAddManualPose}
                  animate={({ pressed }) => ({
                    'worklet': true,
                    scale: pressed ? 0.98 : 1,
                  })}
                  style={styles.manualPoseSubmitBtn}
                >
                  <Text style={styles.manualPoseSubmitText}>Add to List</Text>
                </MotiPressable>
              </MotiView>
            )}
          </AnimatePresence>
        </MotiView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <MotiPressable
            onPress={handleSubmit}
            disabled={form.isSuccess || photoHandler.isUploading}
            animate={({ pressed }) => ({
              'worklet': true,
              scale: pressed ? 0.98 : 1,
            })}
            style={[
              styles.submitButton,
              form.isSuccess && styles.submitButtonSuccess,
            ]}
          >
            {photoHandler.isUploading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Recording...</Text>
              </>
            ) : form.isSuccess ? (
              <>
                <Text style={styles.submitButtonIcon}>✓</Text>
                <Text style={styles.submitButtonText}>Released!</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonIcon}>{entryToEdit ? '▶' : '●'}</Text>
                <Text style={styles.submitButtonText}>
                  {entryToEdit ? 'Save Edit' : 'Release Track'}
                </Text>
              </>
            )}
          </MotiPressable>

          {entryToEdit && (
            <MotiPressable
              onPress={onCancelEdit}
              disabled={photoHandler.isUploading}
              animate={({ pressed }) => ({
                'worklet': true,
                scale: pressed ? 0.95 : 1,
              })}
              style={styles.cancelButton}
            >
              <XIcon size={20} color="#888" />
            </MotiPressable>
          )}
        </View>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121216',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: 'rgba(28, 28, 34, 0.85)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  quoteContainer: {
    backgroundColor: 'rgba(162, 56, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(162, 56, 255, 0.2)',
  },
  quoteText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  labelHint: {
    fontWeight: '400',
    textTransform: 'none',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metadataPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 50, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  metadataPillText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  metadataInput: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    minWidth: 60,
  },
  hashtagSymbol: {
    color: '#A238FF',
    fontSize: 14,
    fontWeight: '600',
  },
  photoRow: {
    flexDirection: 'row',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photoImage: {
    width: 112,
    height: 112,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF0055',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 112,
    height: 112,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(40, 40, 50, 0.5)',
  },
  addPhotoBtnText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  notesInput: {
    backgroundColor: 'rgba(18, 18, 22, 0.6)',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 120,
  },
  moodButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(40, 40, 50, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  moodIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  poseSearchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  poseSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 50, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  poseSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    paddingVertical: 12,
  },
  customPoseBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#A238FF',
  },
  customPoseBtnText: {
    color: '#A238FF',
    fontSize: 14,
    fontWeight: '500',
  },
  poseSuggestionsList: {
    backgroundColor: 'rgba(40, 40, 50, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
    maxHeight: 200,
  },
  poseSuggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  poseSuggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  poseSuggestionSanskrit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  noResultsText: {
    padding: 16,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  selectedPosesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(162, 56, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(162, 56, 255, 0.4)',
    gap: 6,
  },
  poseTagText: {
    fontSize: 14,
    color: '#d4a3ff',
  },
  poseTagRemove: {
    padding: 2,
  },
  manualPoseForm: {
    backgroundColor: 'rgba(40, 40, 50, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  manualPoseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  manualPoseInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  manualPoseInput: {
    flex: 1,
    backgroundColor: 'rgba(50, 50, 60, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  manualPoseSubmitBtn: {
    backgroundColor: 'rgba(50, 50, 60, 0.8)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  manualPoseSubmitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  submitContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0055',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
  },
  submitButtonSuccess: {
    backgroundColor: '#4ade80',
  },
  submitButtonIcon: {
    fontSize: 24,
    color: '#fff',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: 'rgba(40, 40, 50, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default JournalForm;
