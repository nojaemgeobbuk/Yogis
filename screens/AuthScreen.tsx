/**
 * Auth Screen - 로그인/회원가입
 *
 * 웹의 Auth 컴포넌트에 해당
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import {
  signInWithEmail,
  getOAuthUrl,
  handleOAuthCallback,
} from '../services/authService';

type AuthScreenNavigationProp = RootStackScreenProps<'Auth'>['navigation'];

// Expo OAuth 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

const AuthScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 이메일 로그인
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);

      if (error) {
        Alert.alert('로그인 오류', error.message);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // OAuth 로그인 (Google/Apple)
  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'yogis-app',
        path: 'auth',
      });
      const { url, error } = await getOAuthUrl(provider, redirectUri);

      if (error || !url) {
        throw new Error(error?.message || 'OAuth URL을 가져올 수 없습니다.');
      }

      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

      if (result.type === 'success' && result.url) {
        await handleOAuthCallback(result.url);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* 로고 & 타이틀 */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧘</Text>
          <Text style={[styles.title, isDark && styles.textLight]}>
            Yoga Journal
          </Text>
          <Text style={[styles.subtitle, isDark && styles.textMuted]}>
            나만의 수련과 성장을 위한 공간
          </Text>
        </View>

        {/* 이메일 입력 폼 */}
        <View style={styles.form}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="이메일"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="비밀번호"
            placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={[styles.switchText, isDark && styles.textMuted]}>
              계정이 없으신가요? 회원가입
            </Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
          <Text style={[styles.dividerText, isDark && styles.textMuted]}>
            또는
          </Text>
          <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
        </View>

        {/* 소셜 로그인 */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleOAuth('google')}
            disabled={loading}
          >
            <Text style={styles.socialButtonText}>G</Text>
            <Text style={styles.socialButtonLabel}>Google로 계속</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleOAuth('apple')}
            disabled={loading}
          >
            <Text style={[styles.socialButtonText, styles.appleButtonText]}>

            </Text>
            <Text style={[styles.socialButtonLabel, styles.appleButtonLabel]}>
              Apple로 계속
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f4',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#115e59',
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c',
    marginTop: 8,
  },

  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#292524',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  inputDark: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderColor: '#334155',
  },

  primaryButton: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  switchText: {
    textAlign: 'center',
    color: '#0d9488',
    fontSize: 14,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7e5e4',
  },
  dividerLineDark: {
    backgroundColor: '#334155',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#78716c',
    fontSize: 14,
  },

  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e7e5e4',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialButtonText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    color: '#ea4335',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  socialButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292524',
  },
  appleButtonLabel: {
    color: '#ffffff',
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default AuthScreen;
