import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 120: Home & Category Screens with Bottom Tabs (React Native)", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const homePath = path.join(mobileDir, "app", "(tabs)", "index.tsx");
  const categoryPath = path.join(mobileDir, "app", "category", "[slug].tsx");
  const tabsLayoutPath = path.join(mobileDir, "app", "(tabs)", "_layout.tsx");

  test("1. Bottom tabs layout configures Home, Search, My Lists, and More tabs", () => {
    assert.ok(fs.existsSync(tabsLayoutPath), "apps/mobile/app/(tabs)/_layout.tsx must exist");
    const content = fs.readFileSync(tabsLayoutPath, "utf-8");

    assert.match(content, /Tabs\.Screen[\s\S]*?name="index"[\s\S]*?title:\s*"Home"/);
    assert.match(content, /Tabs\.Screen[\s\S]*?name="search"[\s\S]*?title:\s*"Search"/);
    assert.match(content, /Tabs\.Screen[\s\S]*?name="saved"[\s\S]*?title:\s*"My Lists"/);
    assert.match(content, /Tabs\.Screen[\s\S]*?name="more"[\s\S]*?title:\s*"More"/);
    assert.match(content, /tabBarActiveTintColor:\s*"#2563EB"/);
  });

  test("2. Home screen implements search bar, state chip, category grid, and popular guides", () => {
    assert.ok(fs.existsSync(homePath), "Home screen must exist");
    const content = fs.readFileSync(homePath, "utf-8");

    // Search bar
    assert.match(content, /SearchField/);
    assert.match(content, /Find Citizen Document Guide/);

    // State chip
    assert.match(content, /stateChip/);
    assert.match(content, /showStateModal/);
    assert.match(content, /Gujarat/);

    // Category grid
    assert.match(content, /CIVIC_CATEGORIES/);
    assert.match(content, /gridCard/);
    assert.match(content, /Browse by Civic Category/);

    // Popular guides
    assert.match(content, /POPULAR_GUIDES/);
    assert.match(content, /driving-licence-learner/);
    assert.match(content, /passport-renewal/);
  });

  test("3. Home screen implements pull-to-refresh and skeleton loaders", () => {
    const content = fs.readFileSync(homePath, "utf-8");

    assert.match(content, /RefreshControl/);
    assert.match(content, /onRefresh=\{handleRefresh\}/);
    assert.match(content, /Skeleton/);
    assert.match(content, /skeletonContainer/);
  });

  test("4. Category screen renders category header, guide list, and official portal notice", () => {
    assert.ok(fs.existsSync(categoryPath), "Category screen must exist");
    const content = fs.readFileSync(categoryPath, "utf-8");

    assert.match(content, /useLocalSearchParams/);
    assert.match(content, /headerCard/);
    assert.match(content, /headerTitle/);
    assert.match(content, /Verified Government Portals/);
    assert.match(content, /guidesList/);
    assert.match(content, /hasGujaratPortal/);
  });

  test("5. Category screen implements pull-to-refresh and skeleton loaders", () => {
    const content = fs.readFileSync(categoryPath, "utf-8");

    assert.match(content, /RefreshControl/);
    assert.match(content, /onRefresh=\{handleRefresh\}/);
    assert.match(content, /Skeleton/);
    assert.match(content, /skeletonBox/);
  });
});
