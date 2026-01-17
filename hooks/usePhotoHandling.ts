import { useState, useCallback } from 'react';
import type { PhotoEntry, ImageFile } from '../types';
import {
  isNativePlatform,
  pickImage,
  handleWebFileInput,
} from '../services/cameraService';
import { uploadImage } from '../services/supabaseService';

export interface UsePhotoHandlingReturn {
  photos: PhotoEntry[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoEntry[]>>;
  isUploading: boolean;
  isNative: boolean;
  handleWebPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleNativeImagePick: () => Promise<void>;
  handleRemovePhoto: (index: number) => void;
  handlePhotoDetailChange: (index: number, field: 'caption' | 'theme', value: string) => void;
  uploadPhotos: (userId: string) => Promise<PhotoEntry[]>;
  resetPhotos: () => void;
  maxPhotos: number;
  canAddMorePhotos: boolean;
}

const MAX_PHOTOS = 2;

/**
 * Hook for handling photo upload, selection, and management.
 * Supports both web file input and native camera/gallery.
 */
export function usePhotoHandling(initialPhotos: PhotoEntry[] = []): UsePhotoHandlingReturn {
  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const isNative = isNativePlatform();

  // Handle web file input
  const handleWebPhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = handleWebFileInput(event, MAX_PHOTOS, photos.length);
    if (files.length === 0) return;

    files.forEach((file: File) => {
      const newPhoto: PhotoEntry = {
        url: URL.createObjectURL(file),
        file: file
      };
      setPhotos(prev => [...prev, newPhoto]);
    });
    event.target.value = '';
  }, [photos.length]);

  // Handle native camera/gallery selection
  const handleNativeImagePick = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) {
      alert(`사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      return;
    }

    try {
      const imageFile = await pickImage();
      if (!imageFile) return; // User cancelled

      // Create preview URL based on file type
      let previewUrl: string;
      if (imageFile instanceof File) {
        previewUrl = URL.createObjectURL(imageFile);
      } else {
        // React Native format (uri, type, name)
        previewUrl = imageFile.uri;
      }

      const newPhoto: PhotoEntry = {
        url: previewUrl,
        file: imageFile
      };
      setPhotos(prev => [...prev, newPhoto]);
    } catch (error: any) {
      console.error('이미지 선택 실패:', error);
      alert(error.message || '이미지를 선택할 수 없습니다.');
    }
  }, [photos.length]);

  // Remove photo at index
  const handleRemovePhoto = useCallback((indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  // Update photo caption or theme
  const handlePhotoDetailChange = useCallback((
    index: number,
    field: 'caption' | 'theme',
    value: string
  ) => {
    setPhotos(prev => prev.map((photo, i) =>
      i === index ? { ...photo, [field]: value } : photo
    ));
  }, []);

  // Upload all photos with files to storage and return processed photos
  const uploadPhotos = useCallback(async (userId: string): Promise<PhotoEntry[]> => {
    setIsUploading(true);
    try {
      const processedPhotos = await Promise.all(photos.map(async (photo) => {
        if (photo.file) {
          const publicUrl = await uploadImage(photo.file, userId);

          if (!publicUrl) {
            throw new Error(`이미지 업로드 실패: ${(photo.file as File).name || 'image'}`);
          }

          return { ...photo, url: publicUrl, file: undefined };
        }
        return photo;
      }));

      return processedPhotos as PhotoEntry[];
    } finally {
      setIsUploading(false);
    }
  }, [photos]);

  // Reset photos state
  const resetPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  return {
    photos,
    setPhotos,
    isUploading,
    isNative,
    handleWebPhotoUpload,
    handleNativeImagePick,
    handleRemovePhoto,
    handlePhotoDetailChange,
    uploadPhotos,
    resetPhotos,
    maxPhotos: MAX_PHOTOS,
    canAddMorePhotos: photos.length < MAX_PHOTOS,
  };
}

export default usePhotoHandling;
