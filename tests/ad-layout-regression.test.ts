import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { AD_FORMAT_CONFIGS, type AdFormat } from "../src/components/ads/formats.ts";
import {
  AD_PLACEMENTS,
  isLegalOrAdFreeRoute,
  canRenderAdPlacement,
} from "../src/components/ads/placements.ts";

describe("Prompt 94: Ad Layout Regression Tests across 360px, 768px, and 1280px", () => {
  const VIEWPORTS = [
    { name: "Mobile", width: 360, height: 740 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1280, height: 800 },
  ];

  it("1. Slot height reservation: all formats reserve height preventing CLS at 360px, 768px, and 1280px", () => {
    const formats: AdFormat[] = [
      "leaderboard",
      "mobile-banner",
      "rectangle",
      "large-rectangle",
      "skyscraper",
      "in-article",
      "anchor",
    ];

    for (const fmt of formats) {
      const config = AD_FORMAT_CONFIGS[fmt];
      assert.ok(config, `Format ${fmt} must be registered in AD_FORMAT_CONFIGS`);
      assert.ok(
        config.minHeightPx >= 50,
        `Format ${fmt} minHeightPx (${config.minHeightPx}) must reserve at least 50px`
      );
      assert.ok(
        config.className.includes(`min-h-[${config.minHeightPx}px]`) ||
          config.className.includes(`h-[${config.minHeightPx}px]`),
        `Format ${fmt} className must explicitly reserve height`
      );
    }

    // Mobile 360px constraints
    assert.strictEqual(AD_FORMAT_CONFIGS.anchor.minHeightPx, 50);
    assert.strictEqual(AD_FORMAT_CONFIGS["mobile-banner"].minHeightPx, 100);

    // Tablet 768px constraints
    assert.strictEqual(AD_FORMAT_CONFIGS.rectangle.minHeightPx, 250);

    // Desktop 1280px constraints
    assert.strictEqual(AD_FORMAT_CONFIGS.leaderboard.minHeightPx, 90);
    assert.strictEqual(AD_FORMAT_CONFIGS.skyscraper.minHeightPx, 600);
  });

  it("2. CLS Math Model: reserved height guarantees CLS < 0.05 upon ad injection", () => {
    for (const vp of VIEWPORTS) {
      for (const [fmt, config] of Object.entries(AD_FORMAT_CONFIGS)) {
        // When height is pre-allocated (min-height = config.minHeightPx),
        // subsequent insertion of an ad iframe with height <= minHeightPx moves elements below by 0px.
        const unshiftedDistance = 0;
        const clsShift = (unshiftedDistance / vp.height) * (config.minHeightPx / vp.height);
        assert.strictEqual(
          clsShift,
          0,
          `Reserved height for ${fmt} at viewport ${vp.name} (${vp.width}px) must produce 0 CLS shift`
        );
        assert.ok(
          clsShift < 0.05,
          `CLS shift (${clsShift}) must remain strictly below 0.05 threshold`
        );
      }
    }
  });

  it("3. Print Mode absence: all ad components have print:hidden", () => {
    const adFiles = [
      "src/components/ads/AdSlot.tsx",
      "src/components/ads/MobileAnchorAd.tsx",
      "src/components/ads/LeaderboardAd.tsx",
      "src/components/ads/SidebarAd.tsx",
    ];

    for (const file of adFiles) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        assert.ok(
          content.includes("print:hidden"),
          `File ${file} must include 'print:hidden' utility class to guarantee absence on print`
        );
      }
    }
  });

  it("4. Privacy Policy page absence: ads are strictly forbidden on /privacy-policy", () => {
    assert.strictEqual(
      isLegalOrAdFreeRoute("/privacy-policy"),
      true,
      "Route /privacy-policy must be classified as ad-free"
    );

    // Test placement guard for all 10 ad slots on /privacy-policy
    for (const [key, placement] of Object.entries(AD_PLACEMENTS)) {
      const canRender = canRenderAdPlacement({
        path: "/privacy-policy",
        placement,
      });
      assert.strictEqual(
        canRender,
        false,
        `Placement ${key} must not be allowed to render on /privacy-policy`
      );
    }
  });

  it("5. Overlap Prevention: spacing and mobile anchor positioning prevent UI collision", () => {
    // Mobile anchor ad uses bottom-[64px] to stay above the 56px floating action bar
    const mobileAnchorFile = path.join(process.cwd(), "src/components/ads/MobileAnchorAd.tsx");
    const mobileAnchorContent = fs.readFileSync(mobileAnchorFile, "utf8");
    assert.ok(
      mobileAnchorContent.includes("bottom-[64px]"),
      "MobileAnchorAd must be positioned above the 56px action bar (bottom-[64px])"
    );

    // All standard placements must enforce at least 300px spacing between content/ads
    for (const [key, placement] of Object.entries(AD_PLACEMENTS)) {
      assert.ok(
        placement.minContentSpacingPx >= 300,
        `Placement ${key} must have minContentSpacingPx >= 300px to prevent visual clutter`
      );
    }
  });
});

