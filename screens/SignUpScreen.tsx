/**
 * Sign Up Screen - 회원가입
 *
 * 이메일 회원가입 전용 화면
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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { signUpWithEmail } from '../services/authService';

type SignUpScreenNavigationProp = RootStackScreenProps<'SignUp'>['navigation'];

const SignUpScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 이메일 형식 검사
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 유효성 검사
  const validateForm = (): string | null => {
    if (!email.trim()) {
      return '이메일을 입력해주세요.';
    }

    if (!isValidEmail(email)) {
      return '올바른 이메일 형식이 아닙니다.';
    }

    if (!password) {
      return '비밀번호를 입력해주세요.';
    }

    if (password.length < 6) {
      return '비밀번호는 6자리 이상이어야 합니다.';
    }

    if (!confirmPassword) {
      return '비밀번호 확인을 입력해주세요.';
    }

    if (password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }

    return null;
  };

  // 회원가입 처리
  const handleSignUp = async () => {
    // 유효성 검사
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('입력 오류', validationError);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password);

      if (error) {
        Alert.alert('회원가입 오류', error.message);
      } else {
        Alert.alert(
          '회원가입 성공',
          '이메일로 확인 링크가 발송되었습니다.\n이메일을 확인한 후 로그인해주세요.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧘</Text>
          <Text style={[styles.title, isDark && styles.textLight]}>
            회원가입
          </Text>
          <Text style={[styles.subtitle, isDark && styles.textMuted]}>
            Yoga Journal 계정을 생성하세요
          </Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textMuted]}>
              이메일
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="example@email.com"
              placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textMuted]}>
              비밀번호
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="6자리 이상"
              placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textMuted]}>
              비밀번호 확인
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor={isDark ? '#64748b' : '#a8a29e'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>회원가입</Text>
            )}
          </TouchableOpacity>

          {/* 로그인으로 돌아가기 */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={[styles.switchText, isDark && styles.textMuted]}>
              이미 계정이 있으신가요? 로그인
            </Text>
          </TouchableOpacity>
        </View>

        {/* 안내 메시지 */}
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Text style={[styles.infoText, isDark && styles.textMuted]}>
            회원가입 시 이메일로 확인 링크가 발송됩니다.{'\n'}
            이메일 확인 후 로그인할 수 있습니다.
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44403c',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#292524',
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

  infoBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoBoxDark: {
    backgroundColor: '#1e293b',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
    textAlign: 'center',
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default SignUpScreen;
