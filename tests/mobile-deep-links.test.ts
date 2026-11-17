import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 128: Mobile Deep Links, Universal Links & Web Smart App Banner", () => {
  const rootDir = process.cwd();
  const appJsonPath = path.join(rootDir, "apps", "mobile", "app.json");
  const deepLinksModulePath = path.join(rootDir, "apps", "mobile", "lib", "deep-links.ts");
  const smartBannerPath = path.join(rootDir, "src", "components", "layout", "SmartAppBanner.tsx");
  const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");
  const assetLinksPath = path.join(rootDir, "public", ".well-known", "assetlinks.json");
  const appleAssociationPath = path.join(
    rootDir,
    "public",
    ".well-known",
    "apple-app-site-association"
  );

  test("1. app.json configures scheme, Android App Links intent filters, and iOS Universal Links", () => {
    assert.ok(fs.existsSync(appJsonPath), "app.json must exist");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    const expo = appJson.expo;

    // Custom scheme
    assert.ok(
      expo.scheme === "indiapaperwork" || expo.scheme === "civicguide",
      "Expo scheme must be defined"
    );

    // Android App Links
    assert.ok(expo.android?.intentFilters, "Android intentFilters must be configured");
    const intent = expo.android.intentFilters[0];
    assert.equal(intent.autoVerify, true, "autoVerify must be true for verified App Links");
    assert.ok(intent.category.includes("BROWSABLE"));
    assert.ok(intent.category.includes("DEFAULT"));

    const hosts = intent.data.map((d: { host?: string }) => d.host).filter(Boolean);
    assert.ok(hosts.includes("indiapaperwork.in"));

    // iOS Associated Domains
    assert.ok(expo.ios?.associatedDomains, "iOS associatedDomains must be configured");
    assert.ok(expo.ios.associatedDomains.some((d: string) => d.includes("indiapaperwork.in")));
  });

  test("2. deep-links.ts resolves Universal links into the correct task, category, and state screens", async () => {
    assert.ok(fs.existsSync(deepLinksModulePath), "deep-links.ts must exist");
    const { resolveDeepLink } = await import(deepLinksModulePath);

    // Task guide with state: /passport-renewal/gujarat
    const taskStateResult = resolveDeepLink("https://indiapaperwork.in/passport-renewal/gujarat");
    assert.equal(taskStateResult.screen, "task");
    assert.equal(taskStateResult.pathname, "/task/[slug]");
    assert.equal(taskStateResult.params.slug, "passport-renewal");
    assert.equal(taskStateResult.params.state, "gujarat");
    assert.equal(taskStateResult.isUniversalLink, true);

    // National task guide: /driving-licence-learner
    const taskNationalResult = resolveDeepLink("https://indiapaperwork.in/driving-licence-learner");
    assert.equal(taskNationalResult.screen, "task");
    assert.equal(taskNationalResult.params.slug, "driving-licence-learner");

    // Category screen: /category/vehicles
    const categoryResult = resolveDeepLink("https://indiapaperwork.in/category/vehicles");
    assert.equal(categoryResult.screen, "category");
    assert.equal(categoryResult.pathname, "/category/[slug]");
    assert.equal(categoryResult.params.slug, "vehicles");

    // Search screen: /search?q=ration
    const searchResult = resolveDeepLink("https://indiapaperwork.in/search?q=ration");
    assert.equal(searchResult.screen, "search");
    assert.equal(searchResult.pathname, "/(tabs)/search");
    assert.equal(searchResult.params.q, "ration");

    // Saved checklists: /saved
    const savedResult = resolveDeepLink("https://indiapaperwork.in/saved");
    assert.equal(savedResult.screen, "saved");
    assert.equal(savedResult.pathname, "/(tabs)/saved");
  });

  test("3. deep-links.ts resolves custom scheme URLs (civicguide://) and generates universal links", async () => {
    const { resolveDeepLink, buildLinksForPath } = await import(deepLinksModulePath);

    // Custom scheme deep link
    const schemeResult = resolveDeepLink("civicguide://passport-renewal/gujarat");
    assert.equal(schemeResult.screen, "task");
    assert.equal(schemeResult.params.slug, "passport-renewal");
    assert.equal(schemeResult.params.state, "gujarat");
    assert.equal(schemeResult.isUniversalLink, false);

    // Link builders
    const links = buildLinksForPath("/passport-renewal/gujarat");
    assert.equal(links.universalUrl, "https://indiapaperwork.in/passport-renewal/gujarat");
    assert.equal(links.appSchemeUrl, "civicguide://passport-renewal/gujarat");
  });

  test("4. SmartAppBanner component enforces Open in app CTA, dismissal, and responsive styling", () => {
    assert.ok(fs.existsSync(smartBannerPath), "SmartAppBanner.tsx must exist");
    const content = fs.readFileSync(smartBannerPath, "utf-8");

    // Verbatim CTA requirement
    assert.match(content, /Open in app/i);

    // Deep link scheme formatting
    assert.match(content, /civicguide:\/\//);

    // Dismissal button and localStorage
    assert.match(content, /civic_app_banner_dismissed/);
    assert.match(content, /handleDismiss/);

    // Mobile-only visibility and accessibility
    assert.match(content, /md:hidden/);
    assert.match(content, /role="banner"/);
    assert.match(content, /aria-label="Open in mobile app banner"/);
    assert.match(content, /aria-label="Dismiss app banner"/);
  });

  test("5. Root layout integrates SmartAppBanner above header", () => {
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    assert.match(layoutContent, /<SmartAppBanner/);
    assert.match(layoutContent, /import\s+{\s*SmartAppBanner\s*}\s+from/);
  });

  test("6. Official Android AssetLinks and Apple App Site Association configurations exist", () => {
    assert.ok(fs.existsSync(assetLinksPath), "assetlinks.json must exist in public/.well-known");
    assert.ok(
      fs.existsSync(appleAssociationPath),
      "apple-app-site-association must exist in public/.well-known"
    );

    const assetLinks = JSON.parse(fs.readFileSync(assetLinksPath, "utf-8"));
    assert.ok(Array.isArray(assetLinks));
    assert.equal(assetLinks[0].target.package_name, "in.gov.paperworkguide.mobile");
    assert.ok(assetLinks[0].relation.includes("delegate_permission/common.handle_all_urls"));

    const appleAssociation = JSON.parse(fs.readFileSync(appleAssociationPath, "utf-8"));
    assert.ok(appleAssociation.applinks);
    assert.ok(appleAssociation.applinks.details[0].appID.includes("in.gov.paperworkguide.mobile"));
  });
});
