/**
 * Root Stack Navigator
 *
 * 인증 상태에 따라 Auth 또는 Main 화면을 표시
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import type { RootStackParamList } from './types';

// 네비게이터
import MainTabNavigator from './MainTabNavigator';

// 스크린 import
import AuthScreen from '../screens/AuthScreen';
import SignUpScreen from '../screens/SignUpScreen';
import JournalCreateScreen from '../screens/JournalCreateScreen';
import JournalDetailScreen from '../screens/JournalDetailScreen';
import JournalEditScreen from '../screens/JournalEditScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DataManagementScreen from '../screens/DataManagementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({ isAuthenticated }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 공통 헤더 스타일
  const headerStyle = {
    backgroundColor: isDark ? '#0f172a' : '#fafaf9', // slate-900 / stone-50
  };

  const headerTintColor = isDark ? '#e2e8f0' : '#292524'; // slate-200 / stone-800

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: isDark ? '#0f172a' : '#f5f5f4', // slate-900 / stone-100
        },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // 비로그인 상태: Auth 및 SignUp 화면
        <>
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: 'pop',
            }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              title: '회원가입',
              headerBackTitle: '뒤로',
            }}
          />
        </>
      ) : (
        // 로그인 상태: 메인 앱 화면들
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="JournalCreate"
            component={JournalCreateScreen}
            options={{
              title: '새 일지 작성',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: isDark ? '#0f172a' : '#fafaf9',
              },
            }}
          />
          <Stack.Screen
            name="JournalDetail"
            component={JournalDetailScreen}
            options={{
              title: '일지 상세',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="JournalEdit"
            component={JournalEditScreen}
            options={{
              title: '일지 수정',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: '설정',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="DataManagement"
            component={DataManagementScreen}
            options={{
              title: '데이터 관리',
              presentation: 'modal',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
