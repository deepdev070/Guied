import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runSeoAudit } from "../scripts/seo-audit.ts";

describe("Prompt 84: SEO Audit Script & Technical Validation", () => {
  it("package.json includes seo:audit script", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );
    assert.ok(packageJson.scripts["seo:audit"], "package.json must define seo:audit script");
  });

  it("runSeoAudit: crawls built pages and verifies 100% SEO health", () => {
    const report = runSeoAudit();

    assert.ok(report.totalPagesScanned > 150, "Audit must scan over 150 static pages");
    assert.strictEqual(report.missingTitles.length, 0, "No pages should have missing titles");
    assert.strictEqual(
      report.missingDescriptions.length,
      0,
      "No pages should have missing meta descriptions"
    );
    assert.strictEqual(
      Object.keys(report.duplicateTitles).length,
      0,
      "No indexable pages should share duplicate titles"
    );
    assert.strictEqual(report.h1Issues.length, 0, "Every page must have exactly one H1 element");
    assert.strictEqual(
      report.brokenInternalLinks.length,
      0,
      "There must be 0 broken internal links across the site"
    );
    assert.strictEqual(
      report.imagesWithoutAlt.length,
      0,
      "All image tags must have alt attributes for accessibility and SEO"
    );
    assert.strictEqual(
      report.pagesOver2MB.length,
      0,
      "No HTML page should exceed 2MB in file size"
    );
    assert.strictEqual(
      report.missingCanonicals.length,
      0,
      "All pages must specify a canonical link tag"
    );
    assert.strictEqual(report.passed, true, "SEO audit must pass with 100% success");
  });
});
