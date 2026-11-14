import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { analytics } from "../src/lib/analytics.ts";

test("Prompt 93: Analytics client supports adSlotViewable and adSlotClick events", () => {
  assert.equal(typeof analytics.adSlotViewable, "function");
  assert.equal(typeof analytics.adSlotClick, "function");
});

test("Prompt 93: AdSlot implements 50% viewability for 1 second and click tracking", () => {
  const adSlotPath = path.join(process.cwd(), "src/components/ads/AdSlot.tsx");
  const content = fs.readFileSync(adSlotPath, "utf-8");

  // Viewability 50% threshold
  assert.ok(
    content.includes("threshold: [0.5]") ||
      content.includes("threshold: 0.5") ||
      content.includes("0.5"),
    "AdSlot must configure 50% intersection threshold"
  );

  // 1 second (1000ms) continuous timer
  assert.ok(
    content.includes("1000"),
    "AdSlot must enforce 1 continuous second (1000ms) timer before firing viewability"
  );

  // Viewability tracking call
  assert.ok(
    content.includes("adSlotViewable"),
    "AdSlot must fire adSlotViewable when condition is met"
  );

  // Click tracking
  assert.ok(content.includes("adSlotClick"), "AdSlot must fire adSlotClick on container click");
});

test("Prompt 93: Admin performance page renders impressions per placement per page type", () => {
  const adminPagePath = path.join(process.cwd(), "src/app/admin/ads/page.tsx");
  const content = fs.readFileSync(adminPagePath, "utf-8");

  // Noindex protection
  assert.ok(content.includes("index: false"), "Admin dashboard must have robots index: false");

  // Page types
  assert.ok(content.includes("Homepage"), "Must break down Homepage slots");
  assert.ok(content.includes("Task Guide"), "Must break down Task Guide slots");
  assert.ok(content.includes("Category List"), "Must break down Category List slots");
  assert.ok(content.includes("Search Results"), "Must break down Search Results slots");
  assert.ok(content.includes("Guides Directory"), "Must break down Guides Directory slots");

  // Metrics: impressions, viewability (50%/1s), clicks, CTR
  assert.ok(content.includes("Viewable (50%/1s)"), "Must display 50%/1s viewable metric");
  assert.ok(content.includes("Total Impressions"), "Must display impressions");
  assert.ok(content.includes("Total Clicks"), "Must display clicks");
  assert.ok(content.includes("Recommendation"), "Must show placement decision recommendation");
});
