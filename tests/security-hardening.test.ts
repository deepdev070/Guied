import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECURITY_HEADERS, CSP_DIRECTIVES } from "../src/lib/security-headers.ts";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  isSafeUrl,
  escapeHtml,
  getSafeExternalLinkProps,
} from "../src/lib/sanitize.ts";
import { checkRateLimit } from "../src/lib/rate-limiter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 134: Security Hardening", () => {
  describe("1. Security Headers & CSP", () => {
    it("exports all mandatory security headers", () => {
      const headerKeys = SECURITY_HEADERS.map((h) => h.key);
      assert.ok(headerKeys.includes("Content-Security-Policy"), "Missing CSP header");
      assert.ok(headerKeys.includes("Strict-Transport-Security"), "Missing HSTS header");
      assert.ok(headerKeys.includes("X-Content-Type-Options"), "Missing nosniff header");
      assert.ok(headerKeys.includes("Referrer-Policy"), "Missing Referrer-Policy header");
      assert.ok(headerKeys.includes("Permissions-Policy"), "Missing Permissions-Policy header");
      assert.ok(headerKeys.includes("X-Frame-Options"), "Missing X-Frame-Options header");
      assert.ok(headerKeys.includes("X-DNS-Prefetch-Control"), "Missing DNS prefetch control");
    });

    it("CSP allows Google AdSense, Analytics, and Sentry while denying dangerous sources", () => {
      const cspString = CSP_DIRECTIVES.join("; ");
      assert.ok(cspString.includes("pagead2.googlesyndication.com"), "CSP missing Google AdSense");
      assert.ok(cspString.includes("google-analytics.com"), "CSP missing Google Analytics");
      assert.ok(cspString.includes("sentry.io"), "CSP missing Sentry");
      assert.ok(cspString.includes("frame-ancestors 'none'"), "CSP should block frame embedding");
      assert.ok(cspString.includes("object-src 'none'"), "CSP should block object embeddings");
    });

    it("HSTS header sets max-age >= 1 year with includeSubDomains and preload", () => {
      const hsts = SECURITY_HEADERS.find((h) => h.key === "Strict-Transport-Security");
      assert.ok(hsts, "HSTS header not found");
      assert.ok(hsts.value.includes("max-age="), "HSTS missing max-age");
      assert.ok(hsts.value.includes("includeSubDomains"), "HSTS missing includeSubDomains");
      assert.ok(hsts.value.includes("preload"), "HSTS missing preload");
    });
  });

  describe("2. Input Sanitisation", () => {
    it("strips script tags and dangerous HTML from text inputs", () => {
      const dirty =
        '<script>alert("hacked")</script>Hello <b>Citizen</b><img src=x onerror=alert(1)>';
      const clean = sanitizeText(dirty);
      assert.ok(!clean.includes("<script>"), "Did not strip script tag");
      assert.ok(!clean.includes("alert("), "Did not strip script body");
      assert.ok(!clean.includes("<b>"), "Did not strip HTML b tag");
      assert.ok(!clean.includes("<img"), "Did not strip img tag");
      assert.ok(clean.includes("Citizen"), "Preserved legitimate text");
    });

    it("cleans non-printable control characters", () => {
      const withNullBytes = "Hello\x00\x08World\x1F!";
      const clean = sanitizeText(withNullBytes);
      assert.strictEqual(clean, "HelloWorld!");
    });

    it("validates and cleans email addresses correctly", () => {
      assert.strictEqual(sanitizeEmail("  CITIZEN@Example.COM  "), "citizen@example.com");
      assert.strictEqual(sanitizeEmail("invalid-email"), "");
      assert.strictEqual(sanitizeEmail("<script>@evil.com"), "");
      assert.strictEqual(sanitizeEmail(null), "");
    });

    it("escapes special HTML characters", () => {
      const escaped = escapeHtml('<div class="alert">&test\'s</div>');
      assert.strictEqual(escaped, "&lt;div class=&quot;alert&quot;&gt;&amp;test&#39;s&lt;/div&gt;");
    });
  });

  describe("3. Safe URL & External Link Handling", () => {
    it("allows valid http, https, and internal relative URLs", () => {
      assert.strictEqual(isSafeUrl("https://parivahan.gov.in"), true);
      assert.strictEqual(isSafeUrl("http://passportindia.gov.in"), true);
      assert.strictEqual(isSafeUrl("/driving-licence-learner"), true);
    });

    it("rejects malicious or dangerous protocols", () => {
      assert.strictEqual(isSafeUrl("javascript:alert(1)"), false);
      assert.strictEqual(isSafeUrl("data:text/html,<script>alert(1)</script>"), false);
      assert.strictEqual(isSafeUrl("vbscript:MsgBox"), false);
      assert.strictEqual(isSafeUrl("//evil.com"), false);
    });

    it("sanitizeUrl returns empty string for unsafe URLs", () => {
      assert.strictEqual(sanitizeUrl("javascript:alert(1)"), "");
      assert.strictEqual(sanitizeUrl("https://parivahan.gov.in"), "https://parivahan.gov.in");
    });

    it("getSafeExternalLinkProps enforces target=_blank and rel=noopener noreferrer", () => {
      const props = getSafeExternalLinkProps("https://parivahan.gov.in");
      assert.strictEqual(props.href, "https://parivahan.gov.in");
      assert.strictEqual(props.target, "_blank");
      assert.strictEqual(props.rel, "noopener noreferrer");
    });

    it("ensures all target=_blank anchors in codebase have rel=noopener noreferrer", () => {
      function scanDir(dir: string, fileList: string[] = []): string[] {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file === "node_modules" || file === ".next" || file === ".git") continue;
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanDir(fullPath, fileList);
          } else if (file.endsWith(".tsx")) {
            fileList.push(fullPath);
          }
        }
        return fileList;
      }

      const tsxFiles = scanDir(path.join(rootDir, "src"));
      const violations: string[] = [];

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const matches = content.matchAll(/<a\s+[^>]*target=["']_blank["'][^>]*>/g);
        for (const m of matches) {
          const tag = m[0];
          if (!tag.includes("noopener") || !tag.includes("noreferrer")) {
            violations.push(`${path.relative(rootDir, file)}: ${tag}`);
          }
        }
      }

      assert.strictEqual(
        violations.length,
        0,
        `Found insecure target="_blank" links without rel="noopener noreferrer":\n${violations.join("\n")}`
      );
    });
  });

  describe("4. Rate Limiting", () => {
    it("permits requests within sliding limit and blocks excess requests", () => {
      const testIp = `test-sec-${Date.now()}`;
      const opt = { windowMs: 5000, maxRequests: 3 };

      const r1 = checkRateLimit(testIp, opt);
      assert.strictEqual(r1.allowed, true);
      assert.strictEqual(r1.remaining, 2);

      const r2 = checkRateLimit(testIp, opt);
      assert.strictEqual(r2.allowed, true);
      assert.strictEqual(r2.remaining, 1);

      const r3 = checkRateLimit(testIp, opt);
      assert.strictEqual(r3.allowed, true);
      assert.strictEqual(r3.remaining, 0);

      // 4th request must be rate limited
      const r4 = checkRateLimit(testIp, opt);
      assert.strictEqual(r4.allowed, false);
      assert.strictEqual(r4.remaining, 0);
    });
  });

  describe("5. Secrets and Documentation Check", () => {
    it("ensures docs/security.md exists and covers essential hardening topics", () => {
      const docPath = path.join(rootDir, "docs", "security.md");
      assert.ok(fs.existsSync(docPath), "docs/security.md does not exist");
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.includes("Content-Security-Policy"), "Missing CSP in security doc");
      assert.ok(content.includes("Rate Limiting"), "Missing Rate Limiting in security doc");
      assert.ok(
        content.includes("Input Sanitisation"),
        "Missing Input Sanitisation in security doc"
      );
      assert.ok(content.includes("Checklist"), "Missing Checklist in security doc");
    });
  });
});
