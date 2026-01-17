/**
 * Auth Service - Supabase Authentication
 *
 * 웹과 React Native 환경 모두에서 인증을 처리합니다.
 *
 * React Native 설정 가이드:
 * 1. @react-native-async-storage/async-storage 설치
 * 2. expo-auth-session, expo-web-browser 설치 (Expo 사용 시)
 * 3. Deep linking 설정 (app.json 또는 AndroidManifest.xml, Info.plist)
 * 4. supabaseService.ts에서 AsyncStorage 설정
 */

import { supabase } from './supabaseService';
import type { Session, Subscription, Provider } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. React Native 네이티브 OAuth 함수
// ---------------------------------------------------------

/**
 * React Native에서 OAuth URL 생성
 * expo-auth-session 또는 react-native-app-auth와 함께 사용
 *
 * @example
 * // Expo에서 사용 예시:
 * import * as WebBrowser from 'expo-web-browser';
 * import { makeRedirectUri } from 'expo-auth-session';
 *
 * const redirectUri = makeRedirectUri({ scheme: 'yogis-app', path: 'auth' });
 * const { url } = await getOAuthUrl('google', redirectUri);
 * const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
 * if (result.type === 'success') {
 *   await handleOAuthCallback(result.url);
 * }
 */
export const getOAuthUrl = async (
  provider: Provider,
  redirectTo: string
): Promise<{ url: string | null; error: Error | null }> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true, // URL만 가져오고 리다이렉트하지 않음
    },
  });

  if (error) {
    console.error(`Error getting OAuth URL for ${provider}:`, error);
    return { url: null, error };
  }

  return { url: data.url, error: null };
};

/**
 * OAuth 콜백 URL 처리 (React Native)
 * 딥링크로 받은 URL에서 토큰 추출하여 세션 설정
 *
 * @example
 * // Deep link 핸들러에서 사용
 * Linking.addEventListener('url', async ({ url }) => {
 *   if (url.includes('auth/callback')) {
 *     await handleOAuthCallback(url);
 *   }
 * });
 */
export const handleOAuthCallback = async (
  url: string
): Promise<{ session: Session | null; error: Error | null }> => {
  try {
    // URL에서 access_token과 refresh_token 추출
    const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken) {
      return { session: null, error: new Error('Access token not found in callback URL') };
    }

    // 세션 설정
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (error) {
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (error: any) {
    console.error('Error handling OAuth callback:', error);
    return { session: null, error };
  }
};

// ---------------------------------------------------------
// 2. 이메일/비밀번호 인증
// ---------------------------------------------------------

/**
 * 이메일로 회원가입
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<{ session: Session | null; error: Error | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'yogis-app://auth/callback',
    },
  });

  if (error) {
    console.error('Error signing up:', error);
    return { session: null, error };
  }

  return { session: data.session, error: null };
};

/**
 * 이메일로 로그인
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ session: Session | null; error: Error | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    return { session: null, error };
  }

  return { session: data.session, error: null };
};

/**
 * 비밀번호 재설정 이메일 발송
 */
export const resetPassword = async (
  email: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'yogis-app://reset-password',
  });

  if (error) {
    console.error('Error resetting password:', error);
  }

  return { error };
};

// ---------------------------------------------------------
// 3. 세션 관리
// ---------------------------------------------------------

/**
 * 로그아웃
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
  return { error };
};

/**
 * 현재 세션 가져오기
 */
export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * 현재 사용자 가져오기
 */
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * 인증 상태 변경 리스너
 */
export const onAuthStateChange = (
  callback: (session: Session | null) => void
): Subscription | undefined => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
};

// ---------------------------------------------------------
// 4. 타입 내보내기
// ---------------------------------------------------------

export type { Session, Subscription, Provider };
