import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '../public/og-image.jpg');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0b0c"/>
      <stop offset="60%" stop-color="#1a0a10"/>
      <stop offset="100%" stop-color="#3b0a18"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#e11d48" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="10%" cy="90%" r="40%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#e11d48" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- subtle road grid lines -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120"/>
    <line x1="0" y1="240" x2="1200" y2="240"/>
    <line x1="0" y1="360" x2="1200" y2="360"/>
    <line x1="0" y1="480" x2="1200" y2="480"/>
    <line x1="0" y1="600" x2="1200" y2="600"/>
  </g>

  <!-- top eyebrow -->
  <g transform="translate(80, 80)">
    <rect x="0" y="0" width="380" height="44" rx="22" fill="#e11d48" fill-opacity="0.18" stroke="#e11d48" stroke-opacity="0.6" stroke-width="1"/>
    <text x="24" y="29" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="3" fill="#fda4af">EDMONTON · ALBERTA · CANADA</text>
  </g>

  <!-- logo mark + brand -->
  <g transform="translate(80, 160)">
    <rect x="0" y="0" width="64" height="64" rx="14" fill="#e11d48"/>
    <!-- graduation cap -->
    <g transform="translate(12, 18)" fill="#fff">
      <path d="M20 0 L40 8 L20 16 L0 8 Z"/>
      <path d="M8 12 V22 C8 26 14 28 20 28 C26 28 32 26 32 22 V12 L20 17 Z" />
      <rect x="38" y="9" width="2" height="14"/>
      <circle cx="39" cy="24" r="2.5"/>
    </g>
    <text x="84" y="44" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="900" letter-spacing="-1" fill="#ffffff">READY 2 <tspan fill="#fb7185">DRIVE</tspan></text>
  </g>

  <!-- headline -->
  <g transform="translate(80, 270)">
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="84" font-weight="900" letter-spacing="-3" fill="#ffffff">
      <tspan x="0" dy="0">MASTER THE</tspan>
      <tspan x="0" dy="92" fill="#fb7185" font-style="italic">ROAD.</tspan>
      <tspan x="290" dy="0" fill="#ffffff"> WITH CONFIDENCE.</tspan>
    </text>
  </g>

  <!-- bottom row: stats + cta -->
  <g transform="translate(80, 510)">
    <g>
      <text font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="900" fill="#ffffff">98%</text>
      <text x="0" y="28" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#9ca3af">PASS RATE</text>
    </g>
    <g transform="translate(180, 0)">
      <text font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="900" fill="#ffffff">5,000+</text>
      <text x="0" y="28" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#9ca3af">STUDENTS TRAINED</text>
    </g>
    <g transform="translate(420, 0)">
      <text font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="900" fill="#ffffff">15+</text>
      <text x="0" y="28" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#9ca3af">YEARS EXPERIENCE</text>
    </g>
  </g>

  <!-- right-side CTA pill -->
  <g transform="translate(820, 500)">
    <rect x="0" y="0" width="300" height="68" rx="34" fill="#e11d48"/>
    <text x="150" y="42" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="900" letter-spacing="1" fill="#ffffff">CALL (780) 235-8082</text>
  </g>

  <!-- domain footer -->
  <text x="1120" y="60" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#9ca3af">READY2DRIVE.IT.COM</text>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, progressive: true, mozjpeg: true })
  .toFile(out);

console.log('OG image written to', out);
