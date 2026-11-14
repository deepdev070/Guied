import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { resolveRedirect, SITE_REDIRECTS } from "../src/lib/redirects.ts";

describe("Prompt 80: URL Structure, Redirects & SEO Documentation", () => {
  describe("Canonical Redirects Table", () => {
    it("ensures all configured redirects are marked permanent: true (308)", () => {
      assert.ok(SITE_REDIRECTS.length > 0, "Redirects table must contain rules");
      for (const rule of SITE_REDIRECTS) {
        assert.equal(
          rule.permanent,
          true,
          `Redirect from ${rule.source} to ${rule.destination} must be permanent`
        );
      }
    });

    it("redirects common task typos and American English spellings (license -> licence)", () => {
      const res1 = resolveRedirect("/driving-license");
      assert.ok(res1);
      assert.equal(res1.destination, "/driving-licence-learner");

      const res2 = resolveRedirect("/driving-license-new");
      assert.ok(res2);
      assert.equal(res2.destination, "/driving-licence-new");

      const res3 = resolveRedirect("/passport");
      assert.ok(res3);
      assert.equal(res3.destination, "/passport-renewal");

      const res4 = resolveRedirect("/dl-learner");
      assert.ok(res4);
      assert.equal(res4.destination, "/driving-licence-learner");
    });

    it("redirects category aliases to canonical category slugs", () => {
      const res = resolveRedirect("/category/identity-documents");
      assert.ok(res);
      assert.equal(res.destination, "/category/identity");

      const res2 = resolveRedirect("/category/vehicle-services");
      assert.ok(res2);
      assert.equal(res2.destination, "/category/vehicles");
    });

    it("redirects 2-letter state code shortcuts for task pages", () => {
      const res1 = resolveRedirect("/passport-renewal/gj");
      assert.ok(res1);
      assert.equal(res1.destination, "/passport-renewal/gujarat");

      const res2 = resolveRedirect("/driving-licence-learner/mh");
      assert.ok(res2);
      assert.equal(res2.destination, "/driving-licence-learner/maharashtra");

      const res3 = resolveRedirect("/passport-renewal/dl");
      assert.ok(res3);
      assert.equal(res3.destination, "/passport-renewal/delhi");
    });

    it("redirects 2-letter state code shortcuts for state hubs", () => {
      const res = resolveRedirect("/state/gj");
      assert.ok(res);
      assert.equal(res.destination, "/state/gujarat");
    });

    it("returns null for canonical URLs that require no redirection", () => {
      assert.equal(resolveRedirect("/passport-renewal"), null);
      assert.equal(resolveRedirect("/driving-licence-learner"), null);
      assert.equal(resolveRedirect("/driving-licence-learner/gujarat"), null);
      assert.equal(resolveRedirect("/category/vehicles"), null);
      assert.equal(resolveRedirect("/state/gujarat"), null);
    });
  });

  describe("Next Config Configuration", () => {
    it("verifies trailingSlash: false is configured in next.config.ts", () => {
      const configPath = path.join(process.cwd(), "next.config.ts");
      const content = fs.readFileSync(configPath, "utf-8");
      assert.ok(
        content.includes("trailingSlash: false"),
        "next.config.ts must configure trailingSlash: false"
      );
      assert.ok(content.includes("redirects"), "next.config.ts must configure redirects");
    });
  });

  describe("SEO Documentation (docs/seo.md)", () => {
    it("verifies docs/seo.md exists and documents all URL and redirect rules", () => {
      const docPath = path.join(process.cwd(), "docs/seo.md");
      assert.ok(fs.existsSync(docPath), "docs/seo.md must exist");
      const docContent = fs.readFileSync(docPath, "utf-8");

      assert.ok(docContent.includes("kebab-case") || docContent.includes("Kebab-Case"));
      assert.ok(docContent.includes("trailingSlash: false"));
      assert.ok(docContent.includes("/passport-renewal"));
      assert.ok(docContent.includes("/category/identity"));
      assert.ok(docContent.includes("noindex"));
      assert.ok(docContent.includes("hreflang"));
      assert.ok(docContent.includes("JSON-LD"));
    });
  });
});
