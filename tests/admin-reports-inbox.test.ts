import { describe, it } from "node:test";
import assert from "node:assert";
import {
  listErrorReports,
  getErrorReportById,
  updateErrorReportStatus,
  countOpenErrorReports,
  prepareEmailReply,
  createErrorReport,
  readDiskReports,
} from "../src/lib/admin/reports.ts";

describe("Prompt 109: User Error Reports Inbox & Management", () => {
  it("1. Reports Listing: retrieves reports and filters by guide slug", async () => {
    const allReports = await listErrorReports();
    assert.ok(allReports.length >= 3, "Should return seeded/persisted error reports");

    const filtered = await listErrorReports({ taskSlug: "driving-licence-learner" });
    assert.ok(filtered.length > 0, "Should find reports for driving-licence-learner");
    for (const r of filtered) {
      assert.strictEqual(r.taskSlug, "driving-licence-learner");
    }
  });

  it("2. Status Filtering: filters reports by status (NEW, NEED_TO_VERIFY, FIXED, NOT_AN_ISSUE)", async () => {
    const newReports = await listErrorReports({ status: "NEW" });
    assert.ok(newReports.length > 0, "Should find at least 1 NEW report");
    for (const r of newReports) {
      assert.strictEqual(r.status, "NEW");
    }

    const fixedReports = await listErrorReports({ status: "FIXED" });
    for (const r of fixedReports) {
      assert.strictEqual(r.status, "FIXED");
    }
  });

  it("3. Update Status: marks report as FIXED with resolution notes", async () => {
    const reports = readDiskReports();
    const target = reports.find((r) => r.status === "NEW") || reports[0]!;

    const updated = await updateErrorReportStatus(target.id, {
      status: "FIXED",
      adminNotes: "Fixed fee amount in Gujarat variant.",
      resolvedBy: "Senior Editor",
    });

    assert.strictEqual(updated.status, "FIXED");
    assert.strictEqual(updated.adminNotes, "Fixed fee amount in Gujarat variant.");
    assert.strictEqual(updated.resolvedBy, "Senior Editor");
    assert.ok(updated.resolvedAt, "resolvedAt timestamp must be populated");

    const fetched = await getErrorReportById(target.id);
    assert.strictEqual(fetched?.status, "FIXED");
  });

  it("4. Update Status: marks report as NEED_TO_VERIFY", async () => {
    const reports = readDiskReports();
    const target = reports[0]!;

    const updated = await updateErrorReportStatus(target.id, {
      status: "NEED_TO_VERIFY",
      adminNotes: "Checking official gazette circular.",
      resolvedBy: "Verifier",
    });

    assert.strictEqual(updated.status, "NEED_TO_VERIFY");
    assert.strictEqual(updated.adminNotes, "Checking official gazette circular.");
  });

  it("5. Update Status: marks report as NOT_AN_ISSUE", async () => {
    const reports = readDiskReports();
    const target = reports[0]!;

    const updated = await updateErrorReportStatus(target.id, {
      status: "NOT_AN_ISSUE",
      adminNotes: "Official rule unchanged under Section 8.",
      resolvedBy: "Lead Editor",
    });

    assert.strictEqual(updated.status, "NOT_AN_ISSUE");
    assert.strictEqual(updated.adminNotes, "Official rule unchanged under Section 8.");
    assert.ok(updated.resolvedAt, "resolvedAt must be populated for NOT_AN_ISSUE");
  });

  it("6. Open Reports Counter: counts reports needing triage and verification", async () => {
    const count = await countOpenErrorReports();
    assert.ok(typeof count === "number", "Open count must be a number");
    assert.ok(count >= 0, "Open count cannot be negative");

    // All open reports have status NEW or NEED_TO_VERIFY
    const all = readDiskReports();
    const expectedCount = all.filter(
      (r) => r.status === "NEW" || r.status === "NEED_TO_VERIFY"
    ).length;
    assert.strictEqual(count, expectedCount);
  });

  it("7. Email Reply Preparation: generates personalized subject, message, and mailto link", () => {
    const sampleReport = {
      id: "test_rep_99",
      taskSlug: "passport-renewal",
      stateCode: null,
      reporterEmail: "citizen@example.com",
      issueType: "outdated_fee",
      description: "Tatkaal fee is ₹3500 instead of ₹3000.",
      proposedCorrection: "Update Tatkaal fee breakdown.",
      status: "FIXED" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reply = prepareEmailReply(sampleReport, "We updated the Tatkaal fee schedule today.");
    assert.strictEqual(reply.to, "citizen@example.com");
    assert.ok(reply.subject.includes("Passport Renewal"));
    assert.ok(reply.body.includes("Tatkaal fee schedule"));
    assert.ok(reply.body.includes("resolved the issue"));
    assert.ok(reply.mailtoUrl.startsWith("mailto:citizen%40example.com"));
    assert.ok(reply.mailtoUrl.includes("subject="));
  });

  it("8. Create Error Report: creates new report with unique ID and defaults to NEW status", async () => {
    const created = await createErrorReport({
      taskSlug: "driving-licence-learner",
      stateCode: "gj",
      reporterEmail: "new.citizen@test.gov.in",
      issueType: "wrong_document",
      description: "Document checklist should clarify Form 1A age threshold.",
      proposedCorrection: "Form 1A is only for age 40+.",
    });

    assert.ok(created.id.startsWith("rep_"));
    assert.strictEqual(created.status, "NEW");
    assert.strictEqual(created.reporterEmail, "new.citizen@test.gov.in");

    const fetched = await getErrorReportById(created.id);
    assert.strictEqual(fetched?.id, created.id);
  });
});
