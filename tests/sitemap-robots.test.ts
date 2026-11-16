import assert from "node:assert/strict";
import { describe, it } from "node:test";
import robots from "../src/app/robots.ts";
import sitemap from "../src/app/sitemap.ts";
import {
  calculateSitemapIds,
  chunkSitemapEntries,
  DEFAULT_SITE_URL,
  getAllSitemapEntries,
  getSitemapChunk,
  SITEMAP_MAX_URLS,
} from "../src/lib/sitemap.ts";

describe("Sitemap Generation (Prompt 75)", () => {
  it("generates entries for homepage, categories, states, tasks, and task+state pages", async () => {
    const entries = await getAllSitemapEntries();

    assert.ok(entries.length > 0, "Sitemap should contain entries");

    const urls = entries.map((e) => e.url);

    // Root homepage
    assert.ok(urls.includes(DEFAULT_SITE_URL), "Homepage must be in sitemap");

    // Static civic pages
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/about`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/how-we-verify`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/disclaimer`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/privacy-policy`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/terms`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/glossary`));

    // Categories
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/category/identity`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/category/vehicles`));

    // States
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/state/gujarat`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/state/maharashtra`));

    // Tasks (national)
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/passport-renewal`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/driving-licence-learner`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/driving-licence-new`));

    // Task + State pages
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/passport-renewal/gujarat`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/driving-licence-learner/gujarat`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/driving-licence-learner/maharashtra`));

    // Glossary terms
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/glossary/affidavit`));
    assert.ok(urls.includes(`${DEFAULT_SITE_URL}/glossary/notary`));
  });

  it("ensures every entry has a valid lastModified date, changeFrequency, and priority", async () => {
    const entries = await getAllSitemapEntries();

    for (const entry of entries) {
      assert.ok(entry.url.startsWith("https://"), `URL must start with https: ${entry.url}`);
      assert.ok(entry.lastModified instanceof Date, `lastModified must be a Date: ${entry.url}`);
      assert.ok(
        !isNaN(entry.lastModified.getTime()),
        `lastModified must be a valid timestamp: ${entry.url}`
      );
      assert.ok(
        typeof entry.priority === "number" && entry.priority >= 0 && entry.priority <= 1,
        `Priority must be between 0 and 1: ${entry.url}`
      );
      assert.ok(
        ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].includes(
          entry.changeFrequency ?? ""
        ),
        `Invalid changeFrequency for ${entry.url}`
      );
    }
  });

  it("guarantees 100% unique URLs without duplicates", async () => {
    const entries = await getAllSitemapEntries();
    const urls = entries.map((e) => e.url);
    const uniqueUrls = new Set(urls);

    assert.equal(
      uniqueUrls.size,
      urls.length,
      `Detected duplicate URLs in sitemap (${urls.length - uniqueUrls.size} duplicates)`
    );
  });

  it("app/sitemap.ts default export matches getAllSitemapEntries output", async () => {
    const routeSitemap = await sitemap();
    const helperSitemap = await getAllSitemapEntries();

    assert.equal(routeSitemap.length, helperSitemap.length);
    assert.equal(routeSitemap[0]?.url, helperSitemap[0]?.url);
  });

  it("correctly splits sitemaps if total URLs exceed 5,000", () => {
    // Generate dummy array of 12,500 entries
    const dummyEntries = Array.from({ length: 12500 }, (_, i) => ({
      url: `https://indiapaperworkguide.in/guide-${i}`,
      lastModified: new Date("2026-01-01"),
      priority: 0.8,
    }));

    const chunks = chunkSitemapEntries(dummyEntries, SITEMAP_MAX_URLS);
    assert.equal(chunks.length, 3, "12,500 entries should produce 3 chunks");
    assert.equal(chunks[0]?.length, 5000);
    assert.equal(chunks[1]?.length, 5000);
    assert.equal(chunks[2]?.length, 2500);

    const ids = calculateSitemapIds(12500, SITEMAP_MAX_URLS);
    assert.deepEqual(ids, [{ id: 0 }, { id: 1 }, { id: 2 }]);

    const chunk1 = getSitemapChunk(dummyEntries, 1, SITEMAP_MAX_URLS);
    assert.equal(chunk1[0]?.url, "https://indiapaperworkguide.in/guide-5000");
  });
});

describe("Robots.txt Generation (Prompt 75)", () => {
  it("allows all paths except /admin, /api/, /design, /my-checklists, and search parameters", () => {
    const res = robots();
    const rules = Array.isArray(res.rules) ? res.rules[0] : res.rules;

    assert.ok(rules, "Robots rules must be defined");
    assert.equal(rules.userAgent, "*");
    assert.equal(rules.allow, "/");

    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    assert.ok(disallow.includes("/admin"), "Disallow /admin");
    assert.ok(disallow.includes("/api/"), "Disallow /api/");
    assert.ok(disallow.includes("/design"), "Disallow /design");
    assert.ok(disallow.includes("/my-checklists"), "Disallow /my-checklists");
    assert.ok(disallow.includes("/search?*"), "Disallow /search?*");

    assert.equal(res.sitemap, "https://indiapaperworkguide.in/sitemap.xml");
  });
});
