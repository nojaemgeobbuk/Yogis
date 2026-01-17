import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config'; // vitest 설정이 포함된 defineConfig 사용
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // CSS 설정: PostCSS 플러그인 연결
        css: {
            postcss: {
                plugins: [
                    tailwindcss(), // v4에서는 함수 형태로 호출하는 것이 안전함
                    autoprefixer(),
                ],
            },
        },
        assetsInclude: [],
        plugins: [
            react({
                exclude: /\.(native\.tsx?|screens\/.*|navigation\/.*)$/,
            }),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
                manifest: {
                    name: 'Yoga Journal - 요가 수련 일지',
                    short_name: 'YogaJournal',
                    description: '나만의 요가 수련과 성장을 기록하는 공간',
                    theme_color: '#0d9488',
                    background_color: '#fafaf9',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: '/',
                    scope: '/',
                    icons: [
                        {
                            src: 'pwa-192x192.svg',
                            sizes: '192x192',
                            type: 'image/svg+xml',
                        },
                        {
                            src: 'pwa-512x512.svg',
                            sizes: '512x512',
                            type: 'image/svg+xml',
                        },
                        {
                            src: 'pwa-512x512.svg',
                            sizes: '512x512',
                            type: 'image/svg+xml',
                            purpose: 'any maskable',
                        },
                    ],
                    categories: ['health', 'fitness', 'lifestyle'],
                    lang: 'ko',
                },
                workbox: {
                    // 캐싱 전략 설정
                    runtimeCaching: [
                        {
                            // Supabase API 요청 캐싱 (Network First)
                            urlPattern: /^https:\/\/vjmnjyuzcrflojvktlyj\.supabase\.co\/.*/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'supabase-api-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24, // 1일
                                },
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                        {
                            // 이미지 캐싱 (Cache First)
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'image-cache',
                                expiration: {
                                    maxEntries: 200,
                                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
                                },
                            },
                        },
                        {
                            // Google Fonts 캐싱
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
                                },
                            },
                        },
                    ],
                    // 오프라인 폴백 페이지
                    navigateFallback: '/index.html',
                    navigateFallbackDenylist: [/^\/api/],
                },
                devOptions: {
                    enabled: true, // 개발 중에도 PWA 테스트 가능
                },
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'), // 보통 소스 폴더를 @로 지정
            },
        },
        define: {
            // 클라이언트 사이드에서 환경변수 사용 시 필요
            'process.env': env,
        },
        optimizeDeps: {
            exclude: [
                'react-native',
                'react-native-web',
                '@react-navigation/native',
                '@react-navigation/bottom-tabs',
                '@react-navigation/native-stack',
                'react-native-screens',
                'react-native-safe-area-context',
            ],
        },
        build: {
            rollupOptions: {
                input: {
                    main: './index.html',
                },
                external: [
                    'react-native',
                    /^react-native\//,
                    '@react-navigation/native',
                    '@react-navigation/bottom-tabs',
                    '@react-navigation/native-stack',
                    'react-native-screens',
                    'react-native-safe-area-context',
                    /^expo.*/,
                    'expo',
                    'expo-web-browser',
                    'expo-auth-session',
                    'expo-font',
                    'expo-status-bar',
                    'expo-sharing',
                    'expo-file-system',
                ],
                output: {
                    manualChunks: undefined,
                },
            },
        },
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        test: {
            globals: true,
            environment: 'happy-dom',
            setupFiles: ['./setupTests.ts'], // 파일이 존재하는지 확인 필요
        }
    };
});