
export interface YogaPose {
  name: string;
  sanskritName: string;
  description: string;
  svgIcon: string;
  benefits: string[];
  contraindications: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type PhotoTheme = '오늘의 자세' | 'Before & After' | '내 공간의 변화';

export interface PhotoEntry {
  url: string; // base64 encoded image
  theme?: PhotoTheme;
  caption?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  photos: PhotoEntry[]; // Changed from string[]
  notes: string;
  hashtags: string[];
  poses: YogaPose[];
  duration?: string; // e.g., "60 minutes"
  intensity?: number; // 1-5 rating
  isFavorite?: boolean;
}

export type CatBreed = 'Siamese' | 'Tabby' | 'Persian' | 'Tuxedo' | 'Calico' | 'Russian Blue';

export interface UserCat {
  name: string;
  breed: CatBreed;
  startEntryCount: number;
}

export interface CatHistoryItem {
    name: string;
    breed: CatBreed;
    startDate: string;
    endDate: string;
}

export interface CatData {
  activeCat: UserCat | null;
  catHistory: CatHistoryItem[];
}

export interface CatSpriteStage {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface CatBreedInfo {
  maxStages: number;
  spriteUrl: string;
  backgroundSize: string;
  spriteData: CatSpriteStage[];
}

const PLACEHOLDER_SPRITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='transparent'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='30'%3E🐱%3C/text%3E%3C/svg%3E";

const DEFAULT_BREED_INFO: CatBreedInfo = {
    maxStages: 5,
    spriteUrl: PLACEHOLDER_SPRITE,
    backgroundSize: 'auto',
    spriteData: [
        { x: 0, y: 0, width: 64, height: 64 },
        { x: 0, y: 0, width: 64, height: 64 },
        { x: 0, y: 0, width: 64, height: 64 },
        { x: 0, y: 0, width: 64, height: 64 },
        { x: 0, y: 0, width: 64, height: 64 },
    ]
};

export const CAT_BREED_DATA: Record<CatBreed, CatBreedInfo> = {
    'Siamese': { ...DEFAULT_BREED_INFO },
    'Tabby': { ...DEFAULT_BREED_INFO },
    'Persian': { ...DEFAULT_BREED_INFO },
    'Tuxedo': { ...DEFAULT_BREED_INFO },
    'Calico': { ...DEFAULT_BREED_INFO },
    'Russian Blue': { ...DEFAULT_BREED_INFO },
};
