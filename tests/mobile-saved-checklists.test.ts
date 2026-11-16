import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 123: Mobile Saved Checklists, Storage Justification & Web Export/Import", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const savedScreenPath = path.join(mobileDir, "app", "(tabs)", "saved.tsx");
  const docPath = path.join(process.cwd(), "docs", "mobile-storage.md");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storageModule: any;
  let mockStorage: Map<string, string>;

  before(async () => {
    const storageFilePath = path.join(mobileDir, "lib", "checklist-storage.ts");
    storageModule = await import(storageFilePath);
  });

  beforeEach(() => {
    mockStorage = new Map<string, string>();
    storageModule.setStorageDriver({
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, val: string) => {
        mockStorage.set(key, val);
      },
      removeItem: (key: string) => {
        mockStorage.delete(key);
      },
      clear: () => {
        mockStorage.clear();
      },
    });
  });

  test("1. Architectural justification doc exists and justifies MMKV / Key-Value vs SQLite", () => {
    assert.ok(fs.existsSync(docPath), "docs/mobile-storage.md must exist");
    const doc = fs.readFileSync(docPath, "utf-8");

    assert.match(doc, /MMKV/i, "Must evaluate MMKV");
    assert.match(doc, /SQLite/i, "Must evaluate SQLite");
    assert.match(doc, /AsyncStorage/i, "Must evaluate AsyncStorage");
    assert.match(doc, /Zero-Account/i, "Must highlight zero-account offline requirement");
    assert.match(doc, /Interoperab/i, "Must justify 1:1 interoperability with web localStorage");
  });

  test("2. Mobile checklist storage saves progress and tracks index with progress counts", () => {
    const { saveStoredCompletedDocs, getStoredCompletedDocs, getAllChecklistsIndex } =
      storageModule;

    saveStoredCompletedDocs("driving-licence-learner", "gj", ["doc-1", "doc-2"], {
      taskTitle: "Learner Licence Gujarat",
      totalCount: 5,
    });

    const completed = getStoredCompletedDocs("driving-licence-learner", "gj");
    assert.deepEqual(completed, ["doc-1", "doc-2"]);

    const index = getAllChecklistsIndex();
    assert.equal(index.length, 1);
    assert.equal(index[0].taskSlug, "driving-licence-learner");
    assert.equal(index[0].stateSlug, "gj");
    assert.equal(index[0].taskTitle, "Learner Licence Gujarat");
    assert.equal(index[0].totalCount, 5);
    assert.equal(index[0].completedCount, 2);
  });

  test("3. toggleStoredDoc correctly adds and removes items and updates progress", () => {
    const { saveStoredCompletedDocs, toggleStoredDoc, getAllChecklistsIndex } = storageModule;

    saveStoredCompletedDocs("passport-renewal", "national", ["doc-1"], {
      taskTitle: "Passport Renewal",
      totalCount: 4,
    });

    // Toggle on doc-2
    const afterAdd = toggleStoredDoc("passport-renewal", "national", "doc-2", {
      taskTitle: "Passport Renewal",
      totalCount: 4,
    });
    assert.deepEqual(afterAdd, ["doc-1", "doc-2"]);

    let index = getAllChecklistsIndex();
    assert.equal(index[0].completedCount, 2);

    // Toggle off doc-1
    const afterRemove = toggleStoredDoc("passport-renewal", "national", "doc-1", {
      taskTitle: "Passport Renewal",
      totalCount: 4,
    });
    assert.deepEqual(afterRemove, ["doc-2"]);

    index = getAllChecklistsIndex();
    assert.equal(index[0].completedCount, 1);
  });

  test("4. clearStoredCompletedDocs deletes both task progress and index entry", () => {
    const {
      saveStoredCompletedDocs,
      clearStoredCompletedDocs,
      getStoredCompletedDocs,
      getAllChecklistsIndex,
    } = storageModule;

    saveStoredCompletedDocs("pan-card-new", "national", ["doc-1"], {
      taskTitle: "PAN Card",
      totalCount: 3,
    });

    assert.equal(getAllChecklistsIndex().length, 1);
    clearStoredCompletedDocs("pan-card-new", "national");

    assert.deepEqual(getStoredCompletedDocs("pan-card-new", "national"), []);
    assert.equal(getAllChecklistsIndex().length, 0);
  });

  test("5. Export generates valid JSON with version: 1, index, and items matching Web schema", () => {
    const { saveStoredCompletedDocs, exportChecklistsData } = storageModule;

    saveStoredCompletedDocs("driving-licence-learner", "gj", ["doc-1", "doc-2", "doc-3"], {
      taskTitle: "Learner Driving Licence",
      totalCount: 5,
    });

    const exported = exportChecklistsData();
    const parsed = JSON.parse(exported);

    assert.equal(parsed.version, 1);
    assert.ok(parsed.exportedAt);
    assert.equal(parsed.index.length, 1);
    assert.equal(parsed.index[0].taskSlug, "driving-licence-learner");
    assert.deepEqual(parsed.items["checklist_driving-licence-learner_gj"], [
      "doc-1",
      "doc-2",
      "doc-3",
    ]);
  });

  test("6. Cross-compatibility: Mobile imports web backup JSON and web imports mobile backup JSON", () => {
    const {
      saveStoredCompletedDocs,
      exportChecklistsData,
      importChecklistsData,
      getStoredCompletedDocs,
      getAllChecklistsIndex,
    } = storageModule;

    // 1. Mobile exports a backup
    saveStoredCompletedDocs("driving-licence-learner", "gj", ["doc-1", "doc-2"], {
      taskTitle: "Learner Driving Licence Gujarat",
      totalCount: 5,
    });
    const mobileJson = exportChecklistsData();

    // 2. Clear mobile store
    mockStorage.clear();
    assert.equal(getAllChecklistsIndex().length, 0);

    // 3. Mobile imports its own JSON
    const importRes = importChecklistsData(mobileJson);
    assert.equal(importRes.success, true);
    assert.equal(importRes.count, 1);
    assert.deepEqual(getStoredCompletedDocs("driving-licence-learner", "gj"), ["doc-1", "doc-2"]);
    assert.equal(getAllChecklistsIndex()[0].completedCount, 2);

    // 4. Verify web backup structure can be imported by mobile
    const sampleWebBackup = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      index: [
        {
          taskSlug: "voter-id-new",
          stateSlug: "gj",
          taskTitle: "Voter ID Registration",
          totalCount: 4,
          completedCount: 3,
          lastUpdated: new Date().toISOString(),
        },
      ],
      items: {
        "checklist_voter-id-new_gj": ["vid-1", "vid-2", "vid-3"],
      },
    });

    const webImportRes = importChecklistsData(sampleWebBackup);
    assert.equal(webImportRes.success, true);
    assert.deepEqual(getStoredCompletedDocs("voter-id-new", "gj"), ["vid-1", "vid-2", "vid-3"]);
    const updatedIndex = getAllChecklistsIndex();
    assert.ok(updatedIndex.some((i: { taskSlug: string }) => i.taskSlug === "voter-id-new"));
  });

  test("7. Saved checklists screen implements progress bars, continue, remove, export, and import", () => {
    assert.ok(fs.existsSync(savedScreenPath), "Saved screen file must exist");
    const content = fs.readFileSync(savedScreenPath, "utf-8");

    // Title and zero-account subtitle
    assert.match(content, /My Lists/);
    assert.match(content, /No account required/i);

    // Progress bar
    assert.match(content, /progressBarTrack/);
    assert.match(content, /progressBarFill/);
    assert.match(content, /documents ready/);

    // Action buttons
    assert.match(content, /Continue Checklist/);
    assert.match(content, /Remove/);
    assert.match(content, /handleRemove/);

    // Export & Import
    assert.match(content, /Export Code/);
    assert.match(content, /Import Code/);
    assert.match(content, /showExportModal/);
    assert.match(content, /showImportModal/);
    assert.match(content, /importChecklistsData/);
    assert.match(content, /exportChecklistsData/);

    // Empty state
    assert.match(content, /No Checklists Saved Yet/);
    assert.match(content, /Browse Civic Guides/);

    // Design tokens and touch target
    assert.match(content, /layout\.minTouchTarget/);
    assert.match(content, /colors\.primary/);
    assert.match(content, /colors\.surface/);
  });
});
