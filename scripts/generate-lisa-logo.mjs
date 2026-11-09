/**
 * LisaPay Logo PNG Generator
 * Generates lisapay-icon-192.png, lisapay-icon-512.png, lisapay-logo-square.png
 * Uses SVG → canvas (via sharp or canvas package if available, else writes SVG directly)
 */

import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "../public");

// ─── LisaPay Icon SVG ────────────────────────────────────────────────────────
// Deep navy background, stylized "L" mark with Naira ₦ coin, electric blue accent
function buildIconSVG(size = 512) {
  const r = Math.round(size * 0.22); // corner radius
  const cx = size / 2;
  const cy = size / 2;

  // L pillar: thick vertical + horizontal foot
  const lx = Math.round(size * 0.24);
  const ly = Math.round(size * 0.18);
  const lw = Math.round(size * 0.14); // stroke width of L
  const lBottom = Math.round(size * 0.75);
  const lRight = Math.round(size * 0.76);

  // Naira coin center
  const coinR = Math.round(size * 0.185);
  const coinCx = Math.round(size * 0.615);
  const coinCy = Math.round(size * 0.44);
  const coinFontSize = Math.round(size * 0.21);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#061129"/>
      <stop offset="100%" stop-color="#0d1f4a"/>
    </linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4F9CF9"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${Math.round(size * 0.025)}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- Subtle top sheen -->
  <rect width="${size}" height="${Math.round(size * 0.45)}" rx="${r}" ry="${r}" fill="url(#blue)" opacity="0.07"/>

  <!-- Blue accent arc (top-left glow) -->
  <circle cx="${Math.round(size * 0.18)}" cy="${Math.round(size * 0.18)}" r="${Math.round(size * 0.32)}"
    fill="none" stroke="#2563EB" stroke-width="${Math.round(size * 0.012)}" opacity="0.18"/>

  <!-- Letter L — vertical bar -->
  <rect x="${lx}" y="${ly}" width="${lw}" height="${lBottom - ly}" rx="${Math.round(lw * 0.3)}" fill="white"/>

  <!-- Letter L — horizontal foot -->
  <rect x="${lx}" y="${lBottom - lw}" width="${lRight - lx}" height="${lw}" rx="${Math.round(lw * 0.3)}" fill="white"/>

  <!-- Blue dot accent on top of L -->
  <circle cx="${lx + lw / 2}" cy="${ly - Math.round(size * 0.03)}" r="${Math.round(size * 0.025)}" fill="url(#blue)" filter="url(#glow)"/>

  <!-- Naira coin -->
  <circle cx="${coinCx}" cy="${coinCy}" r="${coinR}" fill="url(#gold)"/>
  <circle cx="${coinCx}" cy="${coinCy}" r="${coinR - Math.round(size * 0.012)}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="${Math.round(size * 0.012)}"/>

  <!-- ₦ symbol inside coin -->
  <text x="${coinCx}" y="${coinCy + Math.round(coinFontSize * 0.36)}"
    text-anchor="middle"
    font-family="'Arial Black', 'Impact', sans-serif"
    font-size="${coinFontSize}"
    font-weight="900"
    fill="#78350f">₦</text>

  <!-- Thin blue border on whole icon -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}"
    fill="none" stroke="#2563EB" stroke-width="${Math.round(size * 0.008)}" opacity="0.4"/>
</svg>`;
}

// Write SVGs (browsers accept SVG as icon too; also acts as source)
const svg512 = buildIconSVG(512);
const svg192 = buildIconSVG(192);

writeFileSync(join(PUBLIC, "lisapay-icon-512.svg"), svg512, "utf8");
writeFileSync(join(PUBLIC, "lisapay-icon-192.svg"), svg192, "utf8");
writeFileSync(join(PUBLIC, "lisapay-logo-square.svg"), svg512, "utf8");

console.log("✅ LisaPay SVG icons written to public/:");
console.log("   lisapay-icon-512.svg");
console.log("   lisapay-icon-192.svg");
console.log("   lisapay-logo-square.svg");
console.log("");
console.log("ℹ️  For PNG versions, the app will reference these SVGs.");
console.log("   Update manifest.json and layout.tsx to use .svg paths.");

