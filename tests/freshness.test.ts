import { describe, it } from "node:test";
import assert from "node:assert";
import { getFreshnessInfo } from "../src/lib/freshness.ts";

describe("Freshness Logic & Verification Audit", () => {
  const baseDate = new Date("2026-11-14T12:00:00.000Z");

  it("marks item verified 30 days ago as 'fresh'", () => {
    const verified30DaysAgo = new Date("2026-10-15T12:00:00.000Z");
    const info = getFreshnessInfo(verified30DaysAgo, baseDate);

    assert.strictEqual(info.status, "fresh");
    assert.strictEqual(info.badgeVariant, "verified");
    assert.strictEqual(info.isStale, false);
    assert.strictEqual(info.daysSince, 30);
  });

  it("marks item verified 120 days ago as 'aging'", () => {
    const verified120DaysAgo = new Date("2026-07-17T12:00:00.000Z");
    const info = getFreshnessInfo(verified120DaysAgo, baseDate);

    assert.strictEqual(info.status, "aging");
    assert.strictEqual(info.badgeVariant, "needs-update");
    assert.strictEqual(info.isStale, false);
    assert.ok(info.daysSince >= 119 && info.daysSince <= 121);
  });

  it("marks item verified 200 days ago as 'stale'", () => {
    const verified200DaysAgo = new Date("2026-04-28T12:00:00.000Z");
    const info = getFreshnessInfo(verified200DaysAgo, baseDate);

    assert.strictEqual(info.status, "stale");
    assert.strictEqual(info.badgeVariant, "needs-update");
    assert.strictEqual(info.isStale, true);
  });

  it("marks missing or invalid date as 'stale'", () => {
    const missing = getFreshnessInfo(null, baseDate);
    assert.strictEqual(missing.status, "stale");
    assert.strictEqual(missing.isStale, true);

    const invalid = getFreshnessInfo("invalid-date-string", baseDate);
    assert.strictEqual(invalid.status, "stale");
    assert.strictEqual(invalid.isStale, true);
  });
});
