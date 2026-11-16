import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const iconsDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Standard Logo SVG (512x512)
export const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- App Background Squircle -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)"/>
  
  <!-- Subtle Saffron & Green Accent Bars (Indian Civic Symbolism) -->
  <path d="M 124 64 L 388 64" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/>
  <path d="M 124 448 L 388 448" stroke="#10B981" stroke-width="8" stroke-linecap="round"/>

  <!-- Document Sheet with Folded Corner -->
  <g filter="url(#shadow)">
    <!-- Base Paper -->
    <path d="M 144 112 
             L 304 112 
             L 368 176 
             L 368 392 
             A 16 16 0 0 1 352 408 
             L 160 408 
             A 16 16 0 0 1 144 392 
             Z" 
          fill="#FFFFFF"/>
    
    <!-- Folded Corner Flap -->
    <path d="M 304 112 
             L 304 168 
             A 8 8 0 0 0 312 176 
             L 368 176 
             Z" 
          fill="#E2E8F0"/>
    <path d="M 304 176 L 368 176" stroke="#CBD5E1" stroke-width="2"/>
    
    <!-- Document Content Checklist Lines -->
    <rect x="180" y="168" width="96" height="14" rx="7" fill="#003366"/>
    <rect x="180" y="212" width="22" height="22" rx="5" fill="#DBEAFE"/>
    <rect x="216" y="217" width="124" height="12" rx="6" fill="#94A3B8"/>
    <rect x="180" y="252" width="22" height="22" rx="5" fill="#DBEAFE"/>
    <rect x="216" y="257" width="112" height="12" rx="6" fill="#94A3B8"/>
    <rect x="180" y="292" width="22" height="22" rx="5" fill="#DBEAFE"/>
    <rect x="216" y="297" width="96" height="12" rx="6" fill="#94A3B8"/>
  </g>

  <!-- Circular Verification Badge -->
  <g filter="url(#shadow)">
    <circle cx="344" cy="352" r="56" fill="url(#checkGrad)" stroke="#FFFFFF" stroke-width="8"/>
    <path d="M 320 352 L 338 370 L 372 334" 
          fill="none" 
          stroke="#FFFFFF" 
          stroke-width="12" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
  </g>
</svg>`;

// 2. Maskable Logo SVG (512x512 with safe zone)
export const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="mCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
    <filter id="mShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Full 100% Bleed Background (Maskable requirement) -->
  <rect x="0" y="0" width="512" height="512" fill="url(#mBgGrad)"/>

  <!-- Centered Scaled Artwork in Safe Zone (central 64%) -->
  <g transform="translate(64, 64) scale(0.75)">
    <g filter="url(#mShadow)">
      <path d="M 144 112 
               L 304 112 
               L 368 176 
               L 368 392 
               A 16 16 0 0 1 352 408 
               L 160 408 
               A 16 16 0 0 1 144 392 
               Z" 
            fill="#FFFFFF"/>
      <path d="M 304 112 
               L 304 168 
               A 8 8 0 0 0 312 176 
               L 368 176 
               Z" 
            fill="#E2E8F0"/>
      <path d="M 304 176 L 368 176" stroke="#CBD5E1" stroke-width="2"/>
      
      <rect x="180" y="168" width="96" height="14" rx="7" fill="#003366"/>
      <rect x="180" y="212" width="22" height="22" rx="5" fill="#DBEAFE"/>
      <rect x="216" y="217" width="124" height="12" rx="6" fill="#94A3B8"/>
      <rect x="180" y="252" width="22" height="22" rx="5" fill="#DBEAFE"/>
      <rect x="216" y="257" width="112" height="12" rx="6" fill="#94A3B8"/>
      <rect x="180" y="292" width="22" height="22" rx="5" fill="#DBEAFE"/>
      <rect x="216" y="297" width="96" height="12" rx="6" fill="#94A3B8"/>
    </g>

    <g filter="url(#mShadow)">
      <circle cx="344" cy="352" r="56" fill="url(#mCheckGrad)" stroke="#FFFFFF" stroke-width="8"/>
      <path d="M 320 352 L 338 370 L 372 334" 
            fill="none" 
            stroke="#FFFFFF" 
            stroke-width="12" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

export async function generatePwaIcons() {
  fs.writeFileSync(path.join(iconsDir, "icon.svg"), standardSvg, "utf-8");
  fs.writeFileSync(path.join(iconsDir, "icon-maskable.svg"), maskableSvg, "utf-8");

  const stdBuffer = Buffer.from(standardSvg);
  const maskBuffer = Buffer.from(maskableSvg);

  const targets = [
    { name: "icon-192.png", size: 192, buffer: stdBuffer },
    { name: "icon-192-maskable.png", size: 192, buffer: maskBuffer },
    { name: "icon-512.png", size: 512, buffer: stdBuffer },
    { name: "icon-512-maskable.png", size: 512, buffer: maskBuffer },
    { name: "icon-1024.png", size: 1024, buffer: stdBuffer },
    { name: "icon-1024-maskable.png", size: 1024, buffer: maskBuffer },
    { name: "apple-touch-icon.png", size: 180, buffer: stdBuffer },
  ];

  for (const t of targets) {
    const outPath = path.join(iconsDir, t.name);
    await sharp(t.buffer).resize(t.size, t.size).png().toFile(outPath);
  }
}

if (process.argv[1]?.endsWith("generate-pwa-icons.ts")) {
  generatePwaIcons()
    .then(() => console.log("PWA icons generated successfully."))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
