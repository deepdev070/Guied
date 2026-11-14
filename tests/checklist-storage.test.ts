import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getChecklistStorageKey,
  getStoredCompletedDocs,
  saveStoredCompletedDocs,
  clearStoredCompletedDocs,
  getAllChecklistsIndex,
} from "../src/lib/checklist-storage.ts";

describe("Checklist Storage & Progress Engine", () => {
  beforeEach(() => {
    // Mock browser localStorage in Node test runner
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    };
  });

  it("generates separate keys per task and state variant", () => {
    const nationalKey = getChecklistStorageKey("driving-licence-new");
    assert.strictEqual(nationalKey, "checklist_driving-licence-new_national");

    const gujaratKey = getChecklistStorageKey("driving-licence-new", "gujarat");
    assert.strictEqual(gujaratKey, "checklist_driving-licence-new_gujarat");

    const maharashtraKey = getChecklistStorageKey("passport-renewal", "maharashtra");
    assert.strictEqual(maharashtraKey, "checklist_passport-renewal_maharashtra");
  });

  it("stores and retrieves checked off documents in localStorage", () => {
    const taskSlug = "passport-renewal";
    const stateSlug = "gujarat";

    assert.deepStrictEqual(getStoredCompletedDocs(taskSlug, stateSlug), []);

    const checkedDocs = ["doc_aadhaar", "doc_photo_spec", "doc_old_passport"];
    saveStoredCompletedDocs(taskSlug, stateSlug, checkedDocs, {
      taskTitle: "Passport Renewal",
      totalCount: 5,
    });

    const retrieved = getStoredCompletedDocs(taskSlug, stateSlug);
    assert.deepStrictEqual(retrieved, checkedDocs);
    assert.strictEqual(retrieved.length, 3);
  });

  it("updates global checklists index for the My Checklists dashboard", () => {
    saveStoredCompletedDocs("driving-licence-new", "gujarat", ["doc1", "doc2"], {
      taskTitle: "New Driving Licence",
      totalCount: 6,
    });

    const index = getAllChecklistsIndex();
    assert.ok(index.length >= 1, "Should record in global index");

    const entry = index.find((i) => i.taskSlug === "driving-licence-new");
    assert.ok(entry);
    assert.strictEqual(entry.completedCount, 2);
    assert.strictEqual(entry.totalCount, 6);
  });

  it("resets and clears completed documents on confirmation", () => {
    const taskSlug = "driving-licence-learner";
    const stateSlug = "gujarat";

    saveStoredCompletedDocs(taskSlug, stateSlug, ["form1", "form1a"], {
      taskTitle: "Learner's Licence",
      totalCount: 4,
    });

    assert.strictEqual(getStoredCompletedDocs(taskSlug, stateSlug).length, 2);

    clearStoredCompletedDocs(taskSlug, stateSlug);
    assert.strictEqual(getStoredCompletedDocs(taskSlug, stateSlug).length, 0);

    const index = getAllChecklistsIndex();
    const entry = index.find((i) => i.taskSlug === taskSlug && i.stateSlug === stateSlug);
    assert.strictEqual(entry, undefined);
  });
});
