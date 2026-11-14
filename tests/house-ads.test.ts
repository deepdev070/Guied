import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { HOUSE_ADS_CONFIG, getHouseAdForFormat } from "../src/components/ads/house-ads.ts";

test("Prompt 91: House ads configuration includes required civic utility and partner cards", () => {
  assert.ok(HOUSE_ADS_CONFIG.length >= 3, "Must define at least 3 house ad options");

  // Notary / CA card
  const notaryCard = HOUSE_ADS_CONFIG.find((c) => c.id === "notary-ca-help");
  assert.ok(notaryCard, "Must include notary/CA help card");
  assert.ok(notaryCard.description.includes("notar"));

  // Offline checklist app card
  const appCard = HOUSE_ADS_CONFIG.find((c) => c.id === "offline-checklist-app");
  assert.ok(appCard, "Must include offline checklist app card");
  assert.ok(appCard.title.includes("Checklist"));

  // Partner sponsored card
  const partnerCard = HOUSE_ADS_CONFIG.find((c) => c.type === "partner");
  assert.ok(partnerCard, "Must include at least one partner card");
  assert.ok(partnerCard.badgeText?.includes("Sponsored"));
});

test("Prompt 91: getHouseAdForFormat returns appropriate cards for standard ad dimensions", () => {
  const leaderboardAd = getHouseAdForFormat("leaderboard");
  assert.ok(leaderboardAd, "Must return card for leaderboard");

  const rectangleAd = getHouseAdForFormat("rectangle");
  assert.ok(rectangleAd, "Must return card for rectangle");

  const anchorAd = getHouseAdForFormat("anchor");
  assert.ok(anchorAd, "Must return card for anchor");
});

test("Prompt 91: HouseAd component source enforces 'Sponsored' label for partner cards", () => {
  const componentPath = path.join(process.cwd(), "src/components/ads/HouseAd.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  assert.ok(
    content.includes("Sponsored"),
    "HouseAd component must render a clear 'Sponsored' label on partner cards"
  );
  assert.ok(
    content.includes("Civic Resource"),
    "HouseAd component must render badge for in-house cards"
  );
});

test("Prompt 91: AdSlot integrates HouseAd as graceful fallback when ads are disabled", () => {
  const adSlotPath = path.join(process.cwd(), "src/components/ads/AdSlot.tsx");
  const content = fs.readFileSync(adSlotPath, "utf-8");

  assert.ok(
    content.includes("<HouseAd"),
    "AdSlot must render HouseAd when ads are disabled or unfilled"
  );
});
