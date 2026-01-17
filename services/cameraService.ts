/**
 * Camera Service - Expo Image Picker Integration
 *
 * Expo/React Native 환경에서 카메라/갤러리 접근을 제공합니다.
 * expo-image-picker를 사용하여 네이티브 카메라 및 갤러리에 접근합니다.
 */

import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import type { ImageFile } from '../types';

export interface CameraPhoto {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * 네이티브 플랫폼에서 실행 중인지 확인
 */
export const isNativePlatform = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * 현재 플랫폼 이름 반환 ('ios', 'android', 'web')
 */
export const getPlatform = (): string => {
  return Platform.OS;
};

/**
 * 카메라 권한 요청
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    // 카메라 권한 요청
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '카메라를 사용하려면 카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [{ text: '확인' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('카메라 권한 요청 실패:', error);
    return false;
  }
};

/**
 * 갤러리(미디어 라이브러리) 권한 요청
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (mediaPermission.status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '갤러리에 접근하려면 사진 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [{ text: '확인' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('미디어 라이브러리 권한 요청 실패:', error);
    return false;
  }
};

/**
 * 카메라로 사진 촬영
 */
export const takePhoto = async (): Promise<ImageFile | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return assetToImageFile(result.assets[0]);
  } catch (error: any) {
    console.error('사진 촬영 실패:', error);
    throw error;
  }
};

/**
 * 갤러리에서 사진 선택
 */
export const pickFromGallery = async (): Promise<ImageFile | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return assetToImageFile(result.assets[0]);
  } catch (error: any) {
    console.error('갤러리 선택 실패:', error);
    throw error;
  }
};

/**
 * 카메라 또는 갤러리 선택 (사용자에게 선택권 제공)
 */
export const pickImage = async (): Promise<ImageFile | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      '사진 추가',
      '사진을 어떻게 추가하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => resolve(null),
        },
        {
          text: '갤러리에서 선택',
          onPress: async () => {
            const result = await pickFromGallery();
            resolve(result);
          },
        },
        {
          text: '카메라로 촬영',
          onPress: async () => {
            const result = await takePhoto();
            resolve(result);
          },
        },
      ],
      { cancelable: true }
    );
  });
};

/**
 * 여러 사진 선택 (갤러리)
 */
export const pickMultipleImages = async (limit: number = 2): Promise<ImageFile[]> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: limit,
      quality: 0.9,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    const images: ImageFile[] = [];
    for (const asset of result.assets) {
      const imageFile = assetToImageFile(asset);
      if (imageFile) {
        images.push(imageFile);
      }
    }

    return images;
  } catch (error: any) {
    console.error('다중 이미지 선택 실패:', error);
    throw error;
  }
};

/**
 * ImagePicker Asset을 ImageFile 타입으로 변환
 */
const assetToImageFile = (asset: ImagePicker.ImagePickerAsset): ImageFile | null => {
  if (!asset.uri) {
    return null;
  }

  // 파일 확장자 추출
  const uriParts = asset.uri.split('.');
  const fileExtension = uriParts[uriParts.length - 1] || 'jpg';

  // MIME 타입 결정
  let mimeType = 'image/jpeg';
  if (fileExtension.toLowerCase() === 'png') {
    mimeType = 'image/png';
  } else if (fileExtension.toLowerCase() === 'gif') {
    mimeType = 'image/gif';
  } else if (fileExtension.toLowerCase() === 'webp') {
    mimeType = 'image/webp';
  }

  // 파일명 생성
  const fileName = asset.fileName || `photo_${Date.now()}.${fileExtension}`;

  return {
    uri: asset.uri,
    type: mimeType,
    name: fileName,
  };
};

/**
 * 웹용 파일 입력 핸들러 (웹 플랫폼 폴백)
 * React Native에서는 사용되지 않지만, 호환성을 위해 유지
 */
export const handleWebFileInput = (
  event: { target: { files: FileList | null } },
  maxFiles: number = 2,
  currentCount: number = 0
): File[] => {
  const files: File[] = event.target.files ? Array.from(event.target.files) : [];
  const availableSlots = maxFiles - currentCount;

  if (files.length > availableSlots) {
    Alert.alert('알림', `사진은 최대 ${maxFiles}장까지 업로드할 수 있습니다.`);
    return files.slice(0, availableSlots);
  }

  return files;
};

/**
 * 이미지 URI에서 Blob 가져오기 (업로드용)
 */
export const getImageBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

/**
 * 이미지 파일 정보 가져오기
 */
export const getImageInfo = async (uri: string): Promise<{
  width: number;
  height: number;
  type: string;
}> => {
  return new Promise((resolve, reject) => {
    // React Native의 Image.getSize를 사용할 수도 있지만,
    // 여기서는 기본값 반환
    resolve({
      width: 0,
      height: 0,
      type: 'image/jpeg',
    });
  });
};

/**
 * 이미지 압축 유틸리티
 * expo-image-manipulator를 사용하면 더 정교한 압축 가능
 * 현재는 ImagePicker의 quality 옵션으로 대체
 */
export const compressImage = async (
  imageFile: ImageFile,
  _maxWidth: number = 1920,
  _quality: number = 0.8
): Promise<ImageFile> => {
  // expo-image-manipulator 사용시 구현 가능
  // 현재는 원본 반환 (ImagePicker가 이미 quality 적용)
  return imageFile;
};

/**
 * Native 이미지 선택 핸들러 (JournalForm에서 사용)
 * Alert를 통해 카메라/갤러리 선택 후 이미지 반환
 */
export const handleNativeImagePick = async (): Promise<ImageFile | null> => {
  return pickImage();
};
