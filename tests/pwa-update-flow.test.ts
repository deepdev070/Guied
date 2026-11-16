import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "../src/lib/site.ts";

describe("Prompt 115: Service Worker Update Flow and Support Version Label", () => {
  const toastPath = path.join(
    process.cwd(),
    "src",
    "components",
    "pwa",
    "UpdateAvailableToast.tsx"
  );
  const footerPath = path.join(process.cwd(), "src", "components", "layout", "Footer.tsx");
  const swPath = path.join(process.cwd(), "public", "sw.js");
  const layoutPath = path.join(process.cwd(), "src", "app", "layout.tsx");

  test("1. UpdateAvailableToast component exists with required UI copy", () => {
    assert.ok(fs.existsSync(toastPath), "UpdateAvailableToast.tsx must exist");
    const content = fs.readFileSync(toastPath, "utf-8");
    assert.match(content, /New version available/i, "Toast must display 'New version available'");
    assert.match(content, /Refresh/i, "Toast must have a 'Refresh' action button");
    assert.match(
      content,
      /sw-update-available/,
      "Toast must listen for 'sw-update-available' event"
    );
  });

  test("2. Update flow triggers SKIP_WAITING to activate new service worker", () => {
    const toastContent = fs.readFileSync(toastPath, "utf-8");
    assert.match(
      toastContent,
      /postMessage\(\s*\{\s*type:\s*['"]SKIP_WAITING['"]\s*\}\s*\)/,
      "Toast must postMessage SKIP_WAITING to waiting worker"
    );

    const swContent = fs.readFileSync(swPath, "utf-8");
    assert.match(swContent, /SKIP_WAITING/, "Service worker must handle SKIP_WAITING message");
    assert.match(
      swContent,
      /self\.skipWaiting\(\)/,
      "Service worker must call self.skipWaiting() upon SKIP_WAITING message"
    );
  });

  test("3. Version label exists in siteConfig and is rendered in the footer", () => {
    // Check siteConfig.version
    assert.ok(siteConfig.version, "siteConfig must specify a version property");
    assert.match(siteConfig.version, /^\d+\.\d+\.\d+/, "Version must follow semver format");

    // Check Footer.tsx
    const footerContent = fs.readFileSync(footerPath, "utf-8");
    assert.match(footerContent, /siteConfig\.version/, "Footer must render siteConfig.version");
    assert.match(
      footerContent,
      /Application [Vv]ersion/i,
      "Footer version label must have accessible support label/title"
    );
  });

  test("4. UpdateAvailableToast is mounted in RootLayout", () => {
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    assert.match(
      layoutContent,
      /<UpdateAvailableToast\s*\/>/,
      "Root layout must mount UpdateAvailableToast"
    );
  });
});
