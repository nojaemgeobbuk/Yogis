# YOgis - Yoga Journal App

> 나만의 수련과 성장을 위한 요가 일지 앱

## 프로젝트 개요

YOgis는 요가 수련 기록을 관리하는 크로스 플랫폼 앱입니다. 웹(PWA)과 React Native(iOS/Android) 환경을 모두 지원합니다.

---

## 기술 스택

### 공통
- **TypeScript** - 타입 안전성
- **Supabase** - 인증, 데이터베이스, 스토리지
- **Framer Motion** - 애니메이션

### 웹 (PWA)
- **React 18** + **Vite**
- **React Router DOM** - 라우팅
- **Tailwind CSS 4** - 스타일링
- **vite-plugin-pwa** - PWA 지원

### React Native
- **@react-navigation/native** - 네비게이션
- **@react-navigation/bottom-tabs** - 하단 탭
- **@react-navigation/native-stack** - 스택 네비게이션
- **@capacitor/camera** - 카메라 연동
- **expo-auth-session** - OAuth 인증

---

## 프로젝트 구조

```
Yogis/
├── components/           # 웹 컴포넌트
│   ├── JournalForm.tsx
│   ├── JournalCard.tsx
│   ├── CardStack.tsx
│   ├── BottomNavigation.tsx
│   ├── motion/           # Framer Motion 컴포넌트
│   └── ...
│
├── screens/              # React Native 스크린
│   ├── index.ts
│   ├── JournalScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── AnalyticsScreen.tsx
│   ├── AuthScreen.tsx
│   ├── JournalCreateScreen.tsx
│   ├── JournalDetailScreen.tsx
│   ├── JournalEditScreen.tsx
│   ├── SettingsScreen.tsx
│   └── DataManagementScreen.tsx
│
├── navigation/           # React Native 네비게이션
│   ├── index.ts
│   ├── types.ts          # 네비게이션 타입 정의
│   ├── RootNavigator.tsx # 루트 스택 네비게이터
│   └── MainTabNavigator.tsx # 하단 탭 네비게이터
│
├── services/             # API 서비스
│   ├── supabaseService.ts  # Supabase 클라이언트 & API
│   ├── authService.ts      # 인증 서비스
│   └── cameraService.ts    # 카메라/갤러리 서비스
│
├── contexts/             # React Context
│   └── ThemeContext.tsx
│
├── types.ts              # 공통 타입 정의
├── yogaPoses.ts          # 요가 자세 데이터
├── App.tsx               # 웹 진입점
├── App.native.tsx        # React Native 진입점
├── index.css             # 글로벌 스타일 (Tailwind)
└── package.json
```

---

## 네비게이션 구조

### React Native (@react-navigation)

```
RootNavigator (Native Stack)
│
├── Auth                    ← 비로그인 시
│   └── AuthScreen
│
└── [로그인 시]
    │
    ├── Main (Bottom Tab Navigator)
    │   ├── Journal (일지)   → JournalScreen
    │   ├── Library (자세)   → LibraryScreen
    │   └── Analytics (분석) → AnalyticsScreen
    │
    ├── JournalCreate       → JournalCreateScreen (modal)
    ├── JournalDetail       → JournalDetailScreen (card)
    ├── JournalEdit         → JournalEditScreen (modal)
    ├── Settings            → SettingsScreen (modal)
    └── DataManagement      → DataManagementScreen (modal)
```

### 웹 (React Router DOM)

```
/ (App.tsx)
├── /              → 일지 목록 + JournalForm
├── /library       → 자세 도서관
└── /analytics     → 월간 분석
```

---

## 서비스 설정

### 1. Supabase (`services/supabaseService.ts`)

```typescript
// React Native에서 AsyncStorage 사용 시
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseOptions = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // RN에서는 false
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
```

### 2. 인증 (`services/authService.ts`)

| 함수 | 플랫폼 | 설명 |
|------|--------|------|
| `signInWithGoogle()` | 웹 | OAuth 리다이렉트 |
| `signInWithApple()` | 웹 | OAuth 리다이렉트 |
| `getOAuthUrl()` | RN | OAuth URL 생성 |
| `handleOAuthCallback()` | RN | 딥링크 콜백 처리 |
| `signInWithEmail()` | 공통 | 이메일 로그인 |
| `signUpWithEmail()` | 공통 | 이메일 회원가입 |
| `signOut()` | 공통 | 로그아웃 |

