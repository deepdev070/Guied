import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  saveStoredCompletedDocs,
  getStoredCompletedDocs,
  checkRulesChanged,
  markRulesAcknowledged,
  getChecklistEntry,
  clearStoredCompletedDocs,
  getAllChecklistsIndex,
} from "../src/lib/checklist-storage.ts";
import { getTaskChangelog, TASK_CHANGELOGS } from "../src/data/task-changelogs.ts";

test("PROMPT 145: Email-Free 'Remind Me' Retention & Rules Changed Tracking", async (t) => {
  // Mock localStorage for Node test runner
  const storageMap = new Map<string, string>();
  const mockStorage: Storage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storageMap.set(key, String(value));
    },
    removeItem: (key: string) => {
      storageMap.delete(key);
    },
    clear: () => {
      storageMap.clear();
    },
    key: (index: number) => Array.from(storageMap.keys())[index] ?? null,
    get length() {
      return storageMap.size;
    },
  };

  (globalThis as any).localStorage = mockStorage;

  t.afterEach(() => {
    storageMap.clear();
  });

  await t.test(
    "1. checkRulesChanged detects when current guide version is newer than saved version",
    () => {
      // Save progress with an older version
      const olderVersion = "2026-08-01T00:00:00.000Z";
      saveStoredCompletedDocs(
        "driving-licence-learner",
        "national",
        ["doc_age_01", "doc_addr_02"],
        {
          taskTitle: "Learner's Licence Application",
          totalCount: 5,
          currentVersion: olderVersion,
        }
      );

      const initialEntry = getChecklistEntry("driving-licence-learner", "national");
      assert.ok(initialEntry);
      assert.equal(initialEntry?.savedVersion, olderVersion);
      assert.equal(initialEntry?.rulesChanged, false);

      // Live version is updated in November 2026
      const liveNewerVersion = "2026-11-14T00:00:00.000Z";
      const hasChanged = checkRulesChanged("driving-licence-learner", liveNewerVersion, "national");

      assert.equal(hasChanged, true, "Must flag rulesChanged when live version > saved version");

      const updatedEntry = getChecklistEntry("driving-licence-learner", "national");
      assert.equal(updatedEntry?.rulesChanged, true);
    }
  );

  await t.test("2. checkRulesChanged returns false when versions are identical", () => {
    const currentVersion = "2026-11-14T00:00:00.000Z";
    saveStoredCompletedDocs("passport-renewal", "national", ["doc_pass_01"], {
      taskTitle: "Passport Renewal",
      totalCount: 6,
      currentVersion,
    });

    const hasChanged = checkRulesChanged("passport-renewal", currentVersion, "national");

    assert.equal(hasChanged, false, "Must return false when versions match");
  });

  await t.test("3. markRulesAcknowledged updates savedVersion and clears rulesChanged flag", () => {
    const olderVersion = "2026-06-01T00:00:00.000Z";
    const liveVersion = "2026-11-14T00:00:00.000Z";

    saveStoredCompletedDocs("driving-licence-new", "national", ["doc_01"], {
      taskTitle: "Permanent DL",
      totalCount: 6,
      currentVersion: olderVersion,
    });

    checkRulesChanged("driving-licence-new", liveVersion, "national");
    assert.equal(getChecklistEntry("driving-licence-new", "national")?.rulesChanged, true);

    // Citizen reviews what changed and clicks Dismiss / Acknowledge
    markRulesAcknowledged("driving-licence-new", liveVersion, "national");

    const acknowledgedEntry = getChecklistEntry("driving-licence-new", "national");
    assert.equal(acknowledgedEntry?.savedVersion, liveVersion);
    assert.equal(acknowledgedEntry?.rulesChanged, false);
  });

  await t.test("4. getTaskChangelog returns structured official updates with sources", () => {
    const changelog = getTaskChangelog("driving-licence-learner");
    assert.ok(changelog.length >= 3, "Learner licence must have at least 3 changelog entries");

    for (const item of changelog) {
      assert.ok(item.id, "Must have item id");
      assert.ok(item.date, "Must have item date");
      assert.ok(item.changeTypeLabel, "Must have change type label");
      assert.ok(item.title.length > 5, "Must have descriptive title");
      assert.ok(item.description.length > 15, "Must have plain-language description");
      assert.ok(item.officialSourceUrl.startsWith("https://"), "Must cite HTTPS official source");
      assert.ok(item.officialSourceUrl.includes(".gov.in"), "Must cite official .gov.in authority");
    }
  });

  await t.test(
    "5. Components exist and integrate 'Rules changed' and 'What changed' features",
    () => {
      const whatChangedPath = path.join(
        process.cwd(),
        "src/components/task/WhatChangedSection.tsx"
      );
      const myChecklistsPath = path.join(process.cwd(), "src/app/my-checklists/page.tsx");
      const taskPagePath = path.join(process.cwd(), "src/components/task/TaskPageView.tsx");

      assert.ok(fs.existsSync(whatChangedPath), "WhatChangedSection component must exist");
      assert.ok(fs.existsSync(myChecklistsPath), "MyChecklists page must exist");
      assert.ok(fs.existsSync(taskPagePath), "TaskPageView component must exist");

      const whatChangedContent = fs.readFileSync(whatChangedPath, "utf-8");
      const myChecklistsContent = fs.readFileSync(myChecklistsPath, "utf-8");
      const taskPageContent = fs.readFileSync(taskPagePath, "utf-8");

      // MyChecklists renders the Rules changed badge
      assert.ok(
        myChecklistsContent.includes("Rules changed"),
        "MyChecklists must render 'Rules changed' badge"
      );

      // TaskPageView integrates WhatChangedSection and Rules Changed banner
      assert.ok(
        taskPageContent.includes("WhatChangedSection"),
        "TaskPageView must integrate WhatChangedSection"
      );
      assert.ok(
        taskPageContent.includes("hasRulesChanged"),
        "TaskPageView must check and display rules changed notice"
      );

      // WhatChangedSection contains Zero Email Required privacy statement
      assert.ok(
        whatChangedContent.includes("Zero Email Required"),
        "Must emphasize retention without email"
      );
    }
  );
});
