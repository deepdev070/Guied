import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Core Web Vitals Performance Audit (Prompt 81)", () => {
  it("fonts: exports valid font CSS variables with display=swap and preloading", () => {
    const fontFileContent = fs.readFileSync(path.join(process.cwd(), "src/lib/fonts.ts"), "utf8");
    assert.ok(
      fontFileContent.includes("--font-inter"),
      "Font variables must include Inter font variable"
    );
    assert.ok(
      fontFileContent.includes("--font-noto-devanagari"),
      "Font variables must include Noto Sans Devanagari font variable"
    );
    assert.ok(
      fontFileContent.includes("--font-noto-gujarati"),
      "Font variables must include Noto Sans Gujarati font variable"
    );
    assert.ok(
      fontFileContent.includes('display: "swap"'),
      "Fonts must use display: swap to prevent FOIT"
    );
    assert.ok(
      fontFileContent.includes("preload: true"),
      "Fonts must enable preloading for fast LCP"
    );
  });

  it("ad slots: LeaderboardAd reserves exact min-height of 90px to guarantee zero CLS", () => {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ads/LeaderboardAd.tsx"),
      "utf8"
    );
    assert.ok(
      fileContent.includes("min-h-[90px]"),
      "Leaderboard ad slot must reserve minimum 90px height to prevent Cumulative Layout Shift"
    );
  });

  it("ad slots: SidebarAd reserves exact min-height of 250px to guarantee zero CLS", () => {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ads/SidebarAd.tsx"),
      "utf8"
    );
    assert.ok(
      fileContent.includes("min-h-[250px]") || fileContent.includes("h-[250px]"),
      "Sidebar ad slot must reserve 250px height"
    );
  });

  it("header: top optional ad slot reserves responsive height to prevent layout shift", () => {
    const headerContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/layout/Header.tsx"),
      "utf8"
    );
    assert.ok(
      headerContent.includes("h-[50px]") && headerContent.includes("sm:h-[90px]"),
      "Top banner ad container in Header must reserve height (50px mobile / 90px desktop)"
    );
  });

  it("images: CivicImage component enforces dimension constraints and lazy loading", () => {
    const civicImageContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/CivicImage.tsx"),
      "utf8"
    );
    assert.ok(civicImageContent.includes("next/image"), "CivicImage must wrap next/image");
    assert.ok(
      civicImageContent.includes("aspectRatio") || civicImageContent.includes("fill"),
      "CivicImage must support aspect-ratio or fill container for 0 CLS"
    );
    assert.ok(
      civicImageContent.includes('loading={priority ? undefined : "lazy"}') ||
        civicImageContent.includes('"lazy"'),
      "CivicImage must default to lazy loading for below-the-fold images"
    );
  });

  it("next.config: compression, security headers and modern image formats configured", () => {
    const configContent = fs.readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
    assert.ok(
      configContent.includes("compress: true"),
      "next.config.ts must enable Gzip/Brotli compression"
    );
    assert.ok(
      configContent.includes("image/avif") && configContent.includes("image/webp"),
      "next.config.ts must configure AVIF and WebP modern image formats"
    );
    assert.ok(
      configContent.includes("poweredByHeader: false"),
      "next.config.ts must disable x-powered-by header"
    );
  });

  it("lazy-loading: TaskPageView code-splits below-the-fold components", () => {
    const taskPageContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskPageView.tsx"),
      "utf8"
    );
    assert.ok(
      taskPageContent.includes("dynamic("),
      "TaskPageView must use next/dynamic for below-the-fold code splitting"
    );
    assert.ok(
      taskPageContent.includes("PrintTaskView = dynamic("),
      "PrintTaskView must be lazy loaded"
    );
    assert.ok(
      taskPageContent.includes("HelpfulFeedbackWidget = dynamic("),
      "HelpfulFeedbackWidget must be lazy loaded"
    );
    assert.ok(
      taskPageContent.includes("NearbyStatesSection = dynamic("),
      "NearbyStatesSection must be lazy loaded"
    );
    assert.ok(
      taskPageContent.includes("PopularInStateBlock = dynamic("),
      "PopularInStateBlock must be lazy loaded"
    );
  });
});
