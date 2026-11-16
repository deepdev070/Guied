import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runPublishGate } from "../src/lib/admin/publish-gate.ts";
import {
  recordRevision,
  listRevisions,
  getRevisionById,
  restoreRevision,
} from "../src/lib/admin/revisions.ts";
import { getTaskContent } from "../src/lib/admin/task-storage.ts";
import type { TaskContent } from "../src/types/content.ts";

describe("Prompt 106: Draft, Review, Publish Workflow & Content Revisions", () => {
  it("evaluates publish gate on compliant guide and passes with 7/7 criteria", () => {
    const guide = getTaskContent("driving-licence-learner");
    assert.ok(guide, "driving-licence-learner must exist");

    const report = runPublishGate(guide);
    assert.equal(report.canPublish, true, "Fully compliant guide must pass publish gate");
    assert.equal(report.violations.length, 0, "Compliant guide must have 0 violations");
    assert.equal(report.checklist.length, 7, "Checklist must contain all 7 criteria");

    const passedItems = report.checklist.filter((item) => item.passed);
    assert.equal(passedItems.length, 7, "All 7 criteria must pass");
  });

  it("blocks publishing on incomplete/thin guide and details exact missing requirements", () => {
    const thinGuide: TaskContent = {
      slug: "incomplete-thin-guide-test",
      name: "Incomplete Guide",
      categorySlug: "identity",
      national: {
        title: "Incomplete Guide Title",
        summary: "Short summary that is under forty words.",
        estimatedTime: "5 days",
        difficulty: "easy",
        status: "DRAFT",
        steps: [
          {
            stepNumber: 1,
            title: "Only One Step",
            description: "Step details here.",
            status: "PUBLISHED",
          },
        ],
        documentRequirements: [
          {
            name: "Aadhaar Card",
            requirementType: "required",
            displayOrder: 0,
            status: "PUBLISHED",
          },
        ],
        fees: [],
        officialLinks: [],
        faqItems: [],
        rejectionReasons: [],
        sourceRefs: [],
      },
      states: {},
    };

    const report = runPublishGate(thinGuide);
    assert.equal(report.canPublish, false, "Thin guide must be blocked from publishing");
    assert.ok(report.violations.length >= 4, "Must identify multiple missing requirements");

    const violationText = report.violations.join(" ");
    assert.ok(
      violationText.includes("documents") || violationText.includes("Documents"),
      "Must flag insufficient documents"
    );
    assert.ok(
      violationText.includes("steps") || violationText.includes("Steps"),
      "Must flag insufficient steps"
    );
    assert.ok(
      violationText.includes("portal") || violationText.includes("link"),
      "Must flag missing official links"
    );
    assert.ok(
      violationText.includes("FAQs") || violationText.includes("faqs"),
      "Must flag insufficient FAQs"
    );
  });

  it("creates, lists, and retrieves durable ContentRevision snapshots on disk", async () => {
    const testSlug = "test-revision-guide-" + Date.now();
    const testTask: TaskContent = {
      slug: testSlug,
      name: "Revision Test Guide",
      categorySlug: "vehicles",
      national: {
        title: "Revision Test Title v1",
        summary: "Detailed overview text for testing content revisions and restore workflow.",
        estimatedTime: "10 days",
        difficulty: "easy",
        status: "DRAFT",
        steps: [
          {
            stepNumber: 1,
            title: "Step 1",
            description: "Description 1",
            status: "PUBLISHED",
          },
        ],
        documentRequirements: [
          {
            name: "Doc 1",
            requirementType: "required",
            displayOrder: 0,
            status: "PUBLISHED",
          },
        ],
        fees: [
          {
            label: "Fee",
            amount: 50,
            currency: "INR",
            isOptional: false,
            paymentMode: "both",
            status: "PUBLISHED",
          },
        ],
        officialLinks: [
          {
            label: "Portal",
            url: "https://parivahan.gov.in",
            isPrimary: true,
            status: "PUBLISHED",
          },
        ],
        faqItems: [],
        rejectionReasons: [],
        sourceRefs: [],
      },
      states: {},
    };

    // 1. Record Revision 1
    const rev1 = await recordRevision(testSlug, testTask, "Editor Alice", "Initial draft creation");
    assert.equal(rev1.revisionNumber, 1);
    assert.equal(rev1.author, "Editor Alice");

    // 2. Record Revision 2
    const updatedTask = {
      ...testTask,
      national: { ...testTask.national, title: "Revision Test Title v2" },
    };
    const rev2 = await recordRevision(testSlug, updatedTask, "Editor Bob", "Updated title to v2");
    assert.equal(rev2.revisionNumber, 2);
    assert.equal(rev2.author, "Editor Bob");

    // 3. List Revisions
    const revisions = await listRevisions(testSlug);
    assert.equal(revisions.length, 2, "Must list both recorded revisions");
    assert.equal(revisions[0]?.revisionNumber, 2, "Newest revision must be first");
    assert.equal(revisions[1]?.revisionNumber, 1);

    // 4. Retrieve by ID
    const retrieved = await getRevisionById(testSlug, rev1.id);
    assert.ok(retrieved, "Must retrieve full revision by ID");
    assert.equal(retrieved?.payload.national.title, "Revision Test Title v1");

    // Clean up test folder
    const testFolder = path.join(process.cwd(), ".revisions", testSlug);
    if (fs.existsSync(testFolder)) {
      fs.rmSync(testFolder, { recursive: true, force: true });
    }
  });

  it("restores an earlier revision snapshot successfully", async () => {
    const testSlug = "test-restore-guide-" + Date.now();
    const originalTask: TaskContent = {
      slug: testSlug,
      name: "Original Name",
      categorySlug: "identity",
      national: {
        title: "Original Title Prior to Bug",
        summary: "This was the good version before bad changes were introduced.",
        estimatedTime: "20 days",
        difficulty: "easy",
        status: "REVIEW",
        steps: [
          {
            stepNumber: 1,
            title: "Original Step",
            description: "Original description",
            status: "PUBLISHED",
          },
        ],
        documentRequirements: [
          {
            name: "Original Document",
            requirementType: "required",
            displayOrder: 0,
            status: "PUBLISHED",
          },
        ],
        fees: [
          {
            label: "Original Fee",
            amount: 100,
            currency: "INR",
            isOptional: false,
            paymentMode: "both",
            status: "PUBLISHED",
          },
        ],
        officialLinks: [
          { label: "Portal", url: "https://india.gov.in", isPrimary: true, status: "PUBLISHED" },
        ],
        faqItems: [],
        rejectionReasons: [],
        sourceRefs: [],
      },
      states: {},
    };

    const testFolder = path.join(process.cwd(), ".revisions", testSlug);
    const contentFile = path.join(process.cwd(), "src/content/tasks", `${testSlug}.json`);

    try {
      // Save v1
      const rev1 = await recordRevision(testSlug, originalTask, "Admin", "Original baseline");

      // Save v2 with corruption
      const corruptedTask = {
        ...originalTask,
        national: { ...originalTask.national, title: "Corrupted Title with Errors" },
      };
      await recordRevision(testSlug, corruptedTask, "Admin", "Corrupted edit");

      // Restore v1 with skipDiskWrite to avoid contaminating concurrent test suites
      const restoreResult = await restoreRevision(testSlug, rev1.id, "Admin Restorer", {
        skipDiskWrite: true,
      });
      assert.equal(restoreResult.success, true, "Restore action must succeed");
      assert.equal(
        restoreResult.restoredRevision?.revisionNumber,
        3,
        "Restore creates revision #3"
      );
      assert.equal(
        restoreResult.restoredRevision?.payload.national.title,
        "Original Title Prior to Bug",
        "Restored payload must contain original title"
      );
    } finally {
      // Clean up guaranteed
      if (fs.existsSync(testFolder)) {
        fs.rmSync(testFolder, { recursive: true, force: true });
      }
      if (fs.existsSync(contentFile)) {
        fs.unlinkSync(contentFile);
      }
    }
  });

  it("verifies modals and workflow API routes exist", () => {
    const gateModalPath = path.join(
      process.cwd(),
      "src/components/admin/editor/PublishGateModal.tsx"
    );
    assert.ok(fs.existsSync(gateModalPath), "PublishGateModal.tsx must exist");

    const historyModalPath = path.join(
      process.cwd(),
      "src/components/admin/editor/RevisionHistoryModal.tsx"
    );
    assert.ok(fs.existsSync(historyModalPath), "RevisionHistoryModal.tsx must exist");

    const revRoutePath = path.join(
      process.cwd(),
      "src/app/api/admin/guides/[slug]/revisions/route.ts"
    );
    assert.ok(fs.existsSync(revRoutePath), "Revisions list route must exist");

    const restoreRoutePath = path.join(
      process.cwd(),
      "src/app/api/admin/guides/[slug]/revisions/restore/route.ts"
    );
    assert.ok(fs.existsSync(restoreRoutePath), "Revisions restore route must exist");

    const gateRoutePath = path.join(
      process.cwd(),
      "src/app/api/admin/guides/[slug]/publish-gate/route.ts"
    );
    assert.ok(fs.existsSync(gateRoutePath), "Publish gate route must exist");
  });
});
