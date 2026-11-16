import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 112: Service Worker and Offline Navigation", () => {
  const swPath = path.join(process.cwd(), "public", "sw.js");
  const offlinePagePath = path.join(process.cwd(), "src", "app", "offline", "page.tsx");
  const registerComponentPath = path.join(
    process.cwd(),
    "src",
    "components",
    "pwa",
    "ServiceWorkerRegister.tsx"
  );
  const docPath = path.join(process.cwd(), "docs", "pwa-service-worker.md");

  test("1. Service Worker file exists in public/sw.js", () => {
    assert.ok(fs.existsSync(swPath), "public/sw.js must exist");
    const content = fs.readFileSync(swPath, "utf-8");
    assert.match(content, /CACHE_VERSION/, "Must define a CACHE_VERSION");
    assert.match(content, /STATIC_CACHE/, "Must declare STATIC_CACHE");
    assert.match(content, /DYNAMIC_CACHE/, "Must declare DYNAMIC_CACHE");
  });

  test("2. App Shell precaching includes key offline routes and assets", () => {
    const content = fs.readFileSync(swPath, "utf-8");
    assert.match(content, /['"]\/offline['"]/, "Must precache /offline");
    assert.match(content, /['"]\/my-checklists['"]/, "Must precache /my-checklists");
    assert.match(content, /['"]\/manifest\.webmanifest['"]/, "Must precache manifest");
    assert.match(content, /['"]\/icons\/icon-192\.png['"]/, "Must precache standard icon");
  });

  test("3. Security Rule: Strictly excludes admin and write API routes from cache", () => {
    const content = fs.readFileSync(swPath, "utf-8");

    // Must check method !== 'GET'
    assert.match(
      content,
      /request\.method\s*!==\s*['"]GET['"]/,
      "Must bypass cache for non-GET requests"
    );

    // Must check for admin and api/admin patterns
    assert.match(content, /admin/, "Must explicitly exclude admin routes");
    assert.ok(
      content.includes("/api/admin") || content.includes("\\/api\\/admin"),
      "Must explicitly exclude /api/admin routes"
    );
  });

  test("4. Stale-While-Revalidate and /offline fallback on network error", () => {
    const content = fs.readFileSync(swPath, "utf-8");

    assert.match(
      content,
      /request\.mode\s*===\s*['"]navigate['"]/,
      "Must handle HTML navigation requests"
    );
    assert.match(
      content,
      /caches\.match\(['"]\/offline['"]\)/,
      "Must fallback to /offline when network fails and no cached page exists"
    );
  });

  test("5. Friendly /offline civic page exists with clear guidance", () => {
    assert.ok(fs.existsSync(offlinePagePath), "src/app/offline/page.tsx must exist");
    const content = fs.readFileSync(offlinePagePath, "utf-8");

    // Check Class 8 plain language and accessibility
    assert.match(content, /You are currently offline/i, "Must have friendly heading");
    assert.match(content, /\/my-checklists/, "Must provide link to saved checklists");
    assert.match(content, /Helpful tips while offline/i, "Must give civic guidance");
    assert.match(content, /robots:\s*\{\s*index:\s*false/i, "Must have noindex for offline page");
  });

  test("6. ServiceWorkerRegister client component is hooked into layout", () => {
    assert.ok(fs.existsSync(registerComponentPath), "ServiceWorkerRegister component must exist");
    const layoutPath = path.join(process.cwd(), "src", "app", "layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    assert.match(
      layoutContent,
      /<ServiceWorkerRegister\s*\/>/,
      "Root layout must mount ServiceWorkerRegister"
    );
  });

  test("7. Architectural justification document exists", () => {
    assert.ok(fs.existsSync(docPath), "docs/pwa-service-worker.md must exist");
    const docContent = fs.readFileSync(docPath, "utf-8");
    assert.match(docContent, /next-pwa/i, "Must evaluate next-pwa");
    assert.match(docContent, /Turbopack/i, "Must explain Turbopack incompatibility with next-pwa");
    assert.match(docContent, /Stale-While-Revalidate/i, "Must justify SWR strategy");
  });
});
