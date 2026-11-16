import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import manifest from "../src/app/manifest.ts";

describe("Prompt 111: Web Manifest, PWA Icons & iOS Meta Tags", () => {
  it("1. Web Manifest File: verifies public/manifest.webmanifest configuration", () => {
    const manifestPath = path.join(process.cwd(), "public", "manifest.webmanifest");
    assert.ok(fs.existsSync(manifestPath), "public/manifest.webmanifest must exist");

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const json = JSON.parse(raw);

    assert.strictEqual(json.name, "India Paperwork Guide");
    assert.strictEqual(json.short_name, "Paperwork");
    assert.strictEqual(json.theme_color, "#2563EB");
    assert.strictEqual(json.background_color, "#FFFFFF");
    assert.strictEqual(json.display, "standalone");
    assert.strictEqual(json.start_url, "/?source=pwa");
  });

  it("2. App Manifest Route: verifies typed MetadataRoute.Manifest export", () => {
    const appManifest = manifest();
    assert.strictEqual(appManifest.name, "India Paperwork Guide");
    assert.strictEqual(appManifest.short_name, "Paperwork");
    assert.strictEqual(appManifest.theme_color, "#2563EB");
    assert.strictEqual(appManifest.background_color, "#FFFFFF");
    assert.strictEqual(appManifest.display, "standalone");
    assert.strictEqual(appManifest.start_url, "/?source=pwa");
    assert.ok(Array.isArray(appManifest.icons), "Icons array must be present");
  });

  it("3. Maskable and Standard Icons in Manifest: declares 192, 512, and 1024 sizes", () => {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public", "manifest.webmanifest"),
      "utf-8"
    );
    const json = JSON.parse(raw);

    const sizes = ["192x192", "512x512", "1024x1024"];
    for (const size of sizes) {
      const stdIcon = json.icons.find(
        (i: { sizes: string; purpose?: string }) =>
          i.sizes === size && (!i.purpose || i.purpose === "any")
      );
      const maskIcon = json.icons.find(
        (i: { sizes: string; purpose?: string }) => i.sizes === size && i.purpose === "maskable"
      );

      assert.ok(stdIcon, `Must declare standard icon for size ${size}`);
      assert.ok(maskIcon, `Must declare maskable icon for size ${size}`);
    }
  });

  it("4. Generated Icon Files on Disk: verifies actual pixel dimensions and PNG headers", async () => {
    const iconsDir = path.join(process.cwd(), "public", "icons");
    const expected = [
      { file: "icon-192.png", width: 192, height: 192 },
      { file: "icon-192-maskable.png", width: 192, height: 192 },
      { file: "icon-512.png", width: 512, height: 512 },
      { file: "icon-512-maskable.png", width: 512, height: 512 },
      { file: "icon-1024.png", width: 1024, height: 1024 },
      { file: "icon-1024-maskable.png", width: 1024, height: 1024 },
      { file: "apple-touch-icon.png", width: 180, height: 180 },
    ];

    for (const item of expected) {
      const filePath = path.join(iconsDir, item.file);
      assert.ok(fs.existsSync(filePath), `Icon file ${item.file} must exist on disk`);

      const metadata = await sharp(filePath).metadata();
      assert.strictEqual(metadata.width, item.width, `${item.file} width should be ${item.width}`);
      assert.strictEqual(
        metadata.height,
        item.height,
        `${item.file} height should be ${item.height}`
      );
      assert.strictEqual(metadata.format, "png", `${item.file} must be PNG format`);
    }

    assert.ok(fs.existsSync(path.join(iconsDir, "icon.svg")), "icon.svg must exist");
    assert.ok(
      fs.existsSync(path.join(iconsDir, "icon-maskable.svg")),
      "icon-maskable.svg must exist"
    );
  });

  it("5. iOS Home Screen Integration: verifies apple-touch-icon and meta tags in layout.tsx", () => {
    const layoutPath = path.join(process.cwd(), "src", "app", "layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(
      layoutContent.includes('rel="apple-touch-icon"'),
      "layout.tsx must contain rel='apple-touch-icon'"
    );
    assert.ok(
      layoutContent.includes('name="apple-mobile-web-app-capable"'),
      "layout.tsx must contain apple-mobile-web-app-capable"
    );
    assert.ok(
      layoutContent.includes('name="apple-mobile-web-app-status-bar-style"'),
      "layout.tsx must contain apple-mobile-web-app-status-bar-style"
    );
    assert.ok(
      layoutContent.includes('name="apple-mobile-web-app-title"'),
      "layout.tsx must contain apple-mobile-web-app-title"
    );
  });
});
