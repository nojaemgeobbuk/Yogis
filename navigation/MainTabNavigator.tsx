/**
 * Main Tab Navigator - 네이버페이 스타일 하단 탭 바
 *
 * 일지 / 자세도서관 / 기록(가운데 강조) / 발자취
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MainTabParamList, TabIconProps } from './types';
import { theme } from '../theme';

// 스크린 import
import JournalScreen from '../screens/JournalScreen';
import LibraryScreen from '../screens/LibraryScreen';
import FootprintScreen from '../screens/FootprintScreen';

// 아이콘 컴포넌트 (간단한 이모지로 구현)
const JournalIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.icon, focused && styles.iconActive]}>📝</Text>
);

const LibraryIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.icon, focused && styles.iconActive]}>📚</Text>
);

const FootprintIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.icon, focused && styles.iconActive]}>👣</Text>
);

// 가운데 큰 원형 버튼 (커스텀)
const CenterCreateButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.centerButton} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.centerButtonInner}>
      <Text style={styles.centerButtonIcon}>✏️</Text>
    </View>
  </TouchableOpacity>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

// Create는 실제 스크린이 아니라 JournalCreate 모달을 여는 더미
const CreateDummy = () => <View />;

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary, // #03C75A
        tabBarInactiveTintColor: theme.colors.txt_secondary, // #A6A6A6
        tabBarStyle: {
          backgroundColor: theme.colors.bg_card, // #2C2C2C
          borderTopWidth: 0,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          height: 64 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      {/* 일지 */}
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarLabel: '일지',
          tabBarIcon: (props) => <JournalIcon {...props} />,
        }}
      />

      {/* 자세도서관 */}
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: '자세도서관',
          tabBarIcon: (props) => <LibraryIcon {...props} />,
        }}
      />

      {/* 기록 (가운데 큰 원형 버튼) */}
      <Tab.Screen
        name="Create"
        component={CreateDummy}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <CenterCreateButton
              onPress={() => {
                // @ts-ignore - navigation을 Root로 확장
                navigation.navigate('JournalCreate');
              }}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />

      {/* 발자취 */}
      <Tab.Screen
        name="Footprint"
        component={FootprintScreen}
        options={{
          tabBarLabel: '발자취',
          tabBarIcon: (props) => <FootprintIcon {...props} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },

  // 가운데 큰 원형 버튼
  centerButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, // 탭 바 위로 튀어나오게
  },
  centerButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary, // #03C75A
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  centerButtonIcon: {
    fontSize: 28,
  },
});

export default MainTabNavigator;
