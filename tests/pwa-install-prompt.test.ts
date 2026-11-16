import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  isInstallPromptDismissed,
  dismissInstallPrompt,
  resetInstallPromptDismissal,
  INSTALL_DISMISSAL_KEY,
  DISMISSAL_PERIOD_DAYS,
} from "../src/lib/pwa/install-prompt.ts";

// Mock localStorage for node test runner
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe("Prompt 113: Gentle Install Prompt Card UI & 30-day Dismissal", () => {
  const componentPath = path.join(process.cwd(), "src", "components", "pwa", "InstallAppCard.tsx");
  const docSectionPath = path.join(
    process.cwd(),
    "src",
    "components",
    "task",
    "DocumentSection.tsx"
  );
  const myChecklistsPath = path.join(process.cwd(), "src", "app", "my-checklists", "page.tsx");

  beforeEach(() => {
    // Inject mock localStorage into global
    (global as unknown as { localStorage: LocalStorageMock }).localStorage = new LocalStorageMock();
    (global as unknown as { window: unknown }).window = {
      localStorage: (global as unknown as { localStorage: LocalStorageMock }).localStorage,
    };
  });

  test("1. Component and exports exist", () => {
    assert.ok(fs.existsSync(componentPath), "InstallAppCard.tsx must exist");
    assert.equal(DISMISSAL_PERIOD_DAYS, 30, "Dismissal period must be configured for 30 days");
    assert.equal(
      INSTALL_DISMISSAL_KEY,
      "civic_install_dismissed_until",
      "Dismissal storage key must match convention"
    );
  });

  test("2. 30-day dismissal remembers choice in localStorage", () => {
    // Initially not dismissed
    assert.equal(isInstallPromptDismissed(), false);

    // Call dismiss
    const now = Date.now();
    dismissInstallPrompt();

    // Now should be dismissed
    assert.equal(isInstallPromptDismissed(), true);

    const raw = global.localStorage.getItem(INSTALL_DISMISSAL_KEY);
    assert.ok(raw, "Storage key must be present");
    const expiry = parseInt(raw, 10);
    const expectedExpiry = now + 30 * 24 * 60 * 60 * 1000;

    // Tolerance of 1000ms
    assert.ok(
      Math.abs(expiry - expectedExpiry) < 1000,
      "Expiry timestamp must be ~30 days in the future"
    );

    // Reset dismissal
    resetInstallPromptDismissal();
    assert.equal(isInstallPromptDismissed(), false);
  });

  test("3. Expired dismissal returns false", () => {
    // Set timestamp in the past
    const past = Date.now() - 1000;
    global.localStorage.setItem(INSTALL_DISMISSAL_KEY, past.toString());
    assert.equal(isInstallPromptDismissed(), false, "Expired timestamp must return false");
  });

  test("4. Source code contains Android beforeinstallprompt support", () => {
    const content = fs.readFileSync(componentPath, "utf-8");
    assert.match(content, /beforeinstallprompt/, "Must listen for beforeinstallprompt event");
    assert.match(content, /deferredPrompt\.prompt\(\)/, "Must call prompt() on deferred event");
    assert.match(content, /Install App/i, "Must offer an Install App button");
  });

  test("5. Source code contains iOS Safari instructions", () => {
    const content = fs.readFileSync(componentPath, "utf-8");
    assert.match(content, /iphone|ipad|ipod/i, "Must detect iOS devices");
    assert.match(content, /Share/i, "Must instruct user to tap Share button");
    assert.match(content, /Add to Home Screen/i, "Must instruct user to choose Add to Home Screen");
  });

  test("6. Gentle, non-intrusive card layout (not a popup modal)", () => {
    const content = fs.readFileSync(componentPath, "utf-8");
    assert.match(
      content,
      /<aside\b/,
      "Must render as a semantic aside region, not a blocking modal dialog"
    );
    assert.match(content, /Not now/i, "Must provide a gentle 'Not now' dismissal button");
    assert.match(
      content,
      /aria-label=["']Install App Recommendation["']/,
      "Must have accessible region label"
    );
  });

  test("7. Integrated into DocumentSection and MyChecklistsPage", () => {
    const docContent = fs.readFileSync(docSectionPath, "utf-8");
    assert.match(
      docContent,
      /<InstallAppCard\b/,
      "DocumentSection must integrate InstallAppCard after checklist complete"
    );

    const checklistsContent = fs.readFileSync(myChecklistsPath, "utf-8");
    assert.match(
      checklistsContent,
      /<InstallAppCard\b/,
      "MyChecklistsPage must integrate InstallAppCard for active checklists"
    );
  });
});
