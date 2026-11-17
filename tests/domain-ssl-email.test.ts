import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../src/lib/site.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 137: Domain, SSL, Business Email, and Search Console Verification", () => {
  const docPath = path.join(rootDir, "docs", "domain-ssl-email.md");

  describe("1. Documentation Coverage (docs/domain-ssl-email.md)", () => {
    it("ensures docs/domain-ssl-email.md exists", () => {
      assert.ok(fs.existsSync(docPath), "docs/domain-ssl-email.md must exist");
    });

    it("covers domain purchasing guidelines for indiapaperwork.in", () => {
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.includes("indiapaperwork.in"), "Must document indiapaperwork.in domain");
      assert.ok(
        content.includes("Cloudflare Registrar") || content.includes("Namecheap"),
        "Must recommend accredited registrars"
      );
    });

    it("specifies exact Vercel DNS records (A and CNAME)", () => {
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.includes("76.76.21.21"), "Must specify Vercel A record 76.76.21.21");
      assert.ok(
        content.includes("cname.vercel-dns.com"),
        "Must specify Vercel CNAME record cname.vercel-dns.com"
      );
    });

    it("details www to non-www 308 permanent redirect and SSL", () => {
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.includes("308 Permanent Redirect"), "Must specify 308 redirect");
      assert.ok(
        content.includes("Let's Encrypt") || content.includes("SSL"),
        "Must cover SSL certificates"
      );
      assert.ok(content.includes("Strict-Transport-Security"), "Must reference HSTS security");
    });

    it("details free business email alias for contact@ with MX, SPF and DMARC", () => {
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(
        content.includes("contact@indiapaperwork.in"),
        "Must document contact@indiapaperwork.in alias"
      );
      assert.ok(content.includes("Cloudflare Email Routing"), "Must recommend free email routing");
      assert.ok(content.includes("v=spf1"), "Must include SPF record");
      assert.ok(content.includes("v=DMARC1"), "Must include DMARC record");
      assert.ok(content.includes("mx.cloudflare.net"), "Must include MX server details");
    });

    it("details Google Search Console & Bing Webmaster Tools verification", () => {
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.includes("Google Search Console"), "Must document Google Search Console");
      assert.ok(content.includes("google-site-verification"), "Must specify DNS TXT verification");
      assert.ok(content.includes("sitemap.xml"), "Must document sitemap submission");
      assert.ok(content.includes("Bing Webmaster"), "Must document Bing Webmaster Tools");
    });
  });

  describe("2. Application Configuration Alignment", () => {
    it("siteConfig contactEmail is set to contact@indiapaperwork.in", () => {
      assert.strictEqual(
        siteConfig.contactEmail,
        "contact@indiapaperwork.in",
        "siteConfig.contactEmail should match official domain alias"
      );
    });

    it("sitemap route generator exists in src/app/sitemap.ts", () => {
      const sitemapFile = path.join(rootDir, "src", "app", "sitemap.ts");
      assert.ok(fs.existsSync(sitemapFile), "src/app/sitemap.ts must exist");
    });
  });
});
