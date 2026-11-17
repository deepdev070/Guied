import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 130: Mobile Build and Release Setup (EAS & App Store Runbook)", () => {
  const rootDir = process.cwd();
  const easJsonPath = path.join(rootDir, "apps", "mobile", "eas.json");
  const releaseDocPath = path.join(rootDir, "docs", "release-mobile.md");

  test("1. eas.json defines development, preview, and production profiles for EAS Build", () => {
    assert.ok(fs.existsSync(easJsonPath), "eas.json must exist in apps/mobile");
    const eas = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));

    // Build profiles
    assert.ok(eas.build.development, "development profile must be defined");
    assert.equal(eas.build.development.developmentClient, true);
    assert.equal(eas.build.development.distribution, "internal");

    assert.ok(eas.build.preview, "preview profile must be defined");
    assert.equal(eas.build.preview.distribution, "internal");
    assert.equal(eas.build.preview.android.buildType, "apk");

    assert.ok(eas.build.production, "production profile must be defined");
    assert.equal(eas.build.production.autoIncrement, true);
    assert.equal(eas.build.production.android.buildType, "app-bundle");
  });

  test("2. eas.json defines automated store submit profiles for Google Play and Apple App Store", () => {
    const eas = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));

    assert.ok(eas.submit.production, "submit.production must be configured");
    assert.ok(eas.submit.production.android, "Android submit profile required");
    assert.ok(eas.submit.production.android.serviceAccountKeyPath);
    assert.ok(eas.submit.production.ios, "iOS submit profile required");
    assert.ok(eas.submit.production.ios.appleId);
    assert.ok(eas.submit.production.ios.ascAppId);
  });

  test("3. docs/release-mobile.md covers Google Play and Apple developer account setup", () => {
    assert.ok(fs.existsSync(releaseDocPath), "docs/release-mobile.md must exist");
    const content = fs.readFileSync(releaseDocPath, "utf-8");

    // Google Play
    assert.match(content, /Google Play Developer Account/i);
    assert.match(content, /\$25/);
    assert.match(content, /D-U-N-S/i);
    assert.match(content, /Service Account/i);

    // Apple Developer
    assert.match(content, /Apple Developer Account/i);
    assert.match(content, /\$99/);
    assert.match(content, /App Store Connect/i);
  });

  test("4. docs/release-mobile.md details app signing and AssetLinks SHA-256 fingerprint", () => {
    const content = fs.readFileSync(releaseDocPath, "utf-8");

    assert.match(content, /App Signing/i);
    assert.match(content, /SHA-256 Fingerprint/i);
    assert.match(content, /assetlinks\.json/);
    assert.match(content, /eas credentials/);
  });

  test("5. docs/release-mobile.md provides store listing text, short description, and keywords", () => {
    const content = fs.readFileSync(releaseDocPath, "utf-8");

    assert.match(content, /Store Listing Text/i);
    assert.match(content, /Short Description/i);
    assert.match(content, /Full Description/i);
    assert.match(content, /Class 8 Plain Language/i);
    assert.match(content, /STATUTORY DISCLAIMER/i);
    assert.match(content, /Search Keywords/i);
    assert.match(content, /sarathi parivahan/i);
  });

  test("6. docs/release-mobile.md defines screenshots checklist for all required phone and tablet display sizes", () => {
    const content = fs.readFileSync(releaseDocPath, "utf-8");

    assert.match(content, /Screenshots Checklist/i);
    assert.match(content, /1080 x 2400/);
    assert.match(content, /1200 x 1920/);
    assert.match(content, /2048 x 1536/);
    assert.match(content, /1290 x 2796/);
    assert.match(content, /1242 x 2688/);
    assert.match(content, /2048 x 2732/);
    assert.match(content, /100% strict light mode/i);
  });

  test("7. docs/release-mobile.md details privacy policy URL and data-safety form answers", () => {
    const content = fs.readFileSync(releaseDocPath, "utf-8");

    assert.match(content, /https:\/\/indiapaperwork\.in\/privacy-policy/);
    assert.match(content, /Data Safety Questionnaire Answers/i);
    assert.match(content, /Data Not Collected/i);
    assert.match(content, /Encrypted in transit/i);
    assert.match(content, /Clear All Data/i);
  });

  test("8. docs/release-mobile.md defines IARC content rating and phased testing tracks", () => {
    const content = fs.readFileSync(releaseDocPath, "utf-8");

    // Content Rating
    assert.match(content, /Content Rating/i);
    assert.match(content, /IARC/);
    assert.match(content, /PEGI 3/);
    assert.match(content, /Everyone \(E\)/);

    // Testing Tracks
    assert.match(content, /Internal Testing/i);
    assert.match(content, /Closed Testing/i);
    assert.match(content, /20-Tester Policy/i);
    assert.match(content, /TestFlight/i);
    assert.match(content, /Phased Rollout/i);
  });
});
