# Google OAuth 설정 가이드 (React Native + Supabase)

네이티브 앱에서 Google 로그인을 구현하기 위한 완벽한 설정 가이드입니다.

---

## 📋 목차

1. [Google Cloud Console 설정](#1-google-cloud-console-설정)
2. [Supabase Dashboard 설정](#2-supabase-dashboard-설정)
3. [앱 설정 확인](#3-앱-설정-확인)
4. [테스트](#4-테스트)
5. [문제 해결](#5-문제-해결)

---

## 1. Google Cloud Console 설정

### Step 1: Google Cloud Console 접속

1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### Step 2: OAuth 동의 화면 구성

1. **왼쪽 메뉴** → **APIs & Services** → **OAuth consent screen**
2. **User Type** 선택:
   - **External** 선택 (모든 Google 계정 사용자)
   - Create 클릭

3. **앱 정보 입력**:
   ```
   App name: YOgis (또는 원하는 이름)
   User support email: your-email@gmail.com
   Developer contact email: your-email@gmail.com
   ```

4. **Scopes** 단계:
   - "Add or Remove Scopes" 클릭
   - 다음 스코프 추가:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Save and Continue

5. **Test users** 단계:
   - 개발 중이라면 테스트 사용자 추가 (선택사항)
   - Save and Continue

6. **Summary** 확인 후 완료

### Step 3: OAuth 2.0 클라이언트 ID 생성

1. **왼쪽 메뉴** → **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**

3. **Application type** 선택: **Web application**

4. **Name**: `YOgis Supabase`

5. **Authorized redirect URIs** 추가:
   ```
   https://vjmnjyuzcrflojvktlyj.supabase.co/auth/v1/callback
   ```

   ⚠️ **중요**:
   - `vjmnjyuzcrflojvktlyj`를 **본인의 Supabase 프로젝트 ID**로 변경
   - Supabase 프로젝트 URL: `https://app.supabase.com/project/[프로젝트ID]`

6. **Create** 클릭

7. **Client ID**와 **Client Secret** 복사 (잘 보관!)
   ```
   Client ID: 123456789-abcdefg.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxx
   ```

---

## 2. Supabase Dashboard 설정

### Step 1: Supabase Authentication 설정

1. https://app.supabase.com/project/vjmnjyuzcrflojvktlyj 접속
   - `vjmnjyuzcrflojvktlyj`를 본인의 프로젝트 ID로 변경

2. **왼쪽 메뉴** → **Authentication** → **Providers**

3. **Google** 찾아서 클릭

### Step 2: Google Provider 활성화

1. **Enable Sign in with Google** 토글 ON

2. **Client ID** 입력:
   ```
   Google Cloud Console에서 복사한 Client ID 붙여넣기
   123456789-abcdefg.apps.googleusercontent.com
   ```

3. **Client Secret** 입력:
   ```
   Google Cloud Console에서 복사한 Client Secret 붙여넣기
   GOCSPX-xxxxxxxxxxxxxxxxxxxx
   ```

4. **Redirect URL** 확인:
   ```
   https://vjmnjyuzcrflojvktlyj.supabase.co/auth/v1/callback
   ```
   - 이 URL이 Google Cloud Console의 Authorized redirect URIs와 일치해야 함!

5. **Save** 클릭

### Step 3: URL Configuration 확인

1. **Authentication** → **URL Configuration**

2. **Redirect URLs** 섹션에서 다음 추가:
   ```
   yogis://auth/callback
   exp://localhost:8082
   ```

   - `yogis://auth/callback` - 프로덕션 앱용
   - `exp://localhost:8082` - Expo Go 개발용

3. **Save** 클릭

---

## 3. 앱 설정 확인

### ✅ app.json 확인

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

### ✅ supabaseService.ts 확인

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const getSupabaseOptions = (): SupabaseClientOptions<'public'> => {
  return {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // 네이티브에서는 false
    },
  };
};
```

### ✅ App.native.tsx 확인

```typescript
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

// OAuth 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

// Deep Linking 리스너 구현됨
```

### ✅ AuthScreen.tsx 확인

```typescript
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { getOAuthUrl, handleOAuthCallback } from '../services/authService';

const handleOAuth = async (provider: 'google' | 'apple') => {
  const redirectUri = makeRedirectUri({ scheme: 'yogis' });
  const { url } = await getOAuthUrl(provider, redirectUri);
  const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

  if (result.type === 'success') {
    await handleOAuthCallback(result.url);
  }
};
```

---

## 4. 테스트

### Step 1: Expo 앱 실행

```bash
cd C:\Users\강승현\YOgis\Yogis
npx expo start
```

### Step 2: Expo Go에서 QR 코드 스캔

- iOS: iPhone의 카메라 앱으로 QR 코드 스캔
- Android: Expo Go 앱에서 "Scan QR Code"

### Step 3: Google 로그인 테스트

1. **AuthScreen에서 "Google로 계속" 버튼 클릭**

2. **브라우저가 열리면서 Google 로그인 화면 표시**

3. **Google 계정 선택 및 로그인**

4. **권한 동의 화면**:
   ```
   YOgis wants to access your Google Account

   ✓ See your personal info
   ✓ See your email address
   ```
   - "Continue" 클릭

5. **자동으로 앱으로 복귀**

6. **로그인 성공!**
   - JournalScreen으로 자동 이동
   - 사용자 세션이 AsyncStorage에 저장됨

### Step 4: 세션 지속성 테스트

1. **앱 완전히 종료** (백그라운드에서도 제거)

2. **앱 다시 실행**

3. **자동으로 로그인된 상태로 시작** ✅
   - AsyncStorage에 저장된 세션 자동 복원

---

## 5. 문제 해결

### ❌ "redirect_uri_mismatch" 에러

**원인**: Google Cloud Console의 Authorized redirect URIs와 Supabase redirect URL 불일치

**해결**:
1. Google Cloud Console → Credentials → OAuth 2.0 Client ID
2. Authorized redirect URIs 확인:
   ```
   https://vjmnjyuzcrflojvktlyj.supabase.co/auth/v1/callback
   ```
3. Supabase 프로젝트 ID 정확히 일치하는지 확인

### ❌ "Invalid client" 에러

**원인**: Supabase에 입력한 Client ID 또는 Client Secret이 잘못됨

**해결**:
1. Google Cloud Console에서 Client ID, Secret 다시 복사
2. Supabase → Authentication → Providers → Google에 다시 입력
3. 공백 없이 정확히 붙여넣기

### ❌ 앱으로 복귀하지 않음

**원인**: Deep Linking 설정 문제

**해결**:
1. `app.json`에 `"scheme": "yogis"` 있는지 확인
2. `App.native.tsx`에서 `WebBrowser.maybeCompleteAuthSession()` 호출 확인
3. Expo 앱 재시작: `npx expo start -c`

### ❌ "Access blocked: This app's request is invalid"

**원인**: Google OAuth 동의 화면 미완성

**해결**:
1. Google Cloud Console → OAuth consent screen
2. Publishing status가 "Testing" 또는 "In production"인지 확인
3. 테스트 모드라면 Test users에 본인 이메일 추가

### ❌ Expo Go에서 작동하지 않음

**원인**: Expo Go 전용 redirect URI 미설정

**해결**:
1. Supabase → Authentication → URL Configuration
2. Redirect URLs에 추가:
   ```
   exp://localhost:8082
   exp://localhost:19000
   ```
3. `makeRedirectUri({ scheme: 'yogis' })`가 Expo Go에서 자동으로 `exp://` URL 생성

---

## 📱 프로덕션 빌드 시 추가 설정

### iOS (App Store)

1. **Google Cloud Console**에 iOS Client ID 추가:
   - Application type: **iOS**
   - Bundle ID: `com.yogis.app`

2. **Xcode 프로젝트**에 URL Scheme 추가:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>yogis</string>
       </array>
     </dict>
   </array>
   ```

### Android (Play Store)

1. **Google Cloud Console**에 Android Client ID 추가:
   - Application type: **Android**
   - Package name: `com.yogis.app`
   - SHA-1 certificate fingerprint 추가

2. SHA-1 생성:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

---

## ✅ 체크리스트

- [ ] Google Cloud Console에서 OAuth 2.0 Client ID 생성
- [ ] Google Cloud Console에 Supabase redirect URI 추가
- [ ] Supabase에서 Google Provider 활성화
- [ ] Supabase에 Google Client ID, Secret 입력
- [ ] Supabase에 앱 redirect URI 추가 (`yogis://auth/callback`)
- [ ] `app.json`에 scheme 설정
- [ ] `supabaseService.ts`에 AsyncStorage 설정
- [ ] `App.native.tsx`에 Deep Linking 리스너 추가
- [ ] Expo 앱에서 Google 로그인 테스트
- [ ] 세션 지속성 테스트 (앱 재시작)

---

## 🔗 참고 자료

- [Supabase Google Auth 가이드](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo AuthSession 문서](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)

---

**설정 완료 후 질문이나 문제가 있으면 언제든지 말씀해주세요!** 🚀