### 3. 카메라 (`services/cameraService.ts`)

| 함수 | 설명 |
|------|------|
| `isNativePlatform()` | Capacitor 네이티브 환경 확인 |
| `takePhoto()` | 카메라로 사진 촬영 |
| `pickFromGallery()` | 갤러리에서 선택 |
| `pickImage()` | 카메라/갤러리 선택 프롬프트 |
| `handleWebFileInput()` | 웹 파일 입력 처리 |

---

## 타입 정의 (`types.ts`)

```typescript
// React Native 호환 이미지 파일 타입
export type ImageFile = File | {
  uri: string;
  type: string;
  name: string;
};

// 일지 항목
export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  title?: string;
  photos: PhotoEntry[];
  notes: string;
  hashtags: string[];
  poses: YogaPose[];
  duration?: string;
  intensity?: number;
  is_favorite?: boolean;
}

// 사진 항목
export interface PhotoEntry {
  url: string;
  caption?: string;
  theme?: PhotoTheme;
  file?: ImageFile;
}
```

---

## 스타일 시스템

### 디자인 토큰 (Tailwind CSS 4)

```css
@theme {
  /* Zen 컬러 팔레트 */
  --color-zen-stone-50: oklch(0.985 0.001 106);
  --color-zen-teal-500: oklch(0.65 0.15 175);

  /* 다크 모드 */
  --color-zen-slate-900: oklch(0.15 0.02 260);
}
```

### 모바일 최적화 클래스

```css
/* 터치 타겟 (Apple HIG 44px) */
.touch-target { min-height: 44px; min-width: 44px; }

/* Safe Area (노치 대응) */
.safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## React Native 설정 가이드

### 1. 패키지 설치

```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# Capacitor (카메라)
npm install @capacitor/core @capacitor/camera

# Expo (선택)
npx expo install expo-auth-session expo-web-browser expo-file-system expo-sharing

# 세션 저장
npm install @react-native-async-storage/async-storage
```

### 2. Deep Linking 설정 (app.json)

```json
{
  "expo": {
    "scheme": "yogis",
    "ios": {
      "bundleIdentifier": "com.yogis.app"
    },
    "android": {
      "package": "com.yogis.app"
    }
  }
}
```

### 3. Alert 핸들러 설정

```typescript
// App.native.tsx
import { Alert } from 'react-native';
import { setAlertHandler } from './services/supabaseService';

setAlertHandler((message) => Alert.alert('알림', message));
```

### 4. OAuth 사용 (Expo)

```typescript
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { getOAuthUrl, handleOAuthCallback } from './services/authService';

const handleGoogleLogin = async () => {
  const redirectUri = makeRedirectUri({ scheme: 'yogis' });
  const { url } = await getOAuthUrl('google', redirectUri);

  if (url) {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
    if (result.type === 'success') {
      await handleOAuthCallback(result.url);
    }
  }
};
```

---

## PWA 설정

### vite.config.ts

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Yoga Journal',
        short_name: 'YOgis',
        theme_color: '#0d9488',
        icons: [/* ... */]
      }
    })
  ]
});
```

---

## 주요 기능

### 1. 일지 관리
- 일지 작성/수정/삭제
- 사진 첨부 (최대 2장)
- 수련 자세 기록
- 해시태그
- 강도/시간 기록

### 2. 자세 도서관
- 요가 자세 검색
- 난이도별 필터링
- 자세 상세 정보

### 3. 월간 분석
- 수련 통계 (횟수, 시간, 강도)
- 자주 수련한 자세 Top 5
- 캘린더 히트맵

### 4. 데이터 관리
- JSON 백업/복원
- 마크다운 내보내기

---

## 개발 명령어

```bash
# 개발 서버 (웹)
npm run dev

# 빌드 (웹)
npm run build

# 테스트
npm run test

# 프리뷰
npm run preview
```

---

## 환경 변수

Supabase 자격 증명은 `services/supabaseService.ts`에 직접 포함되어 있습니다. 프로덕션에서는 환경 변수로 분리하는 것을 권장합니다.

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

---

## 라이선스

Private - All rights reserved

---

*Created with passion for mindfulness and technology.*
