import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalEntry, ImageFile } from '../types';

// ---------------------------------------------------------
// 1. Supabase 연결 설정 (React Native 네이티브 앱용)
// ---------------------------------------------------------

const supabaseUrl = 'https://vjmnjyuzcrflojvktlyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbW5qeXV6Y3JmbG9qdmt0bHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTc2NTUsImV4cCI6MjA3OTk5MzY1NX0.cjafwpgneu-9QZjuDpxSoqK1Upbg_XZcuTrw1Zhw5No';

if (!supabaseAnonKey) {
  console.error("🔥 [오류] supabaseAnonKey가 비어있습니다! service 파일을 확인하세요.");
}

/**
 * 플랫폼 감지
 */
const isReactNativeEnv = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
};

/**
 * Supabase 클라이언트 옵션 (React Native 네이티브 앱용)
 * - AsyncStorage로 세션 저장
 * - detectSessionInUrl: false (네이티브 앱에서는 URL 감지 불필요)
 * - Deep Linking으로 OAuth 콜백 처리
 */
const getSupabaseOptions = (): SupabaseClientOptions<'public'> => {
  const options: SupabaseClientOptions<'public'> = {
    auth: {
      storage: AsyncStorage, // React Native용 AsyncStorage 사용
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // 네이티브 앱에서는 Deep Linking으로 처리
    },
  };

  return options;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, getSupabaseOptions());

// ---------------------------------------------------------
// 2. 데이터 타입 정의
// ---------------------------------------------------------
export type NewJournalEntry = Omit<JournalEntry, 'id'> & { user_id: string };

// ---------------------------------------------------------
// 3. 플랫폼 감지 및 타입 가드 유틸리티
// ---------------------------------------------------------

/**
 * File 객체인지 확인 (웹 환경)
 */
const isWebFile = (file: ImageFile): file is File => {
  return typeof File !== 'undefined' && file instanceof File;
};

/**
 * React Native 이미지 객체인지 확인
 */
const isRNImageFile = (file: ImageFile): file is { uri: string; type: string; name: string } => {
  return typeof file === 'object' && 'uri' in file && typeof file.uri === 'string';
};

// ---------------------------------------------------------
// 4. 사진 스토리지 API 함수 (웹 & React Native 호환)
// ---------------------------------------------------------

/**
 * 이미지를 Supabase Storage에 업로드하고 공개 URL을 반환합니다.
 * 웹과 React Native 환경 모두 지원합니다.
 *
 * @param file - 업로드할 이미지 파일 (File 또는 {uri, type, name})
 * @param userId - 파일을 소유한 사용자 ID
 * @returns 업로드된 이미지의 공개 URL
 */
export const uploadImage = async (file: ImageFile, userId: string): Promise<string | null> => {
  try {
    const fileName = `${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    let uploadData: File | Blob | ArrayBuffer;
    let contentType = 'image/jpeg';

    if (isWebFile(file)) {
      // 웹 환경: File 객체 직접 사용
      uploadData = file;
      contentType = file.type || 'image/jpeg';
    } else if (isRNImageFile(file)) {
      // React Native 환경: URI에서 Blob으로 변환
      const response = await fetch(file.uri);
      uploadData = await response.blob();
      contentType = file.type || 'image/jpeg';
    } else {
      console.error('Invalid file format');
      return null;
    }

    const { error: uploadError } = await supabase.storage
      .from('journal-photos')
      .upload(filePath, uploadData, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // 업로드된 파일의 공개 URL을 가져옵니다.
    const { data } = supabase.storage
      .from('journal-photos')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      console.error('Error getting public URL for image');
      return null;
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
};

/**
 * Supabase Storage에서 이미지를 삭제합니다.
 * @param url - 삭제할 이미지의 전체 URL
 */
export const deleteImage = async (url: string): Promise<void> => {
  // URL에서 파일 경로(예: 'user-id/12345.png')를 추출합니다.
  const bucketName = 'journal-photos';
  const urlParts = url.split(`/${bucketName}/`);
  if (urlParts.length < 2) {
    console.error('Invalid image URL for deletion:', url);
    return;
  }
  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
  }
};


// ---------------------------------------------------------
// 5. 일지 데이터 API 함수
// ---------------------------------------------------------

/**
 * 알림 콜백 타입
 * React Native에서는 이 콜백을 설정하여 커스텀 알림 처리 가능
 */
type AlertCallback = (message: string) => void;

let customAlertCallback: AlertCallback | null = null;

/**
 * 커스텀 알림 핸들러 설정 (React Native용)
 *
 * @example
 * // React Native에서 설정
 * import { Alert } from 'react-native';
 * setAlertHandler((message) => Alert.alert('알림', message));
 */
export const setAlertHandler = (callback: AlertCallback): void => {
  customAlertCallback = callback;
};

/**
 * 플랫폼에 맞는 알림 표시
 */
const showAlert = (message: string): void => {
  if (customAlertCallback) {
    // 커스텀 핸들러가 설정된 경우 (React Native)
    customAlertCallback(message);
  } else if (isReactNativeEnv()) {
    // React Native 환경이지만 핸들러 미설정 시 콘솔 출력
    console.error('[Alert]', message);
  } else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    // 웹 환경
    window.alert(message);
  } else {
    // 기타 환경
    console.error('[Alert]', message);
  }
};

// 일지 추가 (CREATE)
export const addJournalEntry = async (entry: NewJournalEntry): Promise<JournalEntry | null> => {
  console.log("Supabase로 데이터 전송 시도:", entry);

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('Error adding journal entry:', error);
    showAlert(`저장 실패: ${error.message}`);
    return null;
  }
  return data;
};

// 일지 목록 불러오기 (READ)
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  return data || [];
};

// 일지 수정 (UPDATE)
export const updateJournalEntry = async (entry: Partial<JournalEntry> & { id: string }): Promise<JournalEntry | null> => {
  const { id, ...updateData } = entry;
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    return null;
  }
  return data;
};

// 일지 삭제 (DELETE)
export const deleteJournalEntry = async (id: string): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error deleting journal entry:', error);
    return null;
  }
  return data;
};
