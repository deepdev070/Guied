import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 141: Keyword Research Table & Citizen Search Demand", () => {
  const docPath = path.join(rootDir, "docs", "keywords.md");

  it("ensures docs/keywords.md exists", () => {
    assert.ok(fs.existsSync(docPath), "docs/keywords.md must exist");
  });

  it("contains at least 150 search query entries in a markdown table", () => {
    const content = fs.readFileSync(docPath, "utf-8");
    const lines = content.split("\n");

    // Table rows start with | <number> |
    const queryRows = lines.filter((l) => /^\|\s*\d+\s*\|/.test(l));
    assert.ok(queryRows.length >= 150, `Expected at least 150 queries, found ${queryRows.length}`);
  });

  it("covers all 6 mandated citizen search intents", () => {
    const content = fs.readFileSync(docPath, "utf-8");
    const requiredIntents = [
      "documents_required",
      "fees",
      "status",
      "online_apply",
      "rejection",
      "how_long",
    ];

    for (const intent of requiredIntents) {
      assert.ok(content.includes(intent), `Missing search intent: ${intent}`);
    }
  });

  it("marks already published guides correctly", () => {
    const content = fs.readFileSync(docPath, "utf-8");
    assert.ok(
      content.includes("driving-licence-learner"),
      "Missing learner licence published target"
    );
    assert.ok(content.includes("driving-licence-new"), "Missing permanent dl published target");
    assert.ok(content.includes("passport-renewal"), "Missing passport renewal published target");
    assert.ok(content.includes("**Published**"), "Must mark published status");
  });

  it("identifies the Next 20 to Write guides for Phase 14", () => {
    const content = fs.readFileSync(docPath, "utf-8");
    for (let i = 1; i <= 20; i++) {
      assert.ok(
        content.includes(`Next 20 to Write (${i})`),
        `Missing Next 20 to Write index (${i})`
      );
    }
  });

  it("includes clear disclaimer about validating estimates with Google Keyword Planner / Search Console", () => {
    const content = fs.readFileSync(docPath, "utf-8");
    assert.ok(
      content.includes("Google Keyword Planner") || content.includes("Search Console"),
      "Must include warning to validate estimates with Keyword Planner or Search Console"
    );
  });
});
