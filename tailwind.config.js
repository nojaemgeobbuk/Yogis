/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Tailwind 4에서는 대부분의 테마 설정이 CSS @theme 블록에서 관리됩니다.
      // index.css의 @theme 블록에서 전체 Zen 디자인 시스템을 확인하세요.
    },
  },
  plugins: [],
}
