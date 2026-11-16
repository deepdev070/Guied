import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAdminDashboardMetrics, getTopViewedGuides } from "../src/lib/admin/dashboard.ts";

describe("Prompt 104: Admin Dashboard & Metrics Overview", () => {
  it("calculates accurate dashboard metrics from task data", async () => {
    const metrics = await getAdminDashboardMetrics();

    assert.ok(typeof metrics.totalGuides === "number", "totalGuides must be a number");
    assert.ok(metrics.totalGuides >= 3, "totalGuides must count existing catalog guides");

    assert.ok(typeof metrics.publishedCount === "number", "publishedCount must be a number");
    assert.ok(typeof metrics.draftCount === "number", "draftCount must be a number");
    assert.ok(typeof metrics.reviewCount === "number", "reviewCount must be a number");
    assert.ok(typeof metrics.staleCount === "number", "staleCount must be a number");
    assert.ok(
      typeof metrics.openErrorReportsCount === "number",
      "openErrorReportsCount must be a number"
    );

    assert.ok(
      metrics.helpfulFeedbackScore >= 0 && metrics.helpfulFeedbackScore <= 100,
      "helpfulFeedbackScore must be a percentage between 0 and 100"
    );
  });

  it("returns top viewed guides sorted descending by view count", async () => {
    const topGuides = await getTopViewedGuides(10);

    assert.ok(Array.isArray(topGuides), "Must return an array of top guides");
    assert.ok(topGuides.length > 0, "Must return at least 1 guide");
    assert.ok(topGuides.length <= 10, "Must return at most 10 guides");

    // Verify sort order descending by views
    for (let i = 0; i < topGuides.length - 1; i++) {
      const current = topGuides[i];
      const next = topGuides[i + 1];
      assert.ok(current && next, "Items must exist");
      assert.ok(
        current.views >= next.views,
        `Guide ${current.slug} (${current.views}) must have >= views than ${next.slug} (${next.views})`
      );
    }

    // Verify properties on each item
    for (const item of topGuides) {
      assert.ok(item.slug, "Each guide must have a slug");
      assert.ok(item.name, "Each guide must have a name");
      assert.ok(item.categoryName, "Each guide must have a category");
      assert.ok(
        ["PUBLISHED", "REVIEW", "DRAFT"].includes(item.status),
        `Status ${item.status} must be valid`
      );
      assert.ok(typeof item.views === "number" && item.views > 0, "Views must be positive number");
      assert.ok(typeof item.helpfulScore === "number", "Helpful score must be number");
      assert.ok(typeof item.daysSinceVerified === "number", "daysSinceVerified must be number");
    }
  });

  it("verifies /admin page renders all required cards and top-10 table", () => {
    const pagePath = path.join(process.cwd(), "src/app/admin/page.tsx");
    assert.ok(fs.existsSync(pagePath), "src/app/admin/page.tsx must exist");

    const content = fs.readFileSync(pagePath, "utf8");

    // Required metrics cards per Prompt 104
    assert.ok(content.includes("Total Guides"), "Must render Total Guides card");
    assert.ok(content.includes("Workflow Status"), "Must render Workflow Status card");
    assert.ok(
      content.includes("Stale (>90 Days)") || content.includes("Stale (&gt;90 Days)"),
      "Must render Stale Items card"
    );
    assert.ok(content.includes("Error Reports"), "Must render Error Reports card");
    assert.ok(content.includes("Helpful Score"), "Must render Helpful-feedback score card");
    assert.ok(content.includes("Database Integrity & Backup Reminder"), "Must render Backup card");

    // Required Top 10 viewed guides table
    assert.ok(
      content.includes("Top 10 Most Viewed Civic Guides"),
      "Must render Top 10 table heading"
    );
    assert.ok(content.includes("30-Day Views"), "Must show views column");
    assert.ok(
      content.includes("requireAdminSession"),
      "Must enforce server-side admin authentication guard"
    );
    assert.ok(content.includes("index: false"), "Must declare noindex metadata");
  });

  it("verifies /admin/guides directory page supports filtering and search", () => {
    const guidesPagePath = path.join(process.cwd(), "src/app/admin/guides/page.tsx");
    assert.ok(fs.existsSync(guidesPagePath), "src/app/admin/guides/page.tsx must exist");

    const content = fs.readFileSync(guidesPagePath, "utf8");
    assert.ok(content.includes("Civic Guides Directory"), "Must have directory heading");
    assert.ok(content.includes("filter"), "Must support filter query param");
    assert.ok(content.includes("requireAdminSession"), "Must be protected by requireAdminSession");
  });
});
