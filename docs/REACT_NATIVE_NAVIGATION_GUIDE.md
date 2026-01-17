# React Native Navigation 변환 가이드

## 현재 웹 구조 (React Router DOM)

```
App.tsx
├── Auth (로그인 전)
└── Main Layout (로그인 후)
    ├── Header (네비게이션 + 버튼들)
    ├── JournalForm
    ├── Routes
    │   ├── "/" → CardStack (일지 목록)
    │   ├── "/library" → PoseBookshelf (자세 도서관)
    │   └── "/analytics" → AnalyticsView (월간 분석)
    └── Modals (Souvenir, Feedback, DataManagement)
```

## React Native Navigation 구조 (권장)

```
App.tsx
├── NavigationContainer
│   └── AuthStack (로그인 전)
│       └── AuthScreen
│   └── MainTabs (로그인 후) - Bottom Tab Navigator
│       ├── JournalStack
│       │   ├── JournalListScreen (CardStack)
│       │   └── JournalFormScreen (작성/수정)
│       ├── LibraryScreen (PoseBookshelf)
│       └── AnalyticsScreen (AnalyticsView)
```

---

## 1. 필수 패키지 설치

```bash
# Expo 프로젝트 기준
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

---

## 2. 타입 정의 (navigation/types.ts)

```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { JournalEntry } from '../types';

// Auth Stack
export type AuthStackParamList = {
  Auth: undefined;
};

// Journal Stack (일지 탭 내부)
export type JournalStackParamList = {
  JournalList: undefined;
  JournalForm: {
    mode: 'create' | 'edit';
    entry?: JournalEntry;
  };
  JournalDetail: { entryId: string };
};

// Main Bottom Tabs
export type MainTabParamList = {
  JournalTab: NavigatorScreenParams<JournalStackParamList>;
  Library: undefined;
  Analytics: undefined;
};

// Root Stack (Auth + Main)
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};

// Screen Props 타입들
export type AuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'Auth'>;

export type JournalListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<JournalStackParamList, 'JournalList'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type JournalFormScreenProps = NativeStackScreenProps<JournalStackParamList, 'JournalForm'>;

export type LibraryScreenProps = BottomTabScreenProps<MainTabParamList, 'Library'>;

export type AnalyticsScreenProps = BottomTabScreenProps<MainTabParamList, 'Analytics'>;
```

---

## 3. Navigation 구조 (navigation/index.tsx)

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  JournalStackParamList
} from './types';

// Screens
import AuthScreen from '../screens/AuthScreen';
import JournalListScreen from '../screens/JournalListScreen';
import JournalFormScreen from '../screens/JournalFormScreen';
import LibraryScreen from '../screens/LibraryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

// Auth Context
import { useAuth } from '../contexts/AuthContext';

// Theme
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// Navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const JournalStack = createNativeStackNavigator<JournalStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

// Journal Stack Navigator (일지 탭 내부)
function JournalNavigator() {
  return (
    <JournalStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d9488' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <JournalStack.Screen
        name="JournalList"
        component={JournalListScreen}
        options={{ title: '나의 일지' }}
      />
      <JournalStack.Screen
        name="JournalForm"
        component={JournalFormScreen}
        options={({ route }) => ({
          title: route.params.mode === 'edit' ? '일지 수정' : '새 일지 작성',
          presentation: 'modal', // iOS 모달 스타일
        })}
      />
    </JournalStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#78716c',
        tabBarStyle: {
          backgroundColor: isDark ? '#1e293b' : '#fafaf9',
          borderTopColor: isDark ? '#334155' : '#e7e5e4',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'JournalTab') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen
        name="JournalTab"
        component={JournalNavigator}
        options={{ tabBarLabel: '일지' }}
      />
      <MainTab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarLabel: '자세 도서관' }}
      />
      <MainTab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: '월간 분석' }}
      />
    </MainTab.Navigator>
  );
}

// Root Navigator
export default function Navigation() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) {
    return null; // 또는 SplashScreen
  }

  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 4. AuthContext 변환 (contexts/AuthContext.tsx)

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseService';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 세션 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 5. App.tsx (React Native 버전)

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { JournalProvider } from './contexts/JournalContext';
import Navigation from './navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <JournalProvider>
              <Navigation />
              <StatusBar style="auto" />
            </JournalProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 6. 화면별 변환 가이드

### JournalListScreen (기존 CardStack)

```typescript
import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useJournal } from '../contexts/JournalContext';
import JournalCard from '../components/JournalCard';
import SearchBar from '../components/SearchBar';
import type { JournalListScreenProps } from '../navigation/types';

