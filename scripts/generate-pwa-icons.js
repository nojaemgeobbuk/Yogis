/**
 * PWA 아이콘 생성 스크립트
 *
 * 실행 방법:
 * 1. npm install sharp (또는 canvas)
 * 2. node scripts/generate-pwa-icons.js
 *
 * 또는 온라인 도구 사용:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 *
 * favicon.svg를 업로드하면 모든 사이즈의 아이콘을 자동 생성합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG 템플릿 (Yoga Tree Pose)
const createSvgIcon = (size, bgColor = '#0d9488') => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${bgColor}" rx="20"/>
  <g fill="#fff">
    <circle cx="50" cy="25" r="7"/>
    <path d="M50 32 L50 55 Q50 60 50 65" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M35 40 Q42 30 50 28 Q58 30 65 40" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 65 L50 82" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 55 Q60 50 55 65" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

// SVG 아이콘 생성 (PNG 변환이 필요한 경우 sharp 또는 canvas 사용)
const icons = [
  { name: 'pwa-192x192.svg', size: 192 },
  { name: 'pwa-512x512.svg', size: 512 },
  { name: 'apple-touch-icon.svg', size: 180 },
];

icons.forEach(({ name, size }) => {
  const svg = createSvgIcon(size);
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, svg);
  console.log(`Created: ${name}`);
});

console.log(`
=== PWA 아이콘 생성 완료 ===

SVG 파일이 생성되었습니다. PNG로 변환하려면:

옵션 1: Sharp 사용 (Node.js)
  npm install sharp
  그리고 아래 코드 추가:

  const sharp = require('sharp');
  sharp('public/pwa-192x192.svg')
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

옵션 2: 온라인 변환
  - https://cloudconvert.com/svg-to-png
  - https://svgtopng.com/

옵션 3: PWA Builder 사용 (권장)
  - https://www.pwabuilder.com/imageGenerator
  - favicon.svg 업로드 → 모든 사이즈 자동 생성
`);
