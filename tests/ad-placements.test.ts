import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  AD_PLACEMENTS,
  NO_AD_ROUTES,
  isLegalOrAdFreeRoute,
  canRenderAdPlacement,
  type AdPlacementKey,
} from "../src/components/ads/placements.ts";

test("Prompt 86: Placement map defines all 10 standard slots", () => {
  const expectedKeys: AdPlacementKey[] = [
    "HOME_BELOW_HERO",
    "HOME_MID",
    "TASK_TOP",
    "TASK_SIDEBAR_STICKY",
    "TASK_INLINE_1",
    "TASK_INLINE_2",
    "TASK_BOTTOM",
    "CATEGORY_LIST",
    "SEARCH_RESULTS",
    "GUIDES_LIST",
  ];

  for (const key of expectedKeys) {
    assert.ok(AD_PLACEMENTS[key], `Missing placement: ${key}`);
    assert.ok(AD_PLACEMENTS[key].slotId, `Missing slotId for ${key}`);
    assert.ok(AD_PLACEMENTS[key].format, `Missing format for ${key}`);
    assert.ok(
      AD_PLACEMENTS[key].minContentSpacingPx >= 300,
      `Spacing for ${key} should be at least 300px`
    );
  }
  assert.equal(Object.keys(AD_PLACEMENTS).length, 10);
});

test("Prompt 86: Ad etiquette rejects legal and ad-free pages", () => {
  assert.ok(NO_AD_ROUTES.length >= 7, "NO_AD_ROUTES must contain at least 7 restricted paths");

  const legalRoutes = [
    "/terms",
    "/privacy-policy",
    "/disclaimer",
    "/how-we-verify",
    "/report-mistake",
    "/my-checklists",
    "/health",
  ];

  for (const route of legalRoutes) {
    assert.equal(isLegalOrAdFreeRoute(route), true, `Route ${route} should be ad-free`);
    assert.equal(isLegalOrAdFreeRoute(`${route}?ref=footer`), true);

    const allowed = canRenderAdPlacement({
      path: route,
      placement: AD_PLACEMENTS.HOME_MID,
    });
    assert.equal(allowed, false, `canRenderAdPlacement should return false for ${route}`);
  }

  // Regular task/content pages should allow ads
  assert.equal(isLegalOrAdFreeRoute("/driving-licence-learner"), false);
  assert.equal(isLegalOrAdFreeRoute("/driving-licence-learner/gujarat"), false);
  assert.equal(isLegalOrAdFreeRoute("/guides"), false);
  assert.equal(
    canRenderAdPlacement({
      path: "/driving-licence-learner",
      placement: AD_PLACEMENTS.TASK_TOP,
    }),
    true
  );
});

test("Prompt 86: Desktop-only slots are rejected on mobile", () => {
  assert.equal(AD_PLACEMENTS.TASK_SIDEBAR_STICKY.desktopOnly, true);

  const allowedMobile = canRenderAdPlacement({
    path: "/driving-licence-learner",
    placement: AD_PLACEMENTS.TASK_SIDEBAR_STICKY,
    isMobile: true,
  });
  assert.equal(allowedMobile, false, "TASK_SIDEBAR_STICKY must not render on mobile");

  const allowedDesktop = canRenderAdPlacement({
    path: "/driving-licence-learner",
    placement: AD_PLACEMENTS.TASK_SIDEBAR_STICKY,
    isMobile: false,
  });
  assert.equal(allowedDesktop, true, "TASK_SIDEBAR_STICKY may render on desktop");
});

test("Prompt 86: TASK_TOP is positioned strictly below H1 in TaskPageView", () => {
  const taskPageViewPath = path.join(process.cwd(), "src/components/task/TaskPageView.tsx");
  const content = fs.readFileSync(taskPageViewPath, "utf-8");

  const h1Index = content.indexOf("<h1");
  const taskTopAdIndex = content.indexOf("AD_PLACEMENTS.TASK_TOP");

  assert.ok(h1Index > 0, "H1 must exist in TaskPageView");
  assert.ok(taskTopAdIndex > 0, "TASK_TOP ad must exist in TaskPageView");
  assert.ok(
    taskTopAdIndex > h1Index,
    "TASK_TOP ad placement must appear strictly after the H1 tag"
  );
});

test("Prompt 86: Ads are hidden from print stylesheet", () => {
  const adSlotPath = path.join(process.cwd(), "src/components/ads/AdSlot.tsx");
  const content = fs.readFileSync(adSlotPath, "utf-8");
  assert.ok(content.includes("print:hidden"), "AdSlot must include print:hidden");
});
