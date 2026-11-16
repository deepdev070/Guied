import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 121: Mobile Search Screen (Instant Results, Debounce, Stale Cancellation, Offline)", () => {
  const searchScreenPath = path.join(
    process.cwd(),
    "apps",
    "mobile",
    "app",
    "(tabs)",
    "search.tsx"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let searchModule: any;

  before(async () => {
    const searchLibPath = path.join(process.cwd(), "apps", "mobile", "lib", "mobile-search.ts");
    searchModule = await import(searchLibPath);
  });

  test("1. Offline search catalog matches queries and category filters", () => {
    const { searchOfflineCatalog } = searchModule;
    // Exact match
    const drivingResults = searchOfflineCatalog("driving licence");
    assert.ok(drivingResults.length >= 2, "Must match learner and permanent licence");
    assert.equal(drivingResults[0].task.categorySlug, "vehicles");

    // Category filter
    const identityResults = searchOfflineCatalog("", "identity");
    assert.ok(identityResults.length >= 2, "Must match identity tasks");
    for (const r of identityResults) {
      assert.equal(r.task.categorySlug, "identity");
    }

    // Empty query returns all items
    const allResults = searchOfflineCatalog("");
    assert.ok(allResults.length >= 5);
  });

  test("2. fetchSearchGuides falls back to offline catalog when network is down", async () => {
    const { fetchSearchGuides } = searchModule;
    // When pointing to an unreachable port, must gracefully return offline results
    const res = await fetchSearchGuides({
      query: "passport",
      baseUrl: "http://127.0.0.1:59999", // closed port
    });

    assert.equal(res.isOffline, true, "Must flag offline fallback");
    assert.ok(res.results.length >= 1, "Must return offline matches");
    assert.match(res.results[0].task.name, /Passport/i);
  });

  test("3. fetchSearchGuides respects AbortController signal", async () => {
    const { fetchSearchGuides } = searchModule;
    const controller = new AbortController();
    controller.abort(); // Abort immediately

    await assert.rejects(
      async () => {
        await fetchSearchGuides({
          query: "driving",
          signal: controller.signal,
          baseUrl: "http://127.0.0.1:59999",
        });
      },
      { name: "AbortError" }
    );
  });

  test("4. Search screen implements debounced input and AbortController cancellation", () => {
    assert.ok(fs.existsSync(searchScreenPath), "search.tsx must exist");
    const content = fs.readFileSync(searchScreenPath, "utf-8");

    // Debounce
    assert.match(content, /debounceTimerRef/);
    assert.match(content, /setTimeout/);
    assert.match(content, /clearTimeout/);

    // Stale request cancellation
    assert.match(content, /abortControllerRef/);
    assert.match(content, /AbortController/);
    assert.match(content, /controller\.signal/);
  });

  test("5. Search screen implements recent searches, suggestions, and empty state", () => {
    const content = fs.readFileSync(searchScreenPath, "utf-8");

    // Recent searches
    assert.match(content, /recentSearches/);
    assert.match(content, /saveRecentSearch/);
    assert.match(content, /clearRecentSearches/);

    // Suggestions
    assert.match(content, /SUGGESTED_SEARCHES/);
    assert.match(content, /handleSelectSuggestion/);

    // Empty state
    assert.match(content, /emptyCard/);
    assert.match(content, /No Matching Guides Found/);

    // Offline banner
    assert.match(content, /isOfflineMode/);
    assert.match(content, /Offline Mode/);
  });

  test("6. Search screen includes quick category filter chips", () => {
    const content = fs.readFileSync(searchScreenPath, "utf-8");

    assert.match(content, /QUICK_CATEGORIES/);
    assert.match(content, /filterChip/);
    assert.match(content, /selectedCategory/);
  });
});
