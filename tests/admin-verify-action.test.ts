import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { recordAuditLog, listAuditLogs } from "../src/lib/admin/audit.ts";

describe("Prompt 107: 'Mark as Verified Today' Action, Revalidation & Audit Logging", () => {
  it("verifies VerifyTodayModal component exists and requires official source URL and check attestation", () => {
    const modalPath = path.join(process.cwd(), "src/components/admin/editor/VerifyTodayModal.tsx");
    assert.ok(fs.existsSync(modalPath), "VerifyTodayModal.tsx must exist");

    const content = fs.readFileSync(modalPath, "utf8");
    assert.ok(
      content.includes("Official Government Source URL"),
      "Must require official source URL"
    );
    assert.ok(
      content.includes("I checked this on the official site"),
      "Must require checking the official site attestation"
    );
    assert.ok(content.includes("checkedOfficialSite"), "Must bind checkedOfficialSite state");
    assert.ok(content.includes("/api/admin/guides/"), "Must call verify API endpoint");
  });

  it("records verification audit log with actor, source URL, and timestamp", async () => {
    const testSlug = "driving-licence-learner";
    const testSourceUrl = "https://parivahan.gov.in/parivahan//en/content/learner-licence";
    const testActor = "Senior Editor Sharma";

    const logEntry = await recordAuditLog({
      action: "VERIFY_GUIDE",
      actor: testActor,
      targetSlug: testSlug,
      details: {
        sourceUrl: testSourceUrl,
        notes: "Verified fees on official Parivahan gazette schedule",
        verifiedAt: new Date().toISOString(),
      },
    });

    assert.ok(logEntry.id, "Must generate unique audit log ID");
    assert.equal(logEntry.action, "VERIFY_GUIDE");
    assert.equal(logEntry.actor, testActor);
    assert.equal(logEntry.targetSlug, testSlug);
    assert.equal(logEntry.details?.sourceUrl, testSourceUrl);

    // Verify retrieval in listAuditLogs
    const logs = await listAuditLogs({ targetSlug: testSlug, action: "VERIFY_GUIDE" });
    assert.ok(logs.length > 0, "Must retrieve recorded audit logs");
    const found = logs.find((l) => l.id === logEntry.id);
    assert.ok(found, "Recorded log entry must be present");
    assert.equal(found?.actor, testActor);
  });

  it("verifies verify API route exists and enforces session and validation checks", () => {
    const routePath = path.join(process.cwd(), "src/app/api/admin/guides/[slug]/verify/route.ts");
    assert.ok(fs.existsSync(routePath), "Verify API route must exist");

    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes("getAdminSession"), "Must require authenticated admin session");
    assert.ok(content.includes("revalidatePath"), "Must trigger on-demand page revalidation");
    assert.ok(content.includes("recordAuditLog"), "Must record verification in audit log");
    assert.ok(content.includes("checkedOfficialSite"), "Must validate checkedOfficialSite");
    assert.ok(content.includes("sourceUrl"), "Must validate sourceUrl");
  });

  it("verifies GuideEditorForm exposes 'Verify Today' action", () => {
    const formPath = path.join(process.cwd(), "src/components/admin/editor/GuideEditorForm.tsx");
    assert.ok(fs.existsSync(formPath), "GuideEditorForm must exist");

    const content = fs.readFileSync(formPath, "utf8");
    assert.ok(content.includes("Verify Today"), "Must render 'Verify Today' button");
    assert.ok(content.includes("VerifyTodayModal"), "Must render VerifyTodayModal");
  });
});
