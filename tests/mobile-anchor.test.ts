import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { AD_FORMAT_CONFIGS } from "../src/components/ads/formats.ts";

test("Prompt 90: Standard 320x50 anchor format is defined", () => {
  const anchorConfig = AD_FORMAT_CONFIGS.anchor;
  assert.ok(anchorConfig, "Anchor format must be defined in formats.ts");
  assert.equal(anchorConfig.dimensions, "320x50");
  assert.equal(anchorConfig.minHeightPx, 50);
});

test("Prompt 90: MobileAnchorAd source satisfies all prompt requirements", () => {
  const componentPath = path.join(process.cwd(), "src/components/ads/MobileAnchorAd.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  // 1. Off by default
  assert.ok(
    content.includes("NEXT_PUBLIC_MOBILE_ANCHOR_ENABLED"),
    "Mobile anchor must be gated by environment flag"
  );
  assert.ok(
    content.includes('enabled = process.env.NEXT_PUBLIC_MOBILE_ANCHOR_ENABLED === "true"'),
    "Mobile anchor must default to disabled unless explicitly enabled"
  );

  // 2. 50% scroll trigger
  assert.ok(
    content.includes("progress >= 0.5"),
    "Mobile anchor must only trigger visibility after user scrolls past 50% of page"
  );

  // 3. Dismissible and session-persisted
  assert.ok(
    content.includes("sessionStorage.setItem"),
    "Mobile anchor must persist dismissal in sessionStorage"
  );
  assert.ok(
    content.includes("civic_mobile_anchor_dismissed"),
    "Mobile anchor must use session dismissal key"
  );
  assert.ok(
    content.includes('aria-label="Dismiss advertisement"'),
    "Dismiss button must have accessible aria-label"
  );

  // 4. Never overlaps checklist action button
  assert.ok(
    content.includes("bottom-[64px]") || content.includes("bottom-[68px]"),
    "Mobile anchor must float above the sticky checklist action bar (bottom-[64px])"
  );
  assert.ok(
    content.includes("sm:hidden"),
    "Mobile anchor must hide on desktop/tablet viewports (mobile only)"
  );
  assert.ok(content.includes("print:hidden"), "Mobile anchor must hide from print output");
});

test("Prompt 90: TaskPageView integrates MobileAnchorAd", () => {
  const taskPageViewPath = path.join(process.cwd(), "src/components/task/TaskPageView.tsx");
  const content = fs.readFileSync(taskPageViewPath, "utf-8");

  assert.ok(
    content.includes("<MobileAnchorAd"),
    "TaskPageView must integrate MobileAnchorAd component"
  );
});