export default function JournalListScreen({ navigation }: JournalListScreenProps) {
  const { entries, loading, refreshEntries, searchQuery, setSearchQuery } = useJournal();

  // 화면 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      refreshEntries();
    }, [])
  );

  const handleEditEntry = (entry: JournalEntry) => {
    navigation.navigate('JournalForm', { mode: 'edit', entry });
  };

  const handleAddEntry = () => {
    navigation.navigate('JournalForm', { mode: 'create' });
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JournalCard
            entry={item}
            onEdit={() => handleEditEntry(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshEntries} />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* FAB - 새 일지 작성 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddEntry}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
```

---

## 7. 웹 코드 → React Native 변환 체크리스트

| 웹 (React Router) | React Native |
|-------------------|--------------|
| `<Link to="/">` | `navigation.navigate('Home')` |
| `<Routes>` / `<Route>` | `createNativeStackNavigator()` |
| `useLocation()` | `useRoute()` / `useNavigation()` |
| `useNavigate()` | `navigation.navigate()` / `navigation.goBack()` |
| `<Navigate to="/">` | `navigation.reset()` 또는 조건부 렌더링 |
| `location.pathname` | `route.name` |
| CSS className | StyleSheet / NativeWind |
| `window.scrollTo()` | `scrollRef.current?.scrollTo()` |
| `alert()` | `Alert.alert()` from 'react-native' |
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button onClick>` | `<TouchableOpacity onPress>` |
| `<input>` | `<TextInput>` |

---

## 8. 모달 처리 방법

### 옵션 1: Stack Navigator의 modal presentation

```typescript
<JournalStack.Screen
  name="SouvenirCard"
  component={SouvenirCardScreen}
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
  }}
/>
```

### 옵션 2: React Native Modal 컴포넌트

```typescript
import { Modal, View, TouchableOpacity, Text } from 'react-native';

function SouvenirCardModal({ visible, onClose, entry }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContent}>
        {/* 모달 내용 */}
        <TouchableOpacity onPress={onClose}>
          <Text>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
```

---

## 9. 추가 권장사항

### Deep Linking 설정 (linking config)

```typescript
const linking = {
  prefixes: ['yogis://', 'https://yogis.app'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          JournalTab: {
            screens: {
              JournalList: 'journal',
              JournalForm: 'journal/form',
            },
          },
          Library: 'library',
          Analytics: 'analytics',
        },
      },
      AuthStack: {
        screens: {
          Auth: 'auth',
        },
      },
    },
  },
};

<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

### 화면 전환 애니메이션 커스터마이징

```typescript
<JournalStack.Navigator
  screenOptions={{
    animation: 'slide_from_right', // iOS 기본
    // 또는 커스텀:
    // animation: 'fade_from_bottom',
    // animationDuration: 300,
  }}
>
```

---

## 10. 파일 구조 (권장)

```
src/
├── App.tsx
├── navigation/
│   ├── index.tsx          # Root Navigator
│   └── types.ts           # Navigation 타입 정의
├── screens/
│   ├── AuthScreen.tsx
│   ├── JournalListScreen.tsx
│   ├── JournalFormScreen.tsx
│   ├── LibraryScreen.tsx
│   └── AnalyticsScreen.tsx
├── components/
│   ├── JournalCard.tsx
│   ├── SearchBar.tsx
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── JournalContext.tsx
├── services/
│   ├── supabaseService.ts
│   └── authService.ts
└── types.ts
```

이 가이드를 따라 점진적으로 각 화면을 변환하면 됩니다.
