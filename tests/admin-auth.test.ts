import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  verifyAdminCredentials,
  createSessionToken,
  verifySessionToken,
  generateCsrfToken,
  verifyCsrfToken,
  getSessionCookieOptions,
  getCsrfCookieOptions,
  SESSION_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_MS,
  ADMIN_SESSION_COOKIE,
  ADMIN_CSRF_COOKIE,
} from "../src/lib/admin/auth.ts";
import { checkRateLimit } from "../src/lib/rate-limiter.ts";

describe("Prompt 103: Admin Authentication & Security", () => {
  it("verifies admin credentials correctly using bcrypt", async () => {
    // Default development credentials
    const valid = await verifyAdminCredentials("admin", "Admin@Civic2026!");
    assert.equal(valid, true, "Valid dev credentials must verify successfully");

    const wrongPassword = await verifyAdminCredentials("admin", "WrongPassword123!");
    assert.equal(wrongPassword, false, "Wrong password must be rejected");

    const wrongUser = await verifyAdminCredentials("superhacker", "Admin@Civic2026!");
    assert.equal(wrongUser, false, "Wrong username must be rejected");
  });

  it("issues signed HMAC session tokens valid for 8 hours", () => {
    const token = createSessionToken("test-admin");
    assert.ok(token, "Session token must not be empty");
    assert.ok(token.includes("."), "Session token must contain payload and signature");

    const session = verifySessionToken(token);
    assert.ok(session, "Valid session token must verify");
    assert.equal(session?.username, "test-admin");

    const now = Date.now();
    assert.ok(
      session && session.expiresAt > now + (SESSION_MAX_AGE_MS - 5000),
      "Session must expire in approximately 8 hours"
    );
    assert.equal(SESSION_MAX_AGE_SECONDS, 8 * 60 * 60, "Session max age must be exactly 8 hours");
  });

  it("rejects tampered or forged session tokens", () => {
    const token = createSessionToken("valid-user");
    const [payload, signature] = token.split(".");
    assert.ok(signature, "Signature must exist");

    // 1. Altered signature
    const badSignature = signature.replace(/^./, signature[0] === "a" ? "b" : "a");
    const result1 = verifySessionToken(`${payload}.${badSignature}`);
    assert.equal(result1, null, "Tampered signature must be rejected");

    // 2. Tampered payload
    const forgedPayload = Buffer.from(
      JSON.stringify({ u: "admin", i: Date.now(), e: Date.now() + 10000 })
    ).toString("base64url");
    const result2 = verifySessionToken(`${forgedPayload}.${signature}`);
    assert.equal(result2, null, "Forged payload with original signature must be rejected");

    // 3. Malformed tokens
    assert.equal(verifySessionToken(""), null);
    assert.equal(verifySessionToken("invalid-token-without-dot"), null);
    assert.equal(verifySessionToken(null), null);
  });

  it("rejects expired session tokens (automatic logout after 8 hours)", () => {
    // Create token that expired 1 second ago
    const pastIssued = Date.now() - SESSION_MAX_AGE_MS - 2000;
    const pastExpires = Date.now() - 1000;
    const payload = { u: "expired-user", i: pastIssued, e: pastExpires };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", "paperwork-guide-admin-session-secret-key-2026")
      .update(encodedPayload)
      .digest("hex");

    const expiredToken = `${encodedPayload}.${signature}`;
    const result = verifySessionToken(expiredToken);
    assert.equal(result, null, "Expired token must be rejected after 8 hours");
  });

  it("generates and verifies 32-byte CSRF tokens securely", () => {
    const csrf1 = generateCsrfToken();
    const csrf2 = generateCsrfToken();

    assert.equal(typeof csrf1, "string");
    assert.equal(csrf1.length, 64, "32-byte hex token must be 64 characters");
    assert.notEqual(csrf1, csrf2, "Consecutive CSRF tokens must be distinct");

    assert.equal(verifyCsrfToken(csrf1, csrf1), true, "Identical CSRF tokens must match");
    assert.equal(verifyCsrfToken(csrf1, csrf2), false, "Mismatched CSRF tokens must fail");
    assert.equal(verifyCsrfToken(null, csrf1), false, "Null token must fail");
    assert.equal(verifyCsrfToken(csrf1, undefined), false, "Undefined token must fail");
  });

  it("configures session cookie as httpOnly with 8-hour lifetime", () => {
    const sessionOpts = getSessionCookieOptions();
    assert.equal(sessionOpts.httpOnly, true, "Admin session cookie must be httpOnly");
    assert.equal(sessionOpts.sameSite, "lax", "Admin session cookie must be sameSite lax");
    assert.equal(
      sessionOpts.maxAge,
      8 * 60 * 60,
      "Admin session cookie maxAge must be 8 hours (28800s)"
    );

    const csrfOpts = getCsrfCookieOptions();
    assert.equal(csrfOpts.httpOnly, false, "CSRF cookie must be accessible to form clients");
    assert.equal(csrfOpts.maxAge, 8 * 60 * 60);

    assert.equal(ADMIN_SESSION_COOKIE, "civic_admin_session");
    assert.equal(ADMIN_CSRF_COOKIE, "civic_admin_csrf");
  });

  it("enforces login rate limiting per IP", () => {
    const testIp = "test-rate-limit-ip-" + Date.now();
    const opts = { windowMs: 15 * 60 * 1000, maxRequests: 5 };

    // 5 attempts allowed
    for (let i = 1; i <= 5; i++) {
      const result = checkRateLimit(testIp, opts);
      assert.equal(result.allowed, true, `Attempt ${i} should be allowed`);
    }

    // 6th attempt blocked
    const blocked = checkRateLimit(testIp, opts);
    assert.equal(blocked.allowed, false, "6th attempt within window must be rate limited");
    assert.equal(blocked.remaining, 0);
  });

  it("ensures noindex metadata and secure routes exist", () => {
    const layoutPath = path.join(process.cwd(), "src/app/admin/layout.tsx");
    assert.ok(fs.existsSync(layoutPath), "Admin layout must exist");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");
    assert.ok(layoutContent.includes("index: false"), "Admin layout must specify index: false");
    assert.ok(layoutContent.includes("follow: false"), "Admin layout must specify follow: false");

    const loginPagePath = path.join(process.cwd(), "src/app/admin/login/page.tsx");
    assert.ok(fs.existsSync(loginPagePath), "Admin login page must exist");
    const loginContent = fs.readFileSync(loginPagePath, "utf8");
    assert.ok(loginContent.includes("index: false"), "Admin login must specify index: false");

    const apiRoutes = [
      "src/app/api/admin/login/route.ts",
      "src/app/api/admin/logout/route.ts",
      "src/app/api/admin/csrf/route.ts",
      "src/app/api/admin/me/route.ts",
    ];

    for (const route of apiRoutes) {
      assert.ok(fs.existsSync(path.join(process.cwd(), route)), `Route ${route} must exist`);
    }
  });
});
