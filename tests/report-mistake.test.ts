import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../src/lib/rate-limiter.ts";

describe("Report Mistake & Civic Feedback System", () => {
  it("enforces sliding window rate limits per IP address", () => {
    const ip = `test-ip-${Date.now()}`;
    const options = { windowMs: 5000, maxRequests: 3 };

    // Requests 1, 2, 3 should be allowed
    const r1 = checkRateLimit(ip, options);
    assert.strictEqual(r1.allowed, true);
    assert.strictEqual(r1.remaining, 2);

    const r2 = checkRateLimit(ip, options);
    assert.strictEqual(r2.allowed, true);
    assert.strictEqual(r2.remaining, 1);

    const r3 = checkRateLimit(ip, options);
    assert.strictEqual(r3.allowed, true);
    assert.strictEqual(r3.remaining, 0);

    // Request 4 should be rejected by rate limiter
    const r4 = checkRateLimit(ip, options);
    assert.strictEqual(r4.allowed, false);
    assert.strictEqual(r4.remaining, 0);
  });

  it("resets rate limit after time window expires", async () => {
    const ip = `test-reset-ip-${Date.now()}`;
    const options = { windowMs: 100, maxRequests: 1 };

    const r1 = checkRateLimit(ip, options);
    assert.strictEqual(r1.allowed, true);

    const r2 = checkRateLimit(ip, options);
    assert.strictEqual(r2.allowed, false);

    // Wait for window to expire
    await new Promise((res) => setTimeout(res, 120));

    const r3 = checkRateLimit(ip, options);
    assert.strictEqual(r3.allowed, true);
  });
});
