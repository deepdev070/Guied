import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 124: Mobile Offline Content Cache & Airplane Mode Persistence", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const cachePath = path.join(mobileDir, "lib", "guide-cache.ts");
  const taskDetailPath = path.join(mobileDir, "app", "task", "[slug].tsx");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cacheModule: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let datapackModule: any;
  let mockStorage: Map<string, string>;

  before(async () => {
    cacheModule = await import(cachePath);
    const datapackPath = path.join(mobileDir, "lib", "offline-datapack.ts");
    datapackModule = await import(datapackPath);
  });

  beforeEach(() => {
    mockStorage = new Map<string, string>();
    cacheModule.setCacheStorageDriver({
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, val: string) => {
        mockStorage.set(key, val);
      },
      removeItem: (key: string) => {
        mockStorage.delete(key);
      },
    });
  });

  test("1. guide-cache file exists and exports required caching functions", () => {
    assert.ok(fs.existsSync(cachePath), "guide-cache.ts must exist");
    const { cacheViewedGuide, getCachedGuide, formatUpdatedAgo, clearGuideCache } = cacheModule;

    assert.equal(typeof cacheViewedGuide, "function");
    assert.equal(typeof getCachedGuide, "function");
    assert.equal(typeof formatUpdatedAgo, "function");
    assert.equal(typeof clearGuideCache, "function");
  });

  test("2. cacheViewedGuide saves guide entry with ISO cachedAt timestamp", () => {
    const { cacheViewedGuide, getCachedGuide } = cacheModule;
    const { getBundledGuide } = datapackModule;

    const baseGuide = getBundledGuide("driving-licence-learner", "gj");
    assert.ok(baseGuide);

    cacheViewedGuide(baseGuide, "network");

    const cached = getCachedGuide("driving-licence-learner", "gj");
    assert.ok(cached);
    assert.equal(cached.guide.slug, "driving-licence-learner");
    assert.equal(cached.source, "network");
    assert.ok(cached.cachedAt);
    assert.ok(!isNaN(new Date(cached.cachedAt).getTime()));
  });

  test("3. formatUpdatedAgo formats 'Updated 3 days ago', 'Updated today', and relative times", () => {
    const { formatUpdatedAgo } = cacheModule;
    const now = new Date("2026-11-16T12:00:00.000Z");

    // Today
    const today = new Date("2026-11-16T08:00:00.000Z").toISOString();
    assert.equal(formatUpdatedAgo(today, now), "Updated today");

    // Yesterday
    const yesterday = new Date("2026-11-15T12:00:00.000Z").toISOString();
    assert.equal(formatUpdatedAgo(yesterday, now), "Updated yesterday");

    // Exactly 3 days ago (verbatim Prompt 124 requirement)
    const threeDaysAgo = new Date("2026-11-13T12:00:00.000Z").toISOString();
    assert.equal(formatUpdatedAgo(threeDaysAgo, now), "Updated 3 days ago");

    // 10 days ago
    const tenDaysAgo = new Date("2026-11-06T12:00:00.000Z").toISOString();
    assert.equal(formatUpdatedAgo(tenDaysAgo, now), "Updated 10 days ago");
  });

  test("4. Airplane mode: cached guide returns full details with zero network connectivity", () => {
    const { cacheViewedGuide, getCachedGuide } = cacheModule;
    const { getBundledGuide } = datapackModule;

    const passportGuide = getBundledGuide("passport-renewal", "gj");
    assert.ok(passportGuide);

    // Cache the guide while online
    cacheViewedGuide(passportGuide, "network");

    // Simulate complete airplane mode (no network, purely reading from local storage)
    const offlineResult = getCachedGuide("passport-renewal", "gj");
    assert.ok(offlineResult, "Must retrieve guide offline");
    assert.equal(offlineResult.guide.title, passportGuide.title);
    assert.equal(offlineResult.guide.fees[0].amount, 1500);
    assert.ok(offlineResult.guide.documents.length >= 4);
    assert.ok(offlineResult.guide.steps.length >= 4);
  });

  test("5. Fallback: unviewed guides in airplane mode fallback to bundled datapack", () => {
    const { getCachedGuide } = cacheModule;

    // Notice we did NOT call cacheViewedGuide for pan-card-new in mockStorage
    assert.equal(mockStorage.size, 0);

    const fallback = getCachedGuide("pan-card-new", "gj");
    assert.ok(fallback, "Must fall back to bundled datapack in binary");
    assert.equal(fallback.guide.slug, "pan-card-new");
    assert.equal(fallback.source, "bundled");
  });

  test("6. Guide detail screen integrates offline cache and renders Updated status badge", () => {
    assert.ok(fs.existsSync(taskDetailPath), "Task detail screen must exist");
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /getCachedGuide/, "Must read from cached guide");
    assert.match(content, /cacheViewedGuide/, "Must cache viewed guide");
    assert.match(content, /formatUpdatedAgo/, "Must format updated ago text");
    assert.match(
      content,
      /<Badge[\s\S]*?formatUpdatedAgo/,
      "Must render updated ago badge in header"
    );
  });
});
