import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config'; // 1. 여기를 'vite' 대신 'vitest/config'로 변경
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        // 2. 아래 test 설정 블록을 추가했습니다.
        test: {
            globals: true,
            environment: 'happy-dom',
            setupFiles: ['./setupTests.ts'], // 방금 만든 설정 파일 연결
        }
    };
});