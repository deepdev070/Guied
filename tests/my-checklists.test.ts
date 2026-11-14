import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  saveStoredCompletedDocs,
  getStoredCompletedDocs,
  clearStoredCompletedDocs,
  getAllChecklistsIndex,
  exportChecklistsData,
  importChecklistsData,
} from "../src/lib/checklist-storage.ts";

// In-memory localStorage mock for Node test environment
class MockLocalStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe("Prompt 66: My Checklists Dashboard & Data Export/Import", () => {
  beforeEach(() => {
    (globalThis as unknown as { localStorage: Storage }).localStorage = new MockLocalStorage();
  });

  it("exports checklists and individual document items as portable JSON", () => {
    // 1. Setup sample checklists
    saveStoredCompletedDocs("driving-licence-learner", "gujarat", ["doc-1", "doc-2"], {
      taskTitle: "Learner's Licence (LLR)",
      totalCount: 4,
    });
    saveStoredCompletedDocs("passport-renewal", "national", ["p-1", "p-2", "p-3"], {
      taskTitle: "Passport Renewal",
      totalCount: 5,
    });

    const exportedString = exportChecklistsData();
    assert.ok(typeof exportedString === "string", "Export must return a string");

    const parsed = JSON.parse(exportedString);
    assert.strictEqual(parsed.version, 1, "Must have format version 1");
    assert.ok(parsed.exportedAt, "Must have export timestamp");
    assert.strictEqual(parsed.index.length, 2, "Index must contain 2 entries");
    assert.deepStrictEqual(parsed.items["checklist_driving-licence-learner_gujarat"], [
      "doc-1",
      "doc-2",
    ]);
  });

  it("imports and merges checklist backup data into fresh localStorage", () => {
    const backupJson = JSON.stringify({
      version: 1,
      exportedAt: "2026-11-14T10:00:00.000Z",
      index: [
        {
          taskSlug: "pan-card-new",
          stateSlug: "national",
          taskTitle: "New PAN Card (Instant e-PAN)",
          totalCount: 3,
          completedCount: 2,
          lastUpdated: "2026-11-14T09:30:00.000Z",
        },
      ],
      items: {
        "checklist_pan-card-new_national": ["pan-doc-1", "pan-doc-2"],
      },
    });

    const result = importChecklistsData(backupJson);
    assert.strictEqual(result.success, true, "Import must succeed");
    assert.ok(result.count >= 1, "Import count must be at least 1");

    // Verify restored items
    const restoredDocs = getStoredCompletedDocs("pan-card-new", "national");
    assert.deepStrictEqual(restoredDocs, ["pan-doc-1", "pan-doc-2"]);

    // Verify index updated
    const index = getAllChecklistsIndex();
    assert.strictEqual(index.length, 1);
    assert.strictEqual(index[0]?.taskSlug, "pan-card-new");
  });

  it("fails gracefully when importing invalid or corrupted JSON", () => {
    const invalidResult = importChecklistsData("NOT VALID JSON {{@@");
    assert.strictEqual(invalidResult.success, false);
    assert.ok(invalidResult.error?.includes("Failed to parse"));

    const emptyObjResult = importChecklistsData("42");
    assert.strictEqual(emptyObjResult.success, false);
  });

  it("removes checklist from index and storage when remove action is invoked", () => {
    saveStoredCompletedDocs("vehicle-rc-transfer", "gujarat", ["rc-1"], {
      taskTitle: "Vehicle RC Transfer",
      totalCount: 6,
    });

    assert.strictEqual(getAllChecklistsIndex().length, 1);

    clearStoredCompletedDocs("vehicle-rc-transfer", "gujarat");

    assert.strictEqual(getAllChecklistsIndex().length, 0);
    assert.deepStrictEqual(getStoredCompletedDocs("vehicle-rc-transfer", "gujarat"), []);
  });

  it("verifies /my-checklists page source implements all required UI elements", () => {
    const pagePath = path.join(process.cwd(), "src/app/my-checklists/page.tsx");
    assert.ok(fs.existsSync(pagePath), "Page file /my-checklists/page.tsx must exist");

    const content = fs.readFileSync(pagePath, "utf-8");
    assert.ok(content.includes("My Active Checklists"), "Must render page title");
    assert.ok(content.includes("Continue"), "Must render 'Continue' action button");
    assert.ok(content.includes("Remove"), "Must render 'Remove' action");
    assert.ok(content.includes("Export Backup"), "Must render 'Export Backup' action");
    assert.ok(content.includes("Import"), "Must render 'Import' action");
    assert.ok(
      content.includes("ProgressRing") || content.includes("progress"),
      "Must render progress indicator"
    );
  });
});
