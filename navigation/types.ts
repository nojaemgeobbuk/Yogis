/**
 * React Navigation 타입 정의
 *
 * 필요 패키지:
 * npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
 * npm install react-native-screens react-native-safe-area-context
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { JournalEntry } from '../types';

// ---------------------------------------------------------
// 1. 스택 네비게이터 파라미터 타입
// ---------------------------------------------------------

/**
 * Root Stack Navigator 파라미터
 */
export type RootStackParamList = {
  Auth: undefined;
  SignUp: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  JournalCreate: undefined;
  JournalDetail: { entry: JournalEntry };
  JournalEdit: { entry: JournalEntry };
  Settings: undefined;
  DataManagement: undefined;
};

/**
 * Main Tab Navigator 파라미터
 */
export type MainTabParamList = {
  Journal: undefined;
  Library: undefined;
  Create: undefined;
  Footprint: undefined;
};

// ---------------------------------------------------------
// 2. 스크린 Props 타입
// ---------------------------------------------------------

/**
 * Root Stack 스크린 Props
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Main Tab 스크린 Props
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// ---------------------------------------------------------
// 3. Navigation 전역 타입 선언
// ---------------------------------------------------------

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// ---------------------------------------------------------
// 4. 네비게이션 유틸리티 타입
// ---------------------------------------------------------

/**
 * useNavigation 훅에서 사용할 타입
 */
export type AppNavigationProp = RootStackScreenProps<keyof RootStackParamList>['navigation'];

/**
 * 탭 아이콘 props 타입
 */
export interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}
