import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 127: Mobile Ad Slot Placeholders (<AppAdSlot>) & Platform Policy", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const adsServicePath = path.join(mobileDir, "lib", "mobile-ads.ts");
  const adSlotComponentPath = path.join(mobileDir, "components", "ads", "AppAdSlot.tsx");
  const homeScreenPath = path.join(mobileDir, "app", "(tabs)", "index.tsx");
  const categoryScreenPath = path.join(mobileDir, "app", "category", "[slug].tsx");
  const taskDetailPath = path.join(mobileDir, "app", "task", "[slug].tsx");

  test("1. mobile-ads.ts defines format specs with exact reserved heights (CLS = 0)", async () => {
    assert.ok(fs.existsSync(adsServicePath), "mobile-ads.ts must exist");
    const { AD_FORMAT_SPECS } = await import(adsServicePath);

    // Banner (320x50)
    assert.ok(AD_FORMAT_SPECS.banner);
    assert.equal(AD_FORMAT_SPECS.banner.width, 320);
    assert.equal(AD_FORMAT_SPECS.banner.height, 50);
    assert.ok(
      AD_FORMAT_SPECS.banner.minContainerHeight >= 50,
      "Banner container must reserve height to prevent layout shift"
    );
    assert.equal(AD_FORMAT_SPECS.banner.label, "Advertisement");

    // Medium Rectangle (300x250)
    assert.ok(AD_FORMAT_SPECS.medium_rectangle);
    assert.equal(AD_FORMAT_SPECS.medium_rectangle.width, 300);
    assert.equal(AD_FORMAT_SPECS.medium_rectangle.height, 250);
    assert.ok(
      AD_FORMAT_SPECS.medium_rectangle.minContainerHeight >= 250,
      "Medium rectangle must reserve height to prevent layout shift"
    );
    assert.equal(AD_FORMAT_SPECS.medium_rectangle.label, "Advertisement");
  });

  test("2. Ads are disabled by config flag by default and prepare AdMob integration points", async () => {
    const { MOBILE_ADS_CONFIG, getMobileAdsConfig } = await import(adsServicePath);

    // Disabled by default
    assert.equal(MOBILE_ADS_CONFIG.enabled, false);
    assert.equal(getMobileAdsConfig().enabled, false);

    // Prepares official Google AdMob test IDs for Android and iOS
    assert.ok(MOBILE_ADS_CONFIG.adMobAppId.android.startsWith("ca-app-pub-"));
    assert.ok(MOBILE_ADS_CONFIG.adMobAppId.ios.startsWith("ca-app-pub-"));
    assert.ok(MOBILE_ADS_CONFIG.testAdUnitIds.banner.android.startsWith("ca-app-pub-"));
    assert.ok(MOBILE_ADS_CONFIG.testAdUnitIds.mediumRectangle.ios.startsWith("ca-app-pub-"));
  });

  test("3. Platform policy rules strictly forbid ads on first/home screen and legal pages", async () => {
    const { isAdAllowedOnScreen, validateAdPlacement } = await import(adsServicePath);

    // Forbidden on first screen / home / onboarding / splash / privacy
    assert.equal(isAdAllowedOnScreen("home"), false);
    assert.equal(isAdAllowedOnScreen("first_screen"), false);
    assert.equal(isAdAllowedOnScreen("privacy"), false);
    assert.equal(isAdAllowedOnScreen("terms"), false);
    assert.equal(isAdAllowedOnScreen("saved"), false);

    // Allowed on content/guide lists and detail sections
    assert.equal(isAdAllowedOnScreen("category_list"), true);
    assert.equal(isAdAllowedOnScreen("guide_detail_section"), true);

    // Placement validation prevents accidental-click risk
    const safePlacement = validateAdPlacement({ screenName: "category_list" });
    assert.equal(safePlacement.allowed, true);

    const accidentalClickRisk = validateAdPlacement({
      screenName: "category_list",
      isAccidentalClickRisk: true,
    });
    assert.equal(accidentalClickRisk.allowed, false);
    assert.match(accidentalClickRisk.reason || "", /accidental clicks/i);

    const homePlacement = validateAdPlacement({ screenName: "home" });
    assert.equal(homePlacement.allowed, false);
  });

  test("4. AppAdSlot component source enforces reserved height, label and strict light theme", () => {
    assert.ok(fs.existsSync(adSlotComponentPath), "AppAdSlot.tsx must exist");
    const content = fs.readFileSync(adSlotComponentPath, "utf-8");

    // Mandated label
    assert.match(content, /ADVERTISEMENT|Advertisement/);
    assert.match(content, /spec\.label\.toUpperCase\(\)/);

    // Reserved heights
    assert.match(content, /minHeight:\s*spec\.minContainerHeight/);

    // Policy check
    assert.match(content, /isAdAllowedOnScreen\(screenName\)/);

    // Config flag check
    assert.match(content, /config\.enabled/);

    // Light theme styling (colors.surface, dashed border, light muted text)
    assert.match(content, /borderStyle:\s*"dashed"/);
    assert.match(content, /colors\.surface/);
    assert.match(content, /colors\.border/);
    assert.doesNotMatch(content, /darkMode/i);
  });

  test("5. Category screen integrates 320x50 banner at the bottom of guide list", () => {
    const content = fs.readFileSync(categoryScreenPath, "utf-8");

    assert.match(content, /AppAdSlot/);
    assert.match(content, /format="banner"/);
    assert.match(content, /screenName="category_list"/);
  });

  test("6. Guide detail screen integrates 300x250 medium rectangle between sections away from CTAs", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /AppAdSlot/);
    assert.match(content, /format="medium_rectangle"/);
    assert.match(content, /screenName="guide_detail_section"/);

    // Verify it is positioned before Statutory Fees and before the sticky bottom bar JSX
    const adPos = content.indexOf('format="medium_rectangle"');
    const feePos = content.indexOf("Statutory Fees Breakdown");
    const stickyPos = content.indexOf("<View style={styles.stickyBar}>");

    assert.ok(adPos < feePos, "Medium rectangle ad must appear between sections before fees");
    assert.ok(adPos < stickyPos, "Ad must never be placed inside the sticky action bar");
  });

  test("7. Home screen strictly complies with platform policy by having ZERO ads", () => {
    const content = fs.readFileSync(homeScreenPath, "utf-8");

    assert.doesNotMatch(
      content,
      /AppAdSlot/i,
      "First/Home screen must strictly have NO ad components as per Google Play policy"
    );
  });
});
