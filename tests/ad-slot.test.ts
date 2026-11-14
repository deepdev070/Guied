import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { AD_FORMAT_CONFIGS, type AdFormat } from "../src/components/ads/formats.ts";

describe("Prompt 85: AdSlot Component & Layout Shift Protection", () => {
  it("formats: defines required standard ad formats with exact reserved heights", () => {
    const requiredFormats: AdFormat[] = [
      "leaderboard",
      "mobile-banner",
      "rectangle",
      "large-rectangle",
      "skyscraper",
      "in-article",
      "anchor",
    ];

    for (const format of requiredFormats) {
      const config = AD_FORMAT_CONFIGS[format];
      assert.ok(config, `Format ${format} must exist in AD_FORMAT_CONFIGS`);
      assert.ok(config.minHeightPx > 0, `Format ${format} must have a positive minHeightPx`);
      assert.ok(config.dimensions.length > 0, `Format ${format} must specify dimensions`);
      assert.ok(
        config.className.includes(`min-h-[${config.minHeightPx}px]`) ||
          config.className.includes(`h-[${config.minHeightPx}px]`),
        `Format ${format} className must reserve its height`
      );
    }

    assert.strictEqual(AD_FORMAT_CONFIGS.leaderboard.minHeightPx, 90);
    assert.strictEqual(AD_FORMAT_CONFIGS["mobile-banner"].minHeightPx, 100);
    assert.strictEqual(AD_FORMAT_CONFIGS.rectangle.minHeightPx, 250);
    assert.strictEqual(AD_FORMAT_CONFIGS["large-rectangle"].minHeightPx, 280);
    assert.strictEqual(AD_FORMAT_CONFIGS.skyscraper.minHeightPx, 600);
    assert.strictEqual(AD_FORMAT_CONFIGS["in-article"].minHeightPx, 250);
    assert.strictEqual(AD_FORMAT_CONFIGS.anchor.minHeightPx, 50);
  });

  it("AdSlot source: implements reserved min-height, Advertisement label, and dev placeholder", () => {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ads/AdSlot.tsx"),
      "utf8"
    );

    assert.ok(
      fileContent.includes("Advertisement"),
      "AdSlot must display the required Advertisement header in caps"
    );
    assert.ok(
      fileContent.includes("border-dashed"),
      "AdSlot must use dashed border for layout clarity"
    );
    assert.ok(
      fileContent.includes("bg-surface-alt"),
      "AdSlot must use soft surface-alt background"
    );
    assert.ok(
      fileContent.includes("minHeight: `${formatConfig.minHeightPx}px`"),
      "AdSlot must apply explicit inline minHeight style for 0 CLS"
    );
    assert.ok(
      fileContent.includes('process.env.NEXT_PUBLIC_ADS_ENABLED === "true"') ||
        fileContent.includes("NEXT_PUBLIC_ADS_ENABLED"),
      "AdSlot must be controlled by NEXT_PUBLIC_ADS_ENABLED"
    );
    assert.ok(
      fileContent.includes("analytics.adSlotImpression"),
      "AdSlot must track viewability impressions via analytics client"
    );
    assert.ok(
      fileContent.includes("isDev") && fileContent.includes("Ad space —"),
      "AdSlot must only show the 'Ad space — ' label in development"
    );
  });

  it("LeaderboardAd and SidebarAd delegate cleanly to AdSlot", () => {
    const leaderboardContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ads/LeaderboardAd.tsx"),
      "utf8"
    );
    assert.ok(leaderboardContent.includes("<AdSlot"), "LeaderboardAd must render unified AdSlot");
    assert.ok(
      leaderboardContent.includes('format="leaderboard"'),
      "LeaderboardAd must pass format='leaderboard'"
    );

    const sidebarContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/ads/SidebarAd.tsx"),
      "utf8"
    );
    assert.ok(sidebarContent.includes("<AdSlot"), "SidebarAd must render unified AdSlot");
    assert.ok(
      sidebarContent.includes('format="rectangle"'),
      "SidebarAd must pass format='rectangle'"
    );
  });
});
