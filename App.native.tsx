/**
 * App.native.tsx - React Native 진입점
 *
 * 웹의 App.tsx에 해당하는 React Native 버전입니다.
 * @react-navigation/native를 사용한 네비게이션 구조입니다.
 *
 * 필요 패키지:
 * npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
 * npm install react-native-screens react-native-safe-area-context
 * npx expo install expo-auth-session expo-web-browser expo-file-system expo-sharing
 * npm install @react-native-async-storage/async-storage
 */

import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, Alert, Linking } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

// 서비스
import { supabase, setAlertHandler } from './services/supabaseService';
import { handleOAuthCallback } from './services/authService';

// 네비게이터
import { RootNavigator } from './navigation';

// OAuth 세션 완료 처리 (필수)
WebBrowser.maybeCompleteAuthSession();

// React Native Alert 핸들러 설정
setAlertHandler((message: string) => {
  Alert.alert('알림', message);
});

// 커스텀 네비게이션 테마
const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0d9488', // teal-600
    background: '#f5f5f4', // stone-100
    card: '#ffffff',
    text: '#292524', // stone-800
    border: '#e7e5e4', // stone-200
    notification: '#0d9488',
  },
};

const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#5eead4', // teal-300
    background: '#0f172a', // slate-900
    card: '#1e293b', // slate-800
    text: '#e2e8f0', // slate-200
    border: '#334155', // slate-700
    notification: '#14b8a6', // teal-500
  },
};

const App: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 인증 상태
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase 인증 리스너
  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Deep Linking 리스너 (OAuth 콜백 처리)
  useEffect(() => {
    // URL 이벤트 핸들러
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;

      // OAuth 콜백 URL 확인
      if (url.includes('auth/callback') || url.includes('#access_token')) {
        console.log('OAuth callback received:', url);

        try {
          const { session, error } = await handleOAuthCallback(url);
          if (error) {
            Alert.alert('로그인 실패', error.message);
          } else if (session) {
            console.log('OAuth login successful');
          }
        } catch (err) {
          console.error('Error handling OAuth callback:', err);
          Alert.alert('오류', '로그인 처리 중 오류가 발생했습니다.');
        }
      }
    };

    // 초기 URL 확인 (앱이 닫혀있다가 딥링크로 열린 경우)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // URL 변경 리스너 (앱이 실행 중일 때 딥링크를 받는 경우)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // 로딩 중 (스플래시 스크린 대체)
  if (loading) {
    return null; // 또는 커스텀 스플래시 스크린
  }

  // Navigation Deep Linking 설정
  const linking = {
    prefixes: ['yogis://', 'exp://'],
    config: {
      screens: {
        Auth: 'auth',
        Main: {
          screens: {
            Journal: 'journal',
            Library: 'library',
            Analytics: 'analytics',
          },
        },
        JournalCreate: 'journal/create',
        JournalDetail: 'journal/:id',
        JournalEdit: 'journal/:id/edit',
        Settings: 'settings',
        DataManagement: 'data',
      },
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f172a' : '#f5f5f4'}
      />
      <NavigationContainer
        theme={isDark ? DarkNavigationTheme : LightNavigationTheme}
        linking={linking}
      >
        <RootNavigator isAuthenticated={!!session} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
