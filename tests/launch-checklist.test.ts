import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 139: Launch Checklist & Readiness Audit", () => {
  const checklistPath = path.join(rootDir, "docs", "launch-checklist.md");

  describe("1. Checklist Document Integrity (docs/launch-checklist.md)", () => {
    it("ensures docs/launch-checklist.md exists", () => {
      assert.ok(fs.existsSync(checklistPath), "docs/launch-checklist.md must exist");
    });

    it("covers all 10 mandated launch criteria", () => {
      const content = fs.readFileSync(checklistPath, "utf-8");
      const criteria = [
        "30 Published Guides",
        "Legal Pages Reviewed",
        "Analytics & Consent",
        "Sitemap & Robots",
        "404s & Broken Links",
        "Mobile Test on 3 Real Devices",
        "Ad Slots Verified",
        "Performance Budgets",
        "Backups Tested",
        "Search Console Verified",
      ];

      for (const item of criteria) {
        assert.ok(
          content.toLowerCase().includes(item.toLowerCase()),
          `Missing launch criterion in checklist: ${item}`
        );
      }
    });

    it("clearly identifies what is still missing for production day 1", () => {
      const content = fs.readFileSync(checklistPath, "utf-8");
      assert.ok(
        content.includes("What is Still Missing"),
        "Must specify missing items column or section"
      );
      assert.ok(
        content.includes("Phase 14") || content.includes("Content Factory"),
        "Must reference Phase 14 guide expansion for 30 guides"
      );
    });
  });

  describe("2. Repository Current State Verification", () => {
    it("verifies all 4 legal pages exist and are reachable", () => {
      const legalPages = [
        path.join(rootDir, "src", "app", "disclaimer", "page.tsx"),
        path.join(rootDir, "src", "app", "privacy-policy", "page.tsx"),
        path.join(rootDir, "src", "app", "terms", "page.tsx"),
        path.join(rootDir, "src", "app", "how-we-verify", "page.tsx"),
      ];

      for (const page of legalPages) {
        assert.ok(fs.existsSync(page), `Legal page missing: ${path.relative(rootDir, page)}`);
      }
    });

    it("verifies consent banner and analytics components exist", () => {
      const consentBanner = path.join(rootDir, "src", "components", "consent", "ConsentBanner.tsx");
      const analyticsScript = path.join(
        rootDir,
        "src",
        "components",
        "analytics",
        "AnalyticsScript.tsx"
      );
      assert.ok(fs.existsSync(consentBanner), "ConsentBanner must exist");
      assert.ok(fs.existsSync(analyticsScript), "AnalyticsScript must exist");
    });

    it("verifies sitemap and robots route handlers exist", () => {
      assert.ok(
        fs.existsSync(path.join(rootDir, "src", "app", "sitemap.ts")),
        "sitemap.ts must exist"
      );
      assert.ok(
        fs.existsSync(path.join(rootDir, "src", "app", "robots.ts")),
        "robots.ts must exist"
      );
    });

    it("verifies custom 404 page and missing page tracking route exist", () => {
      assert.ok(
        fs.existsSync(path.join(rootDir, "src", "app", "not-found.tsx")),
        "not-found.tsx must exist"
      );
      assert.ok(
        fs.existsSync(path.join(rootDir, "src", "app", "api", "log-missing-page", "route.ts")),
        "log-missing-page API route must exist"
      );
    });

    it("verifies ad components and lighthouserc configuration exist", () => {
      assert.ok(
        fs.existsSync(path.join(rootDir, "src", "components", "ads", "AdSlot.tsx")),
        "AdSlot must exist"
      );
      assert.ok(
        fs.existsSync(path.join(rootDir, "lighthouserc.json")),
        "lighthouserc.json must exist"
      );
    });

    it("verifies backup and restore scripts exist", () => {
      assert.ok(
        fs.existsSync(path.join(rootDir, "scripts", "backup-db.ts")),
        "backup-db.ts must exist"
      );
      assert.ok(
        fs.existsSync(path.join(rootDir, "scripts", "restore-db.ts")),
        "restore-db.ts must exist"
      );
      assert.ok(
        fs.existsSync(path.join(rootDir, "scripts", "backup-content-json.ts")),
        "backup-content-json.ts must exist"
      );
    });
  });
});
