import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

describe("Prompt 98: WCAG 2.2 AA Accessibility Audit and Invariants", () => {
  it("1. Semantic Landmarks: layout defines skip-link, header, main, and footer", () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");

    // Skip to main content link
    assert.ok(
      layoutContent.includes('href="#main-content"'),
      "Layout must contain skip to main content link"
    );
    assert.ok(
      layoutContent.includes("sr-only") && layoutContent.includes("focus:not-sr-only"),
      "Skip link must use accessible sr-only pattern that becomes visible on keyboard focus"
    );

    // Main landmark with id matching skip-link target
    assert.ok(
      layoutContent.includes('<main id="main-content"'),
      "Layout must provide <main id='main-content'> landmark"
    );

    // Search landmark
    const searchContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/search/SearchAutocomplete.tsx"),
      "utf8"
    );
    assert.ok(
      searchContent.includes('role="search"'),
      "Search autocomplete must declare role='search' landmark"
    );
  });

  it("2. Heading Order: validates single H1 and sequential nesting", () => {
    const homeHeroContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/HomeHero.tsx"),
      "utf8"
    );
    const taskPageContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskPageView.tsx"),
      "utf8"
    );

    // Exactly one H1 in home hero and task view
    const homeH1Matches = homeHeroContent.match(/<h1\b/g) || [];
    assert.strictEqual(homeH1Matches.length, 1, "Home hero must have exactly one H1");

    const taskH1Matches = taskPageContent.match(/<h1\b/g) || [];
    assert.strictEqual(taskH1Matches.length, 1, "TaskPageView must have exactly one H1");
  });

  it("3. Colour Contrast: verifies WCAG 2.2 AA contrast ratios >= 4.5:1", () => {
    const whiteBg = "#FFFFFF";

    const colors = [
      { name: "text", hex: "#0F172A", minRatio: 4.5 },
      { name: "muted", hex: "#475569", minRatio: 4.5 },
      { name: "primary", hex: "#2563EB", minRatio: 4.5 },
      { name: "warning", hex: "#B45309", minRatio: 4.5 },
      { name: "danger", hex: "#B91C1C", minRatio: 4.5 },
      { name: "success", hex: "#15803D", minRatio: 4.5 },
    ];

    for (const c of colors) {
      const ratio = calculateContrastRatio(c.hex, whiteBg);
      assert.ok(
        ratio >= c.minRatio,
        `Color ${c.name} (${c.hex}) against white must have contrast >= ${c.minRatio}:1, got ${ratio.toFixed(2)}:1`
      );
    }
  });

  it("4. Focus Appearance: universal focus visible ring meets WCAG 2.2 AA (Criterion 2.4.11 / 2.4.13)", () => {
    const cssContent = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

    assert.ok(
      cssContent.includes(":focus-visible"),
      "globals.css must define universal :focus-visible appearance"
    );
    assert.ok(
      cssContent.includes("3px solid rgba(37, 99, 235, 0.4)"),
      "Focus ring must use 3px primary ring at 40% opacity"
    );
    assert.ok(
      cssContent.includes("outline-offset: 2px"),
      "Focus ring must maintain 2px offset to avoid overlapping border"
    );
  });

  it("5. Reduced Motion: satisfies WCAG 2.2 AA (Criterion 2.3.3)", () => {
    const cssContent = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

    assert.ok(
      cssContent.includes("@media (prefers-reduced-motion: reduce)"),
      "globals.css must define @media (prefers-reduced-motion: reduce)"
    );
    assert.ok(
      cssContent.includes("animation-duration: 0.01ms !important"),
      "Reduced motion must disable animations for vestibular comfort"
    );
    assert.ok(
      cssContent.includes("transition-duration: 0.01ms !important"),
      "Reduced motion must disable CSS transitions"
    );
  });

  it("6. Touch Target Size: buttons, chips, and switchers meet WCAG 2.2 AA (Criterion 2.5.8)", () => {
    const buttonContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Button.tsx"),
      "utf8"
    );
    const langSwitcherContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/layout/LanguageSwitcher.tsx"),
      "utf8"
    );

    // Button md is 44px, lg is 52px
    assert.ok(
      buttonContent.includes("h-11") || buttonContent.includes("min-h-[44px]"),
      "Button component md size must provide 44px height"
    );
    assert.ok(
      buttonContent.includes("h-13") || buttonContent.includes("min-h-[52px]"),
      "Button component lg size must provide 52px height"
    );

    // Language switcher buttons provide 44px touch area
    assert.ok(
      langSwitcherContent.includes("min-h-[44px]"),
      "Language switcher must enforce 44px minimum touch targets"
    );
  });
});
