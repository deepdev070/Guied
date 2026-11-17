import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";
import { isOfficialGovernmentDomain } from "../scripts/validate-content.ts";

describe("PROMPT 164: Content Factory — Aadhaar Address / Mobile / Details Update", () => {
  const filePath = path.resolve(process.cwd(), "src/content/tasks/aadhaar-update.json");

  it("1. Content file exists and conforms to TaskContentSchema", () => {
    assert.ok(fs.existsSync(filePath), "aadhaar-update.json must exist in src/content/tasks/");
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = TaskContentSchema.safeParse(json);
    assert.ok(parsed.success, `Schema validation failed: ${JSON.stringify(parsed.error?.issues)}`);
  });

  it("2. Summary has exactly 2 sentences and plain-language readability", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const summary = task.national.summary.trim();
    const sentences = summary.split(/(?<=[.?!])\s+/).filter(Boolean);
    assert.equal(sentences.length, 2, `Summary must have exactly 2 sentences, got ${sentences.length}`);
    for (const s of sentences) {
      const words = s.trim().split(/\s+/).length;
      assert.ok(words <= 25, `Sentence exceeds 25 words: "${s}" (${words} words)`);
    }
  });

  it("3. Contains 6 to 10 clear procedure steps with 'where' location", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const steps = task.national.steps;
    assert.ok(steps.length >= 6 && steps.length <= 10, `Steps count must be between 6 and 10 (got ${steps.length})`);

    for (const step of steps) {
      assert.ok(step.where && step.where.length > 3, `Step ${step.stepNumber} must have 'where' specified`);
      assert.ok(step.title.length > 5, `Step ${step.stepNumber} must have descriptive title`);
      assert.ok(step.description.length > 15, `Step ${step.stepNumber} must have descriptive body`);
    }
  });

  it("4. Document requirements include appliesWhen conditional rules", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const docs = task.national.documentRequirements;
    assert.ok(docs.length >= 5, "Must list at least 5 document requirements");

    const conditionalDocs = docs.filter((d) => d.requirementType === "conditional");
    assert.ok(conditionalDocs.length >= 1, "Must have conditional documents with appliesWhen rules");

    for (const cDoc of conditionalDocs) {
      assert.ok(cDoc.appliesWhen, `Conditional doc "${cDoc.name}" must have appliesWhen rule`);
    }
  });

  it("5. Statutory fee table cites official .gov.in sources and verified dates", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const fees = task.national.fees;
    assert.ok(fees.length >= 2, "Must list statutory fees");

    for (const fee of fees) {
      assert.ok(fee.sourceUrl, `Fee "${fee.label}" must cite official source URL`);
      assert.ok(
        isOfficialGovernmentDomain(fee.sourceUrl!),
        `Fee sourceUrl "${fee.sourceUrl}" must be official government domain`
      );
      assert.ok(fee.lastVerifiedAt, `Fee "${fee.label}" must include lastVerifiedAt date`);
    }
  });

  it("6. Rejection reasons list 5 to 8 real mistakes with solutions", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const reasons = task.national.rejectionReasons || [];
    assert.ok(reasons.length >= 5 && reasons.length <= 8, `Rejection reasons count must be 5-8 (got ${reasons.length})`);

    for (const r of reasons) {
      assert.ok(r.title.length >= 5, "Title must be descriptive");
      assert.ok(r.description.length >= 10, "Description must explain reason");
      assert.ok(r.solution.length >= 10, "Solution must provide actionable guidance");
    }
  });

  it("7. Contains exactly 8 FAQs with verified .gov.in answers", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const faqs = task.national.faqItems || [];
    assert.equal(faqs.length, 8, `Must contain 8 FAQs, got ${faqs.length}`);

    for (const faq of faqs) {
      assert.ok(faq.question.endsWith("?"), "FAQ question must end with '?'");
      assert.ok(faq.answer.length >= 10, "FAQ answer must be clear and helpful");
    }
  });

  it("8. Official links point exclusively to official government portals", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const links = task.national.officialLinks;
    assert.ok(links.length >= 1, "Must list official links");

    for (const link of links) {
      assert.ok(
        isOfficialGovernmentDomain(link.url),
        `Link "${link.label}" (${link.url}) must use official government domain`
      );
    }
  });

  it("9. Includes 5 'Before you submit/go' checks", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const checks = task.national.beforeYouGo?.items || [];
    assert.equal(checks.length, 5, `Must have exactly 5 before-you-go checks, got ${checks.length}`);

    for (const check of checks) {
      assert.ok(check.title.length > 3, "Check item must have a title");
      assert.ok(check.description.length > 10, "Check item must have a description");
    }
  });

  it("10. Regional state details included for Gujarat launch state", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const gj = task.states?.GJ;
    assert.ok(gj, "Must include Gujarat (GJ) state details");
    assert.ok(gj.title && gj.title.includes("Gujarat"), "Gujarat title must mention Gujarat");
    assert.ok(gj.summary && gj.summary.length > 20, "Gujarat summary must be descriptive");
  });

  it("11. All content sentences are <= 25 words (Class 8 standard)", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);

    const extractStrings = (obj: unknown): string[] => {
      const results: string[] = [];
      if (typeof obj === "string") {
        results.push(obj);
      } else if (Array.isArray(obj)) {
        for (const item of obj) results.push(...extractStrings(item));
      } else if (obj !== null && typeof obj === "object") {
        for (const val of Object.values(obj)) results.push(...extractStrings(val));
      }
      return results;
    };

    const allStrings = extractStrings(task);
    for (const str of allStrings) {
      if (str.startsWith("http") || str.includes("T00:00:00")) continue;
      const sentences = str.split(/(?<=[.?!])\s+/).filter(Boolean);
      for (const s of sentences) {
        const words = s.trim().split(/\s+/).filter(Boolean).length;
        assert.ok(words <= 25, `Sentence exceeds 25 words limit: "${s}" (${words} words)`);
      }
    }
  });
});
