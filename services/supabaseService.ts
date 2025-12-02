
import { createClient } from '@supabase/supabase-js';
import type { JournalEntry } from '../types';

// ---------------------------------------------------------
// 1. Supabase 연결 설정
// ---------------------------------------------------------

const supabaseUrl = 'https://vjmnjyuzcrflojvktlyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbW5qeXV6Y3JmbG9qdmt0bHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTc2NTUsImV4cCI6MjA3OTk5MzY1NX0.cjafwpgneu-9QZjuDpxSoqK1Upbg_XZcuTrw1Zhw5No'; 

if (!supabaseAnonKey) {
  console.error("🔥 [오류] supabaseAnonKey가 비어있습니다! service 파일을 확인하세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------
// 2. 데이터 타입 정의
// ---------------------------------------------------------
export type NewJournalEntry = Omit<JournalEntry, 'id'> & { user_id: string };

// ---------------------------------------------------------
// 3. 사진 스토리지 API 함수
// ---------------------------------------------------------

/**
 * 이미지를 Supabase Storage에 업로드하고 공개 URL을 반환합니다.
 * @param file - 업로드할 이미지 파일
 * @param userId - 파일을 소유한 사용자 ID
 * @returns 업로드된 이미지의 공개 URL
 */
export const uploadImage = async (file: File, userId: string): Promise<string | null> => {
  // 파일 경로를 `public/{userId}/{timestamp}-{filename}` 형식으로 지정합니다.
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('journal-photos')
    .upload(filePath, file);

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
// 4. 일지 데이터 API 함수
// ---------------------------------------------------------

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
    alert(`저장 실패: ${error.message}`);
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
