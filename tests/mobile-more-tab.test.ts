import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 129: More Tab Settings, Language, and Civic Information", () => {
  const rootDir = process.cwd();
  const settingsModulePath = path.join(rootDir, "apps", "mobile", "lib", "mobile-settings.ts");
  const moreScreenPath = path.join(rootDir, "apps", "mobile", "app", "(tabs)", "more.tsx");

  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: () => null,
      length: 0,
    };
  });

  test("1. mobile-settings.ts defines default preferences and available options", async () => {
    assert.ok(fs.existsSync(settingsModulePath), "mobile-settings.ts must exist");
    const {
      DEFAULT_SETTINGS,
      LANGUAGE_OPTIONS,
      TEXT_SIZE_OPTIONS,
      APP_VERSION_INFO,
      getMobileUserSettings,
      saveMobileUserSettings,
      clearAllLocalUserData,
    } = await import(settingsModulePath);

    // Default configuration
    assert.equal(DEFAULT_SETTINGS.language, "en");
    assert.equal(DEFAULT_SETTINGS.textSize, "100");
    assert.equal(DEFAULT_SETTINGS.defaultState, "gujarat");
    assert.equal(DEFAULT_SETTINGS.liteMode, false);

    // Three languages (en, hi, gu) with native scripts
    assert.equal(LANGUAGE_OPTIONS.length, 3);
    const codes = LANGUAGE_OPTIONS.map((l: { code: string }) => l.code);
    assert.deepEqual(codes, ["en", "hi", "gu"]);
    assert.ok(LANGUAGE_OPTIONS.find((l: { nativeLabel: string }) => l.nativeLabel === "हिन्दी"));
    assert.ok(LANGUAGE_OPTIONS.find((l: { nativeLabel: string }) => l.nativeLabel === "ગુજરાતી"));

    // Text size scales
    assert.equal(TEXT_SIZE_OPTIONS.length, 3);
    assert.deepEqual(
      TEXT_SIZE_OPTIONS.map((t: { scale: string }) => t.scale),
      ["100", "115", "130"]
    );

    // Version info
    assert.equal(APP_VERSION_INFO.version, "0.1.0");
    assert.match(APP_VERSION_INFO.edition, /Gujarat/i);

    // Persistence test
    saveMobileUserSettings({ language: "gu", textSize: "115", liteMode: true });
    const loaded = getMobileUserSettings();
    assert.equal(loaded.language, "gu");
    assert.equal(loaded.textSize, "115");
    assert.equal(loaded.liteMode, true);

    // Clear data test
    clearAllLocalUserData();
    assert.equal(getMobileUserSettings().language, "en");
  });

  test("2. more.tsx implements all mandated settings rows with clear labels and touch targets", () => {
    assert.ok(fs.existsSync(moreScreenPath), "more.tsx must exist");
    const content = fs.readFileSync(moreScreenPath, "utf-8");

    // All mandated features from Prompt 129
    assert.match(content, /Language\s*\(ભાષા \/ भाषा\)/i);
    assert.match(content, /Text Size/i);
    assert.match(content, /Default State Portal/i);
    assert.match(content, /Lite Mode \(Data Saver\)/i);
    assert.match(content, /Privacy Choices/i);
    assert.match(content, /Report a Mistake/i);
    assert.match(content, /Rate the App/i);
    assert.match(content, /About India Paperwork Guide/i);
    assert.match(content, /Official Disclaimer/i);
    assert.match(content, /APP_VERSION_INFO/);

    // Touch targets and layout
    assert.match(content, /minHeight:\s*layout\.minTouchTarget/);
  });

  test("3. more.tsx provides modals for language, text size, privacy choices, and report mistake", () => {
    const content = fs.readFileSync(moreScreenPath, "utf-8");

    // Modal declarations
    assert.match(content, /activeModal === "language"/);
    assert.match(content, /activeModal === "textSize"/);
    assert.match(content, /activeModal === "state"/);
    assert.match(content, /activeModal === "privacy"/);
    assert.match(content, /activeModal === "about"/);
    assert.match(content, /activeModal === "disclaimer"/);
    assert.match(content, /activeModal === "reportMistake"/);

    // Report mistake inputs
    assert.match(content, /WHICH GUIDE\?/);
    assert.match(content, /WHAT IS WRONG OR CHANGED\?/);
    assert.match(content, /Submit Report/);

    // Privacy choices
    assert.match(content, /Clear All Saved Checklists & Data/i);
  });

  test("4. Statutory disclaimer and About info conform to Class 8 civic standards", () => {
    const content = fs.readFileSync(moreScreenPath, "utf-8");

    // Disclaimer clearly states non-governmental civic status
    assert.match(content, /NOT affiliated with[\s\S]*Government of India/i);
    assert.match(content, /sarathi\.parivahan\.gov\.in/);
    assert.match(content, /passportindia\.gov\.in/);
    assert.match(content, /digitalgujarat\.gov\.in/);

    // About clearly states Class 8 reading standard and 100% verification
    assert.match(content, /Class 8 Plain Language Standard/i);
    assert.match(content, /Zero Unverified Content/i);
  });

  test("5. more.tsx strictly enforces LIGHT THEME ONLY with zero dark mode styles", () => {
    const content = fs.readFileSync(moreScreenPath, "utf-8");

    assert.match(content, /colors\.background/);
    assert.match(content, /colors\.surface/);
    assert.match(content, /colors\.primary/);
    assert.match(content, /colors\.border/);
    assert.doesNotMatch(content, /darkMode/i);
  });
});
