import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  saveStoredCompletedDocs,
  getStoredCompletedDocs,
  clearStoredCompletedDocs,
  getAllChecklistsIndex,
} from "../src/lib/checklist-storage.ts";

// Mock localStorage for test environment
class MockLocalStorage {
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

describe("Prompt 114: Offline Checklists & Zero-Sync Verification", () => {
  const indicatorPath = path.join(
    process.cwd(),
    "src",
    "components",
    "pwa",
    "OfflineIndicator.tsx"
  );
  const docSectionPath = path.join(
    process.cwd(),
    "src",
    "components",
    "task",
    "DocumentSection.tsx"
  );
  const myChecklistsPath = path.join(process.cwd(), "src", "app", "my-checklists", "page.tsx");
  const e2eSpecPath = path.join(process.cwd(), "e2e", "offline-checklist.spec.ts");
  const storageLibPath = path.join(process.cwd(), "src", "lib", "checklist-storage.ts");

  test("1. OfflineIndicator component exists with required indicator copy", () => {
    assert.ok(fs.existsSync(indicatorPath), "OfflineIndicator.tsx must exist");
    const content = fs.readFileSync(indicatorPath, "utf-8");
    assert.match(
      content,
      /Offline - your progress is saved on this device/,
      "Must display exact required indicator copy"
    );
    assert.match(content, /useOnlineStatus/, "Must export useOnlineStatus hook");
    assert.match(content, /role=["']status["']/, "Must have accessible role status");
  });

  test("2. Zero Server Sync Invariant: checklist storage communicates only with localStorage", () => {
    const storageContent = fs.readFileSync(storageLibPath, "utf-8");

    // Must NOT call fetch or send data to server
    assert.equal(
      storageContent.includes("fetch("),
      false,
      "checklist-storage must NEVER invoke fetch"
    );
    assert.equal(
      storageContent.includes("/api/sync"),
      false,
      "checklist-storage must NEVER call sync endpoint"
    );
    assert.equal(
      storageContent.includes("XMLHttpRequest"),
      false,
      "checklist-storage must NEVER use XMLHttpRequest"
    );
  });

  test("3. Offline persistence operates completely in local storage", () => {
    // Setup clean mock storage
    const mockStorage = new MockLocalStorage();
    (global as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;
    (global as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: () => true,
    };

    const task = "driving-licence-learner";
    const state = "gujarat";
    const docs = ["aadhaar_card", "form_1a", "proof_of_address"];

    // Save offline
    saveStoredCompletedDocs(task, state, docs, {
      taskTitle: "Learner Licence",
      totalCount: 5,
    });

    // Retrieve offline
    const saved = getStoredCompletedDocs(task, state);
    assert.deepEqual(saved, docs, "Saved documents must match exactly");

    // Index reflects offline state
    const index = getAllChecklistsIndex();
    const entry = index.find((i) => i.taskSlug === task && i.stateSlug === state);
    assert.ok(entry, "Checklist entry must be indexed locally");
    assert.equal(entry?.completedCount, 3);
    assert.equal(entry?.totalCount, 5);

    // Cleanup
    clearStoredCompletedDocs(task, state);
    assert.deepEqual(getStoredCompletedDocs(task, state), []);
  });

  test("4. OfflineIndicator is mounted in DocumentSection and MyChecklistsPage", () => {
    const docContent = fs.readFileSync(docSectionPath, "utf-8");
    assert.match(docContent, /<OfflineIndicator\b/, "DocumentSection must render OfflineIndicator");

    const checklistsContent = fs.readFileSync(myChecklistsPath, "utf-8");
    assert.match(
      checklistsContent,
      /<OfflineIndicator\b/,
      "MyChecklistsPage must render OfflineIndicator"
    );
  });

  test("5. Playwright e2e test with network disabled exists", () => {
    assert.ok(fs.existsSync(e2eSpecPath), "e2e/offline-checklist.spec.ts must exist");
    const e2eContent = fs.readFileSync(e2eSpecPath, "utf-8");
    assert.match(
      e2eContent,
      /context\.setOffline\(true\)/,
      "E2E test must disable network using context.setOffline(true)"
    );
    assert.match(
      e2eContent,
      /Offline - your progress is saved on this device/,
      "E2E test must assert offline indicator message"
    );
    assert.match(
      e2eContent,
      /expect\(serverSyncRequests\)\.toEqual\(\[\]\)/,
      "E2E test must verify zero server sync requests"
    );
  });
});
