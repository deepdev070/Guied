import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getNearbyStates } from "../src/data/nearby-states.ts";
import { auditInternalLinkGraph } from "../src/lib/internal-links.ts";

describe("Prompt 79: Internal Linking Architecture & Orphan Detection", () => {
  describe("Geographic Proximity & Neighboring States Engine", () => {
    it("returns correct geographic neighbor states for Gujarat", () => {
      const gujaratNeighbors = getNearbyStates("gujarat");
      assert.ok(gujaratNeighbors.length >= 3, "Gujarat must have at least 3 neighboring states");

      const neighborCodes = gujaratNeighbors.map((s) => s.code);
      assert.ok(neighborCodes.includes("RJ"), "Rajasthan borders Gujarat");
      assert.ok(neighborCodes.includes("MP"), "Madhya Pradesh borders Gujarat");
      assert.ok(neighborCodes.includes("MH"), "Maharashtra borders Gujarat");
    });

    it("returns correct geographic neighbor states for Maharashtra", () => {
      const mhNeighbors = getNearbyStates("maharashtra");
      const neighborCodes = mhNeighbors.map((s) => s.code);

      assert.ok(neighborCodes.includes("GJ"), "Gujarat borders Maharashtra");
      assert.ok(neighborCodes.includes("GA"), "Goa borders Maharashtra");
      assert.ok(neighborCodes.includes("KA"), "Karnataka borders Maharashtra");
    });

    it("returns fallback popular states for national view or empty state", () => {
      const nationalNeighbors = getNearbyStates();
      assert.equal(nationalNeighbors.length, 5);
      const codes = nationalNeighbors.map((s) => s.code);
      assert.ok(codes.includes("GJ"));
      assert.ok(codes.includes("MH"));
    });
  });

  describe("Internal Link Graph & Orphan Page Detection", () => {
    it("confirms 0 orphan pages across all 170+ published routes", () => {
      const report = auditInternalLinkGraph();

      assert.ok(report.totalPages > 150, "Graph must audit all published pages");
      assert.ok(report.totalInternalLinks > 2000, "Graph must contain comprehensive link mesh");
      assert.ok(
        report.averageInboundLinks >= 10,
        `Average inbound links should be high (>=10), got ${report.averageInboundLinks}`
      );
      assert.equal(
        report.orphanPages.length,
        0,
        `Detected orphan pages with 0 inbound links: ${report.orphanPages.join(", ")}`
      );
    });

    it("verifies every task and state page has multiple inbound links", () => {
      const report = auditInternalLinkGraph();
      const counts = report.inboundLinkCounts;

      // Check key routes have healthy link equity
      assert.ok(
        (counts["/passport-renewal"] || 0) > 5,
        "National passport guide has inbound links"
      );
      assert.ok(
        (counts["/passport-renewal/gujarat"] || 0) > 3,
        "Gujarat passport guide has inbound links"
      );
      assert.ok((counts["/category/vehicles"] || 0) > 3, "Category vehicles has inbound links");
      assert.ok((counts["/state/gujarat"] || 0) > 3, "State Gujarat hub has inbound links");
      assert.ok(
        (counts["/glossary/affidavit"] || 0) >= 1,
        "Glossary term has inbound link from hub"
      );
      assert.ok(
        (counts["/glossary/annexure"] || 0) > 1,
        "Annexure has multiple inbound links from hub and passport guide"
      );
    });
  });

  describe("Component Integration Verification", () => {
    it("verifies NearbyStatesSection source implementation", () => {
      const filePath = path.join(process.cwd(), "src/components/task/NearbyStatesSection.tsx");
      assert.ok(fs.existsSync(filePath), "NearbyStatesSection component must exist");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(content.includes("getNearbyStates"));
      assert.ok(content.includes("taskSlug"));
      assert.ok(content.includes("state.slug"));
    });

    it("verifies PopularInStateBlock source implementation", () => {
      const filePath = path.join(process.cwd(), "src/components/task/PopularInStateBlock.tsx");
      assert.ok(fs.existsSync(filePath), "PopularInStateBlock component must exist");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(content.includes("Popular in"));
      assert.ok(content.includes("/state/"));
    });

    it("verifies TaskPageView integrates category link, nearby states, and popular in state block", () => {
      const filePath = path.join(process.cwd(), "src/components/task/TaskPageView.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(
        content.includes("<NearbyStatesSection"),
        "TaskPageView must render NearbyStatesSection"
      );
      assert.ok(
        content.includes("<PopularInStateBlock"),
        "TaskPageView must render PopularInStateBlock"
      );
      assert.ok(content.includes("/category/"), "TaskPageView must link to category");
      assert.ok(content.includes("<RelatedTasks"), "TaskPageView must render RelatedTasks");
      assert.ok(content.includes("<TaskJourney"), "TaskPageView must render TaskJourney");
    });

    it("verifies package.json has seo:orphans npm script", () => {
      const pkgPath = path.join(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      assert.ok(pkg.scripts["seo:orphans"], "package.json must define 'seo:orphans' script");
      assert.ok(pkg.scripts["seo:orphans"].includes("detect-orphan-pages.ts"));
    });
  });
});
