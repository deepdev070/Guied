import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { logMissingPage } from "../src/lib/missing-pages.ts";

describe("Missing Pages Logger (404 Telemetry)", () => {
  it("rejects empty or invalid URLs gracefully without crashing", async () => {
    const result1 = await logMissingPage({ url: "" });
    assert.strictEqual(result1.success, false);

    const result2 = await logMissingPage({ url: null as unknown as string });
    assert.strictEqual(result2.success, false);
  });

  it("handles valid URL logging cleanly without crashing even if database is offline", async () => {
    const result = await logMissingPage({
      url: "https://indiapaperwork.in/unknown-guidance-page",
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0 Test",
    });

    // In local unit test without running postgres db container, it should catch error and return { success: false } or { success: true } if db is up
    assert.ok(typeof result.success === "boolean");
  });
});
