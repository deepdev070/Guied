import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  getSentryConfig,
  scrubPiiText,
  scrubPiiObject,
  beforeSendScrubber,
  captureException,
  captureMessage,
  sentryEventLog,
  type SentryEvent,
} from "../src/lib/sentry.ts";
import { GET as testErrorRoute } from "../src/app/api/test-error/route.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 135: Sentry Error Monitoring & PII Scrubbing", () => {
  describe("1. Configuration & Quota Management", () => {
    it("returns correct Sentry configuration with release tag and free-tier sampling", () => {
      const config = getSentryConfig();
      assert.ok(config.release, "Release tag should be configured");
      assert.ok(typeof config.tracesSampleRate === "number");
      assert.ok(config.tracesSampleRate <= 1.0 && config.tracesSampleRate >= 0.1);
      assert.strictEqual(typeof config.beforeSend, "function");
    });

    it("verifies production browser source maps enabled in next.config.ts", () => {
      const configContent = fs.readFileSync(path.join(rootDir, "next.config.ts"), "utf-8");
      assert.ok(
        configContent.includes("productionBrowserSourceMaps: true"),
        "Missing productionBrowserSourceMaps in next.config.ts"
      );
    });
  });

  describe("2. Citizen PII Scrubbing", () => {
    it("redacts Aadhaar numbers from error messages", () => {
      const raw = "Citizen Aadhaar 1234 5678 9012 failed portal sync";
      const scrubbed = scrubPiiText(raw);
      assert.ok(!scrubbed.includes("1234 5678 9012"));
      assert.ok(scrubbed.includes("[REDACTED_AADHAAR]"));
    });

    it("redacts PAN card numbers from text", () => {
      const raw = "Applicant with PAN ABCDE1234F has mismatched surname";
      const scrubbed = scrubPiiText(raw);
      assert.ok(!scrubbed.includes("ABCDE1234F"));
      assert.ok(scrubbed.includes("[REDACTED_PAN]"));
    });

    it("redacts mobile phone numbers", () => {
      const raw = "SMS notification failed for +919876543210 on OTP retry";
      const scrubbed = scrubPiiText(raw);
      assert.ok(!scrubbed.includes("9876543210"));
      assert.ok(scrubbed.includes("[REDACTED_PHONE]"));
    });

    it("redacts citizen email addresses", () => {
      const raw = "Confirmation sent to rajesh.patel@example.gov.in";
      const scrubbed = scrubPiiText(raw);
      assert.ok(!scrubbed.includes("rajesh.patel@example.gov.in"));
      assert.ok(scrubbed.includes("[REDACTED_EMAIL]"));
    });

    it("redacts passport numbers", () => {
      const raw = "Dispatching document for passport J1234567";
      const scrubbed = scrubPiiText(raw);
      assert.ok(!scrubbed.includes("J1234567"));
      assert.ok(scrubbed.includes("[REDACTED_PASSPORT]"));
    });

    it("recursively scrubs nested objects and removes user IP address", () => {
      const rawEvent: SentryEvent = {
        message: "Failed form submit for 1234-5678-9012",
        user: {
          id: "usr_1",
          ip_address: "103.21.244.0",
          email: "user@test.in",
        },
        extra: {
          phone: "9876543210",
          nested: {
            pan: "ABCDE1234F",
          },
        },
      };

      const result = beforeSendScrubber(rawEvent);
      assert.ok(result);
      assert.ok(!result.message?.includes("1234-5678-9012"));
      assert.strictEqual(result.user?.ip_address, undefined, "User IP should be deleted");
      assert.strictEqual(result.user?.email, "[REDACTED_EMAIL]");
      assert.strictEqual((result.extra as any)?.phone, "[REDACTED]");
      assert.strictEqual((result.extra as any)?.nested?.pan, "[REDACTED]");
    });
  });

  describe("3. Exception Capturing & Mobile Wrapper", () => {
    it("captureException logs scrubbed event in memory", () => {
      const initialCount = sentryEventLog.length;
      const error = new Error("Gateway timeout for citizen PAN: ABCDE1234F");
      const event = captureException(error, { source: "parivahan" });

      assert.strictEqual(sentryEventLog.length, initialCount + 1);
      assert.ok(event.message?.includes("[REDACTED_PAN]"));
      assert.ok(event.event_id?.startsWith("evt_"));
    });

    it("captureMessage records message events safely", () => {
      const event = captureMessage("User phone 9876543210 triggered checklist sync");
      assert.ok(event.message?.includes("[REDACTED_PHONE]"));
    });

    it("mobile sentry wrapper provides mobile release and tags", async () => {
      const mobileSentryPath = path.join(rootDir, "apps", "mobile", "lib", "sentry.ts");
      assert.ok(fs.existsSync(mobileSentryPath), "apps/mobile/lib/sentry.ts must exist");
      const mobileModule = await import(pathToFileURL(mobileSentryPath).href);
      const mobileConfig = mobileModule.getMobileSentryConfig();
      assert.strictEqual(mobileConfig.release, "v0.1.0-mobile");
      const event = mobileModule.captureMobileException(
        new Error("Mobile camera permission error")
      );
      assert.strictEqual((event.extra as any)?.platform, "mobile");
    });
  });

  describe("4. Development Test Error Route", () => {
    it("returns 404 in production environment without secret bypass", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as any).NODE_ENV = "production";
        const req = new Request("http://localhost:3000/api/test-error");
        const res = await testErrorRoute(req as any);
        assert.strictEqual(res.status, 404);
        const data = await res.json();
        assert.strictEqual(data.error, "Not Found");
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
      }
    });

    it("triggers synthetic error and verifies scrubbing when authorized or in dev", async () => {
      const req = new Request("http://localhost:3000/api/test-error", {
        headers: { "x-test-error-bypass": "civic-test-secret-2026" },
      });
      const res = await testErrorRoute(req as any);
      assert.strictEqual(res.status, 500);
      const data = await res.json();
      assert.strictEqual(data.status, "error_triggered");
      assert.strictEqual(data.captured, true);
      assert.ok(data.scrubbedMessage.includes("[REDACTED_AADHAAR]"));
      assert.ok(!data.scrubbedMessage.includes("9999 8888 7777"));
    });
  });
});
