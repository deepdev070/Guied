import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 132: Playwright End-to-End Suite Coverage & Viewports", () => {
  const rootDir = process.cwd();
  const playwrightConfigPath = path.join(rootDir, "playwright.config.ts");
  const e2eSpecPath = path.join(rootDir, "e2e", "civic-journeys.spec.ts");

  test("1. playwright.config.ts configures Mobile (360px), Tablet (768px), and Desktop (1280px) viewports", () => {
    assert.ok(fs.existsSync(playwrightConfigPath), "playwright.config.ts must exist");
    const content = fs.readFileSync(playwrightConfigPath, "utf-8");

    // 360px Mobile viewport
    assert.match(content, /Mobile-360px/i);
    assert.match(content, /width:\s*360/);

    // 768px Tablet viewport
    assert.match(content, /Tablet-768px/i);
    assert.match(content, /width:\s*768/);

    // 1280px Desktop viewport
    assert.match(content, /Desktop-1280px/i);
    assert.match(content, /width:\s*1280/);

    // WebServer configuration
    assert.match(content, /webServer/);
    assert.match(content, /port:\s*3000/);
  });

  test("2. e2e/civic-journeys.spec.ts implements all 9 mandated citizen journeys", () => {
    assert.ok(fs.existsSync(e2eSpecPath), "civic-journeys.spec.ts must exist");
    const content = fs.readFileSync(e2eSpecPath, "utf-8");

    // Journey 1: Home search to guide
    assert.match(content, /Journey 1: Search on home navigates to correct guide/);
    assert.match(content, /page\.goto\("\/"\)/);
    assert.match(content, /fill\("Passport"\)/);

    // Journey 2: State selection persistence
    assert.match(content, /Journey 2: State selection persists/);
    assert.match(content, /\/driving-licence-learner\/gujarat/);
    assert.match(content, /page\.reload\(\)/);

    // Journey 3: Checklist tick and persistence
    assert.match(content, /Journey 3: Checking document items saves progress locally/);
    assert.match(content, /toBeChecked\(\)/);

    // Journey 4: Wizard personalisation
    assert.match(content, /Journey 4: Wizard questions dynamically filter required paperwork/);
    assert.match(content, /\/passport-renewal/);

    // Journey 5: PDF download
    assert.match(content, /Journey 5: PDF download generates verified citizen printable document/);
    assert.match(content, /\/api\/pdf\/driving-licence-learner/);
    assert.match(content, /pdf/i);

    // Journey 6: Report a mistake
    assert.match(content, /Journey 6: Report a mistake modal submits civic correction/);
    assert.match(content, /\/api\/report-mistake/);

    // Journey 7: Language switch
    assert.match(content, /Journey 7: Language switch toggles Hindi and Gujarati routes/);
    assert.match(content, /\/gu\/driving-licence-learner/);
    assert.match(content, /\/hi\/driving-licence-learner/);

    // Journey 8: Offline mode
    assert.match(content, /Journey 8: Dedicated offline page renders with emergency checklist/);
    assert.match(content, /\/offline/);

    // Journey 9: Admin login and publish
    assert.match(content, /Journey 9: Admin dashboard guards unauthenticated access/);
    assert.match(content, /\/admin/);
  });
});
