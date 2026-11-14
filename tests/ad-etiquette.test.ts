import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isLegalOrAdFreeRoute } from "../src/components/ads/placements.ts";

/**
 * Prompt 87: Ad etiquette and clarity verification
 * Ensures ads never look like content or buttons, have at least 24px spacing,
 * never appear inside checklists, and strictly adhere to per-page slot budgets.
 */

test("Prompt 87: AdSlot styling distinguishes ads from content and buttons", () => {
  const adSlotPath = path.join(process.cwd(), "src/components/ads/AdSlot.tsx");
  const content = fs.readFileSync(adSlotPath, "utf-8");

  // 1. Must have explicit "Advertisement" label
  assert.ok(
    content.includes("Advertisement"),
    "AdSlot must display a clear 'Advertisement' text label"
  );
  assert.ok(
    content.includes("aria-label"),
    "AdSlot must include an accessible aria-label identifying it as an advertisement"
  );

  // 2. Must have dashed border and soft surface styling (cannot look like solid card or button)
  assert.ok(
    content.includes("border-dashed"),
    "AdSlot must have a dashed border so it never looks like regular content or official boxes"
  );
  assert.ok(
    content.includes("bg-surface-alt"),
    "AdSlot must use surface-alt background to differentiate from pure white content cards"
  );

  // 3. Spacing of at least 24px around (my-6 in Tailwind = 1.5rem = 24px)
  assert.ok(
    content.includes("my-6"),
    "AdSlot must have at least 24px (my-6) spacing around to prevent crowding"
  );
});

test("Prompt 87: Checklist purity - zero ads inside DocumentSection or ChecklistItem", () => {
  const docSectionPath = path.join(process.cwd(), "src/components/task/DocumentSection.tsx");
  const checklistItemPath = path.join(process.cwd(), "src/components/ui/ChecklistItem.tsx");

  const docSectionContent = fs.readFileSync(docSectionPath, "utf-8");
  const checklistItemContent = fs.readFileSync(checklistItemPath, "utf-8");

  // Checklist items must never embed ad slots or ad containers
  assert.equal(
    docSectionContent.includes("<AdSlot") || docSectionContent.includes("<SidebarAd"),
    false,
    "DocumentSection must never embed an AdSlot directly within the checklist"
  );
  assert.equal(
    checklistItemContent.includes("<AdSlot") || checklistItemContent.includes("<SidebarAd"),
    false,
    "ChecklistItem must never embed an AdSlot"
  );
});

test("Prompt 87: Lint-like test - Each page type respects allowed slot density", () => {
  // Page definitions and their maximum allowed ad slots
  const pageSpecs = [
    {
      file: "src/app/page.tsx",
      name: "Homepage",
      maxSlots: 2,
      expectedSlots: ["HOME_BELOW_HERO", "HOME_MID"],
    },
    {
      file: "src/components/task/TaskPageView.tsx",
      name: "Task Guide Main Content",
      maxSlots: 4,
      expectedSlots: ["TASK_TOP", "TASK_INLINE_1", "TASK_INLINE_2", "TASK_BOTTOM"],
    },
    {
      file: "src/components/task/TaskSidebar.tsx",
      name: "Task Sidebar (Desktop Only)",
      maxSlots: 1,
      expectedSlots: ["TASK_SIDEBAR_STICKY"],
    },
    {
      file: "src/components/category/CategoryPageView.tsx",
      name: "Category Page",
      maxSlots: 1,
      expectedSlots: ["CATEGORY_LIST"],
    },
    {
      file: "src/app/search/page.tsx",
      name: "Search Page",
      maxSlots: 1,
      expectedSlots: ["SEARCH_RESULTS"],
    },
    {
      file: "src/app/guides/page.tsx",
      name: "Guides Directory",
      maxSlots: 2,
      expectedSlots: ["GUIDES_LIST"],
    },
  ];

  for (const page of pageSpecs) {
    const filePath = path.join(process.cwd(), page.file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Count occurrences of <AdSlot, <LeaderboardAd, and <SidebarAd
    const adMatches = content.match(/<(?:AdSlot|LeaderboardAd|SidebarAd)\b/g) || [];
    const count = adMatches.length;

    assert.ok(
      count <= page.maxSlots,
      `${page.name} (${page.file}) has ${count} slots, exceeding maximum allowed of ${page.maxSlots}`
    );

    // Verify expected slot keys are referenced
    for (const slotKey of page.expectedSlots) {
      assert.ok(
        content.includes(slotKey),
        `${page.name} should reference placement key ${slotKey}`
      );
    }
  }
});

test("Prompt 87: Legal and ad-free pages contain zero ad slots", () => {
  const legalFiles = [
    "src/app/terms/page.tsx",
    "src/app/privacy-policy/page.tsx",
    "src/app/disclaimer/page.tsx",
    "src/app/how-we-verify/page.tsx",
    "src/app/report-mistake/page.tsx",
    "src/app/my-checklists/page.tsx",
  ];

  for (const relPath of legalFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, "utf-8");

    const adMatches = content.match(/<(?:AdSlot|LeaderboardAd|SidebarAd)\b/g) || [];
    assert.equal(
      adMatches.length,
      0,
      `Legal/ad-free page ${relPath} must contain 0 ad slots, but found ${adMatches.length}`
    );

    // Verify route is registered in isLegalOrAdFreeRoute
    const route = "/" + relPath.replace("src/app/", "").replace("/page.tsx", "");
    assert.equal(isLegalOrAdFreeRoute(route), true, `Route ${route} must be recognized as ad-free`);
  }
});
