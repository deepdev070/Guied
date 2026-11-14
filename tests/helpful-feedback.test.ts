import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  recordPageFeedback,
  getPageFeedbackStats,
  PageFeedbackSchema,
} from "../src/lib/page-feedback.ts";

describe("Prompt 71: Helpful Feedback Widget & Telemetry", () => {
  it("validates valid helpful feedback payload with schema", () => {
    const valid = PageFeedbackSchema.parse({
      taskSlug: "passport-renewal",
      stateSlug: "gujarat",
      pageUrl: "/passport-renewal/gujarat",
      isHelpful: true,
    });

    assert.equal(valid.taskSlug, "passport-renewal");
    assert.equal(valid.isHelpful, true);
  });

  it("validates unhelpful feedback with reason chips and details", () => {
    const valid = PageFeedbackSchema.parse({
      taskSlug: "driving-licence-learner",
      stateSlug: "gujarat",
      isHelpful: false,
      missingReason: "missing_document",
      details: "Form 1A medical certificate was missing for applicants over 40.",
    });

    assert.equal(valid.isHelpful, false);
    assert.equal(valid.missingReason, "missing_document");
    assert.ok(valid.details?.includes("Form 1A"));
  });

  it("fails schema validation on empty or invalid inputs", () => {
    const invalid = PageFeedbackSchema.safeParse({
      details: "No task slug provided",
    });

    assert.equal(invalid.success, false);
  });

  it("records feedback through recordPageFeedback helper without crashing", async () => {
    const result = await recordPageFeedback({
      taskSlug: "passport-renewal",
      isHelpful: true,
    });

    assert.equal(result.success, true);
  });

  it("retrieves feedback statistics through getPageFeedbackStats", async () => {
    const stats = await getPageFeedbackStats("passport-renewal");
    assert.ok(typeof stats.totalCount === "number");
    assert.ok(typeof stats.helpfulCount === "number");
    assert.ok(typeof stats.unhelpfulCount === "number");
    assert.ok(typeof stats.helpfulRatio === "number");
  });

  it("verifies PageFeedback table definition in Prisma schema", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf-8");
    assert.ok(schema.includes("model PageFeedback"), "Must define PageFeedback model");
    assert.ok(schema.includes("taskSlug"), "Must store taskSlug");
    assert.ok(schema.includes("isHelpful"), "Must store isHelpful");
    assert.ok(schema.includes("missingReason"), "Must store missingReason");
    assert.ok(schema.includes("details"), "Must store details");
  });

  it("verifies HelpfulFeedbackWidget component structure and reason chips", () => {
    const widgetPath = path.join(process.cwd(), "src/components/task/HelpfulFeedbackWidget.tsx");
    assert.ok(fs.existsSync(widgetPath), "HelpfulFeedbackWidget.tsx must exist");

    const code = fs.readFileSync(widgetPath, "utf-8");
    assert.ok(code.includes("Was this page helpful?"), "Must ask helpful question");
    assert.ok(code.includes("What was missing?"), "Must ask What was missing on No");
    assert.ok(code.includes("missing_document"), "Must include missing_document chip");
    assert.ok(code.includes("fee_mismatch"), "Must include fee_mismatch chip");
    assert.ok(code.includes("broken_link"), "Must include broken_link chip");
    assert.ok(code.includes("outdated_steps"), "Must include outdated_steps chip");
  });

  it("verifies TaskPageView integrates HelpfulFeedbackWidget at the end of the guide", () => {
    const taskPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskPageView.tsx"),
      "utf-8"
    );
    assert.ok(
      taskPageCode.includes("HelpfulFeedbackWidget"),
      "TaskPageView must import and render HelpfulFeedbackWidget"
    );
  });
});
