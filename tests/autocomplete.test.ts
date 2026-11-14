import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSearchSuggestions } from "../src/lib/autocomplete.ts";

describe("Search Autocomplete & Fuzzy Hinglish Suggestion Engine", () => {
  it("returns empty array for queries with fewer than 2 characters", () => {
    assert.deepStrictEqual(getSearchSuggestions(""), []);
    assert.deepStrictEqual(getSearchSuggestions("a"), []);
    assert.deepStrictEqual(getSearchSuggestions("  p  "), []);
  });

  it("suggests tasks for exact keyword queries", () => {
    const results = getSearchSuggestions("passport");
    assert.ok(results.length > 0, "Should return passport suggestions");
    assert.strictEqual(results[0]?.slug, "passport-renewal");
    assert.ok(results[0]?.name.includes("Passport"));
    assert.strictEqual(results[0]?.categoryName, "Identity Documents");
  });

  it("handles 'passport renew' query", () => {
    const results = getSearchSuggestions("passport renew");
    assert.ok(results.length > 0);
    assert.strictEqual(results[0]?.slug, "passport-renewal");
  });

  it("handles 'licence' query", () => {
    const results = getSearchSuggestions("licence");
    assert.ok(results.length > 0);
    const slugs = results.map((r) => r.slug);
    assert.ok(
      slugs.includes("driving-licence-learner") || slugs.includes("driving-licence-new"),
      "Should suggest driving licences"
    );
  });

  it("handles common misspelling 'licens'", () => {
    const results = getSearchSuggestions("licens");
    assert.ok(results.length > 0);
    const slugs = results.map((r) => r.slug);
    assert.ok(
      slugs.includes("driving-licence-learner") || slugs.includes("driving-licence-new"),
      "Should suggest driving licences for 'licens'"
    );
  });

  it("handles common Hinglish typo 'adhaar'", () => {
    const results = getSearchSuggestions("adhaar");
    assert.ok(results.length > 0);
    assert.strictEqual(results[0]?.slug, "aadhaar-update");
  });

  it("handles 'tatkal' query", () => {
    const results = getSearchSuggestions("tatkal");
    assert.ok(results.length > 0);
    assert.strictEqual(results[0]?.slug, "passport-renewal");
  });

  it("respects maxResults limit", () => {
    const results = getSearchSuggestions("card", 2);
    assert.ok(results.length <= 2, "Should return at most 2 results");
  });
});
