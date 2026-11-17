import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getWeeklyRoutineData } from "../scripts/weekly-routine.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 140: Weekly Operating Routine & Automation Scripts", () => {
  describe("1. Routine Documentation (docs/weekly-routine.md)", () => {
    const docPath = path.join(rootDir, "docs", "weekly-routine.md");

    it("ensures docs/weekly-routine.md exists", () => {
      assert.ok(fs.existsSync(docPath), "docs/weekly-routine.md must exist");
    });

    it("details the 60-minute timeline across all 6 core operating steps", () => {
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.includes("60-Minute"), "Must detail 60-minute duration");
      assert.ok(content.includes("Search Console"), "Must cover Search Console queries (Step 1)");
      assert.ok(content.includes("3 New Guides"), "Must cover adding 3 new guides (Step 2)");
      assert.ok(
        content.includes("5 Oldest Guides") || content.includes("Re-Verify"),
        "Must cover re-verifying 5 guides (Step 3)"
      );
      assert.ok(content.includes("Error Reports"), "Must cover error reports (Step 4)");
      assert.ok(content.includes("Ad Placement"), "Must cover ad placement performance (Step 5)");
      assert.ok(
        content.includes("2 Shareable Checklist"),
        "Must cover posting 2 shareable checklists (Step 6)"
      );
    });
  });

  describe("2. Automation Data Script (scripts/weekly-routine.ts)", () => {
    it("returns complete structured data for all routine steps", () => {
      const data = getWeeklyRoutineData();

      // Step 1: Demand candidates
      assert.ok(Array.isArray(data.demandCandidates), "demandCandidates must be an array");
      assert.ok(data.demandCandidates.length > 0, "Must provide demand candidates");
      assert.ok(typeof data.demandCandidates[0]?.impressions === "number");

      // Step 2: Next 3 guides
      assert.strictEqual(
        data.next3GuidesToCreate.length,
        3,
        "Must recommend exactly 3 guides to create"
      );
      assert.ok(
        data.next3GuidesToCreate[0]?.officialSource,
        "Must cite official portal to start from"
      );

      // Step 3: Stale guides to re-verify
      assert.ok(
        Array.isArray(data.staleGuidesToReverify),
        "staleGuidesToReverify must be an array"
      );
      assert.ok(data.staleGuidesToReverify.length <= 5, "Must return at most 5 stale guides");
      for (const item of data.staleGuidesToReverify) {
        assert.ok(typeof item.daysElapsed === "number", "daysElapsed must be a number");
        assert.ok(item.portalUrl.startsWith("http"), "Must link to official portal");
      }

      // Step 4: Error reports
      assert.ok(typeof data.errorReportsSummary.openCount === "number");

      // Step 5: Ad placement health
      assert.strictEqual(data.adPlacementHealth.status, "HEALTHY");
      assert.strictEqual(data.adPlacementHealth.policyViolations, 0);

      // Step 6: Shareable checklists
      assert.strictEqual(
        data.shareableChecklists.length,
        2,
        "Must generate exactly 2 shareable checklists"
      );
      assert.ok(data.shareableChecklists[0]?.whatsappText.includes("https://indiapaperwork.in/"));
      assert.ok((data.shareableChecklists[0]?.topDocs.length ?? 0) > 0);
    });
  });

  describe("3. NPM Scripts Configuration", () => {
    it("package.json registers the weekly routine CLI command", () => {
      const pkgPath = path.join(rootDir, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      assert.ok(pkg.scripts?.weekly, "package.json must define 'weekly' script");
      assert.ok(pkg.scripts.weekly.includes("scripts/weekly-routine.ts"));
    });
  });
});
