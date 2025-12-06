import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config'; // vitest 설정이 포함된 defineConfig 사용
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

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
        plugins: [
            react(),
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