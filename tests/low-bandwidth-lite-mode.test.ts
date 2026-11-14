import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 101: Low-Bandwidth and Old-Phone Mode Optimisations", () => {
  it("1. LiteModeToggle: exports toggle component, storage key, cookie name, and accessible role='switch'", () => {
    const compPath = path.join(process.cwd(), "src/components/layout/LiteModeToggle.tsx");
    assert.ok(fs.existsSync(compPath), "LiteModeToggle.tsx must exist");

    const content = fs.readFileSync(compPath, "utf8");
    assert.ok(content.includes('role="switch"'), "Toggle must use role='switch'");
    assert.ok(
      content.includes("aria-checked="),
      "Toggle must communicate checked state via aria-checked"
    );
    assert.ok(
      content.includes("CIVIC_LITE_MODE_STORAGE_KEY"),
      "Must define storage key for local persistence"
    );
    assert.ok(
      content.includes("CIVIC_LITE_MODE_COOKIE"),
      "Must define cookie name for session persistence"
    );
    assert.ok(
      content.includes('setAttribute("data-lite-mode"'),
      "Must set data-lite-mode attribute on document.documentElement"
    );
  });

  it("2. Lite Mode CSS: removes illustrations, animations, backdrop-filters, and soft shadows", () => {
    const cssPath = path.join(process.cwd(), "src/app/globals.css");
    const content = fs.readFileSync(cssPath, "utf8");

    // Illustrations removed
    assert.ok(
      content.includes('html[data-lite-mode="true"] .civic-illustration') &&
        content.includes("display: none !important;"),
      "Lite mode must hide illustrations via display: none !important"
    );

    // Animations & transitions zeroed out for low-end CPUs
    assert.ok(
      content.includes('html[data-lite-mode="true"] *') &&
        content.includes("animation-duration: 0.001ms !important;") &&
        content.includes("transition-duration: 0.001ms !important;"),
      "Lite mode must zero out animation and transition durations"
    );

    // GPU-intensive backdrop blur disabled
    assert.ok(
      content.includes("backdrop-filter: none !important;"),
      "Lite mode must disable backdrop blur filters"
    );

    // Shadows eliminated
    assert.ok(
      content.includes("--shadow-soft-md: none;"),
      "Lite mode must eliminate box shadows to reduce GPU paint overhead"
    );
  });

  it("3. Illustration Components: Hero, Empty, and Success illustrations carry data-illustration tag", () => {
    const heroPath = path.join(process.cwd(), "src/components/illustrations/HeroIllustration.tsx");
    const emptyPath = path.join(
      process.cwd(),
      "src/components/illustrations/EmptyIllustration.tsx"
    );
    const successPath = path.join(
      process.cwd(),
      "src/components/illustrations/SuccessIllustration.tsx"
    );

    const heroContent = fs.readFileSync(heroPath, "utf8");
    const emptyContent = fs.readFileSync(emptyPath, "utf8");
    const successContent = fs.readFileSync(successPath, "utf8");

    assert.ok(
      heroContent.includes('data-illustration="true"') &&
        heroContent.includes("civic-illustration"),
      "HeroIllustration must carry data-illustration='true' and civic-illustration class"
    );
    assert.ok(
      emptyContent.includes('data-illustration="true"') &&
        emptyContent.includes("civic-illustration"),
      "EmptyIllustration must carry data-illustration='true' and civic-illustration class"
    );
    assert.ok(
      successContent.includes('data-illustration="true"') &&
        successContent.includes("civic-illustration"),
      "SuccessIllustration must carry data-illustration='true' and civic-illustration class"
    );
  });

  it("4. Low-Bandwidth Network & Image Settings: AVIF/WebP compression, 360px mobile viewports, and compress: true", () => {
    const configPath = path.join(process.cwd(), "next.config.ts");
    const content = fs.readFileSync(configPath, "utf8");

    assert.ok(
      content.includes("compress: true"),
      "next.config.ts must enable gzip/brotli compression"
    );
    assert.ok(
      content.includes('"image/avif"') && content.includes('"image/webp"'),
      "next.config.ts must support modern AVIF and WebP image formats"
    );
    assert.ok(
      content.includes("360"),
      "deviceSizes must include 360px for budget Indian smartphones (e.g. JioPhone / Redmi)"
    );
  });

  it("5. System Font Fallbacks: Next.js fonts use display: 'swap' with system fallback stack", () => {
    const fontsPath = path.join(process.cwd(), "src/lib/fonts.ts");
    const globalsPath = path.join(process.cwd(), "src/app/globals.css");

    const fontsContent = fs.readFileSync(fontsPath, "utf8");
    const globalsContent = fs.readFileSync(globalsPath, "utf8");

    assert.ok(
      fontsContent.includes('display: "swap"'),
      "Fonts must use display: 'swap' to avoid FOIT on 3G"
    );
    assert.ok(
      globalsContent.includes("system-ui") && globalsContent.includes("sans-serif"),
      "globals.css must specify system-ui and sans-serif fallbacks during network delay"
    );
  });

  it("6. Header, Mobile Drawer, Footer and Head Integration: Lite mode toggle is universally accessible", () => {
    const headerPath = path.join(process.cwd(), "src/components/layout/Header.tsx");
    const mobilePath = path.join(process.cwd(), "src/components/layout/MobileNav.tsx");
    const footerPath = path.join(process.cwd(), "src/components/layout/Footer.tsx");
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");

    const headerContent = fs.readFileSync(headerPath, "utf8");
    const mobileContent = fs.readFileSync(mobilePath, "utf8");
    const footerContent = fs.readFileSync(footerPath, "utf8");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    assert.ok(headerContent.includes("<LiteModeToggle"), "Header must include LiteModeToggle");
    assert.ok(
      mobileContent.includes("<LiteModeToggle"),
      "MobileNav drawer must include LiteModeToggle"
    );
    assert.ok(footerContent.includes("<LiteModeToggle"), "Footer must include LiteModeToggle");
    assert.ok(
      layoutContent.includes("civic_lite_mode"),
      "Root layout head script must restore data-lite-mode before first paint"
    );
  });
});
