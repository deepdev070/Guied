import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 118: Scaffold Expo App (TypeScript, Expo Router, Light-only, Assets)", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const appJsonPath = path.join(mobileDir, "app.json");
  const pkgJsonPath = path.join(mobileDir, "package.json");

  test("1. app.json exists and defines app metadata and slug", () => {
    assert.ok(fs.existsSync(appJsonPath), "apps/mobile/app.json must exist");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

    assert.equal(appJson.expo.name, "India Paperwork Guide");
    assert.equal(appJson.expo.slug, "india-paperwork-guide");
    assert.equal(appJson.expo.version, "0.1.0");
    assert.equal(appJson.expo.orientation, "portrait");
    assert.equal(appJson.expo.scheme, "indiapaperwork");
  });

  test("2. app.json enforces strict LIGHT-ONLY UI (userInterfaceStyle: light)", () => {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

    assert.equal(appJson.expo.userInterfaceStyle, "light", "Root userInterfaceStyle must be light");
    assert.equal(
      appJson.expo.ios.userInterfaceStyle,
      "light",
      "iOS userInterfaceStyle must be light"
    );
    assert.equal(
      appJson.expo.android.userInterfaceStyle,
      "light",
      "Android userInterfaceStyle must be light"
    );
  });

  test("3. app.json configures Android package and iOS bundleIdentifier", () => {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

    assert.equal(appJson.expo.ios.bundleIdentifier, "in.gov.paperworkguide.mobile");
    assert.equal(appJson.expo.android.package, "in.gov.paperworkguide.mobile");
  });

  test("4. app.json configures splash screen with civic blue (#2563EB) background", () => {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

    assert.ok(appJson.expo.splash, "Splash screen config must exist");
    assert.equal(appJson.expo.splash.backgroundColor.toUpperCase(), "#2563EB");
    assert.equal(appJson.expo.splash.resizeMode, "contain");
    assert.equal(appJson.expo.android.adaptiveIcon.backgroundColor.toUpperCase(), "#2563EB");
  });

  test("5. Mobile assets exist in apps/mobile/assets", () => {
    const assetsDir = path.join(mobileDir, "assets");
    assert.ok(fs.existsSync(assetsDir), "apps/mobile/assets directory must exist");

    const requiredAssets = ["icon.png", "adaptive-icon.png", "splash.png", "favicon.png"];
    for (const asset of requiredAssets) {
      const assetPath = path.join(assetsDir, asset);
      assert.ok(fs.existsSync(assetPath), `Asset ${asset} must exist in apps/mobile/assets`);
      const stat = fs.statSync(assetPath);
      assert.ok(stat.size > 0, `Asset ${asset} must not be empty`);
    }
  });

  test("6. Expo Router navigation structure exists", () => {
    const files = [
      path.join(mobileDir, "app", "_layout.tsx"),
      path.join(mobileDir, "app", "(tabs)", "_layout.tsx"),
      path.join(mobileDir, "app", "(tabs)", "index.tsx"),
      path.join(mobileDir, "app", "(tabs)", "search.tsx"),
      path.join(mobileDir, "app", "(tabs)", "saved.tsx"),
      path.join(mobileDir, "app", "(tabs)", "more.tsx"),
      path.join(mobileDir, "app", "task", "[slug].tsx"),
      path.join(mobileDir, "app", "category", "[slug].tsx"),
    ];

    for (const f of files) {
      assert.ok(fs.existsSync(f), `Route file ${path.relative(mobileDir, f)} must exist`);
      const content = fs.readFileSync(f, "utf-8");
      assert.ok(content.length > 50, `Route file ${path.relative(mobileDir, f)} must not be empty`);
    }
  });

  test("7. package.json configures Expo Router entry and monorepo workspace dependencies", () => {
    assert.ok(fs.existsSync(pkgJsonPath), "apps/mobile/package.json must exist");
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

    assert.equal(pkg.main, "expo-router/entry");
    assert.ok(pkg.scripts.start.includes("expo"));
    assert.ok(pkg.scripts.android.includes("expo"));
    assert.equal(pkg.dependencies["@civic/types"], "*");
    assert.equal(pkg.dependencies["@civic/utils"], "*");
  });
});

