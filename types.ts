
export interface YogaPose {
  name: string;
  sanskritName: string;
  description: string;
  svgIcon: string;
  benefits: string[];
  contraindications: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type PhotoTheme = '오늘의 자세' | '오늘 하루' | '도반의 추억';

export interface PhotoEntry {
  url: string; // base64 encoded image or storage URL
  theme?: PhotoTheme;
  caption?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  title?: string; // 수련 기록의 제목
  photos: PhotoEntry[];
  notes: string;
  hashtags: string[];
  poses: YogaPose[];
  duration?: string; // e.g., "60 minutes"
  intensity?: number; // 1-5 rating
  is_favorite?: boolean;
}
