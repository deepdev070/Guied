import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { executeSearch, buildSearchIndex, getPopularSearchSuggestions } from "../src/lib/search.ts";

describe("Search Engine (Fuse.js over Prebuilt Index)", () => {
  it("builds a search index with valid tasks", () => {
    const index = buildSearchIndex();
    assert.ok(index.length >= 3, "Index should contain at least 3 tasks");

    const dl = index.find((i) => i.slug === "driving-licence-new");
    assert.ok(dl, "Should contain driving-licence-new");
    assert.strictEqual(dl?.categorySlug, "vehicles");
    assert.ok(dl?.documentNames.length > 0, "Should index document requirements");
  });

  it("finds exact matches for tasks", () => {
    const results = executeSearch({ query: "passport renewal" });
    assert.ok(results.length > 0, "Should find results for 'passport renewal'");
    assert.ok(results[0]);
    assert.strictEqual(results[0].item.slug, "passport-renewal");
  });

  it("handles common typos and Hinglish transliterations", () => {
    // Typo: "licens" instead of "licence"
    const typoResults = executeSearch({ query: "licens" });
    assert.ok(typoResults.length > 0, "Should match 'licens' to licence tasks");
    const slugs = typoResults.map((r) => r.item.slug);
    assert.ok(
      slugs.includes("driving-licence-new") || slugs.includes("driving-licence-learner"),
      "Should find driving licence tasks for 'licens'"
    );

    // Tatkal vs Tatkaal
    const tatkalResults = executeSearch({ query: "tatkal" });
    assert.ok(tatkalResults.length > 0, "Should match 'tatkal'");
    assert.ok(tatkalResults[0]);
    assert.strictEqual(tatkalResults[0].item.slug, "passport-renewal");

    // Adhaar vs Aadhaar
    const adhaarResults = executeSearch({ query: "adhaar" });
    assert.ok(adhaarResults.length > 0, "Should match 'adhaar'");
    assert.ok(adhaarResults[0]);
    assert.strictEqual(adhaarResults[0].item.slug, "aadhaar-update");
  });

  it("filters results by category", () => {
    const transportResults = executeSearch({
      query: "",
      category: "vehicles",
    });

    assert.ok(transportResults.length > 0);
    for (const r of transportResults) {
      assert.strictEqual(r.item.categorySlug, "vehicles");
    }
  });

  it("filters results by state", () => {
    const gujaratResults = executeSearch({
      query: "",
      state: "gujarat",
    });

    assert.ok(gujaratResults.length > 0);
    for (const r of gujaratResults) {
      assert.ok(
        r.item.availableStates.includes("gujarat") || r.item.availableStates.length === 0,
        "Every result should be available in Gujarat or national"
      );
    }
  });

  it("returns popular search suggestions for empty state", () => {
    const suggestions = getPopularSearchSuggestions();
    assert.ok(suggestions.length > 0, "Should return popular suggestions");
    const slugs = suggestions.map((s) => s.slug);
    assert.ok(slugs.includes("driving-licence-new"));
  });
});
