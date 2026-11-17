import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 133: Lighthouse CI Performance & Accessibility Budgets", () => {
  const rootDir = process.cwd();
  const lhciConfigPath = path.join(rootDir, "lighthouserc.json");
  const packageJsonPath = path.join(rootDir, "package.json");

  test("1. lighthouserc.json exists and defines required URLs (Home, Task, State)", () => {
    assert.ok(fs.existsSync(lhciConfigPath), "lighthouserc.json must exist in repo root");
    const config = JSON.parse(fs.readFileSync(lhciConfigPath, "utf-8"));

    const urls: string[] = config.ci.collect.url;
    assert.ok(Array.isArray(urls), "ci.collect.url must be an array of URLs");

    // Home URL
    assert.ok(
      urls.some((u) => u.endsWith("/") || u.includes("localhost:3000/")),
      "Lighthouse CI must audit Home page"
    );

    // Task guide URL
    assert.ok(
      urls.some((u) => u.includes("driving-licence") || u.includes("passport")),
      "Lighthouse CI must audit a Task page"
    );

    // State page URL
    assert.ok(
      urls.some((u) => u.includes("/state/gujarat")),
      "Lighthouse CI must audit a State page"
    );
  });

  test("2. lighthouserc.json enforces Mobile formFactor and screen emulation", () => {
    const config = JSON.parse(fs.readFileSync(lhciConfigPath, "utf-8"));
    const settings = config.ci.collect.settings;

    assert.equal(settings.formFactor, "mobile");
    assert.equal(settings.screenEmulation.mobile, true);
    assert.equal(settings.screenEmulation.width, 360);
  });

  test("3. lighthouserc.json enforces strict budgets and fails the build when missed (error level)", () => {
    const config = JSON.parse(fs.readFileSync(lhciConfigPath, "utf-8"));
    const assertions = config.ci.assert.assertions;

    // Performance >= 90 (0.90)
    assert.ok(assertions["categories:performance"]);
    assert.equal(assertions["categories:performance"][0], "error");
    assert.ok(assertions["categories:performance"][1].minScore >= 0.9);

    // Accessibility >= 95 (0.95)
    assert.ok(assertions["categories:accessibility"]);
    assert.equal(assertions["categories:accessibility"][0], "error");
    assert.ok(assertions["categories:accessibility"][1].minScore >= 0.95);

    // SEO >= 95 (0.95)
    assert.ok(assertions["categories:seo"]);
    assert.equal(assertions["categories:seo"][0], "error");
    assert.ok(assertions["categories:seo"][1].minScore >= 0.95);

    // Best Practices >= 95 (0.95)
    assert.ok(assertions["categories:best-practices"]);
    assert.equal(assertions["categories:best-practices"][0], "error");
    assert.ok(assertions["categories:best-practices"][1].minScore >= 0.95);
  });

  test("4. package.json exposes lhci execution script and output directory is configured", () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    assert.ok(pkg.scripts.lhci, "package.json must contain lhci script");
    assert.match(pkg.scripts.lhci, /lhci/);

    const config = JSON.parse(fs.readFileSync(lhciConfigPath, "utf-8"));
    assert.equal(config.ci.upload.target, "filesystem");
    assert.ok(config.ci.upload.outputDir);
  });
});
