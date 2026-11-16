import { describe, it } from "node:test";
import assert from "node:assert";
import { recordAuditLog, listAuditLogs } from "../src/lib/admin/audit.ts";

describe("Prompt 110: Administrative Audit Log and Before/After Diff Trail", () => {
  it("1. Record Audit Log: captures who, what, when, targetSlug, and details", async () => {
    const entry = await recordAuditLog({
      action: "VERIFY_GUIDE",
      actor: "Lead Inspector",
      targetSlug: "driving-licence-learner",
      targetType: "guide",
      details: {
        notes: "Verified fees with Parivahan CMVR Rule 32 notification.",
        verifiedUrl: "https://parivahan.gov.in",
      },
    });

    assert.ok(entry.id.startsWith("audit_"));
    assert.strictEqual(entry.action, "VERIFY_GUIDE");
    assert.strictEqual(entry.actor, "Lead Inspector");
    assert.strictEqual(entry.targetSlug, "driving-licence-learner");
    assert.ok(entry.timestamp);
    assert.strictEqual(
      entry.details?.notes,
      "Verified fees with Parivahan CMVR Rule 32 notification."
    );
  });

  it("2. Before / After State Capture: records snapshot diffs for modifications", async () => {
    const beforeState = {
      status: "DRAFT",
      feeAmount: 200,
      lastVerifiedAt: "2025-10-01T00:00:00.000Z",
    };
    const afterState = {
      status: "PUBLISHED",
      feeAmount: 250,
      lastVerifiedAt: "2026-03-01T00:00:00.000Z",
    };

    const entry = await recordAuditLog({
      action: "UPDATE_GUIDE",
      actor: "Policy Admin",
      targetSlug: "passport-renewal",
      before: beforeState,
      after: afterState,
      details: { summaryOfChanges: "Updated Tatkaal fee and approved for publication." },
    });

    assert.deepStrictEqual(entry.before, beforeState);
    assert.deepStrictEqual(entry.after, afterState);

    const logs = await listAuditLogs({ targetSlug: "passport-renewal" });
    const found = logs.find((l) => l.id === entry.id);
    assert.ok(found, "Newly logged entry must be retrieved in listAuditLogs");
    assert.strictEqual(found.before?.status, "DRAFT");
    assert.strictEqual(found.after?.status, "PUBLISHED");
  });

  it("3. Filter by Action: filters log records by action type", async () => {
    const verifyLogs = await listAuditLogs({ action: "VERIFY_GUIDE" });
    assert.ok(verifyLogs.length > 0, "Should return VERIFY_GUIDE records");
    for (const log of verifyLogs) {
      assert.strictEqual(log.action, "VERIFY_GUIDE");
    }
  });

  it("4. Filter by Target Slug: filters log records by guide slug", async () => {
    const learnerLogs = await listAuditLogs({ targetSlug: "driving-licence-learner" });
    assert.ok(learnerLogs.length > 0, "Should return records for driving-licence-learner");
    for (const log of learnerLogs) {
      assert.strictEqual(log.targetSlug, "driving-licence-learner");
    }
  });

  it("5. Searchable Audit Trail: finds records matching text in actor, slug, or diff values", async () => {
    // Unique marker in details
    const uniqueMarker = `marker_${Date.now()}_test`;
    await recordAuditLog({
      action: "UPDATE_GUIDE",
      actor: "TestAuditor",
      targetSlug: "driving-licence-learner",
      details: { uniqueMarker, specialRuleRef: "Section-19A" },
    });

    const searchResults = await listAuditLogs({ search: uniqueMarker });
    assert.strictEqual(searchResults.length, 1);
    assert.strictEqual(searchResults[0]?.actor, "TestAuditor");
    assert.strictEqual(searchResults[0]?.details?.uniqueMarker, uniqueMarker);
  });

  it("6. Chronological Order: sorts records newest first", async () => {
    const logs = await listAuditLogs({ limit: 10 });
    assert.ok(logs.length >= 2, "Should have multiple logs");

    for (let i = 0; i < logs.length - 1; i++) {
      const current = new Date(logs[i]!.timestamp).getTime();
      const next = new Date(logs[i + 1]!.timestamp).getTime();
      assert.ok(current >= next, "Logs must be sorted in descending chronological order");
    }
  });
});
