import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        // PostCSS 설정을 최상위 레벨로 이동
        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                    autoprefixer,
                ],
            },
        },
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        // React 플러그인은 CSS 설정 없이 순수하게 유지
        plugins: [
            react(),
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        test: {
            globals: true,
            environment: 'happy-dom',
            setupFiles: ['./setupTests.ts'],
        }
    };
});