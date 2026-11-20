import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";
import { isOfficialGovernmentDomain } from "../scripts/validate-content.ts";

describe("PROMPT 160: Content Factory — Driving Licence: Learner's Licence", () => {
  const filePath = path.resolve(process.cwd(), "src/content/tasks/driving-licence-learner.json");

  it("1. Content file exists and conforms to TaskContentSchema", () => {
    assert.ok(
      fs.existsSync(filePath),
      "driving-licence-learner.json must exist in src/content/tasks/"
    );
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
    assert.equal(
      sentences.length,
      2,
      `Summary must have exactly 2 sentences, got ${sentences.length}`
    );
    for (const s of sentences) {
      const words = s.trim().split(/\s+/).length;
      assert.ok(words <= 25, `Sentence exceeds 25 words: "${s}" (${words} words)`);
    }
  });

  it("3. Contains 6 to 10 clear procedure steps with 'where' location", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const steps = task.national.steps;
    assert.ok(
      steps.length >= 6 && steps.length <= 10,
      `Steps count must be between 6 and 10 (got ${steps.length})`
    );

    for (const step of steps) {
      assert.ok(
        step.where && step.where.length > 3,
        `Step ${step.stepNumber} must have 'where' specified`
      );
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
    assert.ok(
      conditionalDocs.length >= 1,
      "Must have conditional documents with appliesWhen rules"
    );

    for (const cDoc of conditionalDocs) {
      assert.ok(cDoc.appliesWhen, `Conditional doc "${cDoc.name}" must have appliesWhen rule`);
    }
  });

  it("5. Statutory fee table cites official .gov.in sources and verified dates", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const fees = task.national.fees;
    assert.ok(fees.length >= 2, "Must list statutory fees");

    const applicationFee = fees.find((f) => f.amount === 150);
    assert.ok(applicationFee, "Processing fee must be ₹150");

    const testFee = fees.find((f) => f.amount === 50);
    assert.ok(testFee, "Test fee must be ₹50");

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
    assert.ok(
      reasons.length >= 5 && reasons.length <= 8,
      `Rejection reasons count must be 5-8 (got ${reasons.length})`
    );

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
    assert.ok(links.length >= 2, "Must include at least 2 official links");

    for (const link of links) {
      assert.ok(
        isOfficialGovernmentDomain(link.url),
        `Link "${link.label}" (${link.url}) must point to official .gov.in domain`
      );
    }
  });

  it("9. Includes 5 'Before you leave home' checks", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const beforeYouGo = task.national.beforeYouGo;
    assert.ok(beforeYouGo, "beforeYouGo must exist");
    assert.equal(beforeYouGo.items?.length, 5, "Must have exactly 5 pre-departure checklist items");
  });

  it("10. Class 8 Reading Ease: zero sentences exceeding 25 words", () => {
    const raw = fs.readFileSync(filePath, "utf-8");

    const extractStrings = (obj: unknown, arr: string[] = []): string[] => {
      if (typeof obj === "string") {
        arr.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach((i) => extractStrings(i, arr));
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach((v) => extractStrings(v, arr));
      }
      return arr;
    };

    const strings = extractStrings(JSON.parse(raw));
    const violations: { text: string; words: number }[] = [];

    for (const text of strings) {
      if (
        text.startsWith("http://") ||
        text.startsWith("https://") ||
        /^\d{4}-\d{2}-\d{2}/.test(text)
      ) {
        continue;
      }

      const sentences = text
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && /[a-zA-Z]/.test(s));

      for (const sentence of sentences) {
        const words = sentence.split(/\s+/).filter(Boolean).length;
        if (words > 25) {
          violations.push({ text: sentence, words });
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `Found ${violations.length} sentence(s) exceeding 25 words:\n${violations
        .map((v) => `[${v.words} words] ${v.text}`)
        .join("\n")}`
    );
  });

  it("11. Notes state-level details for Gujarat (GJ)", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    assert.ok(task.states?.GJ, "Must contain Gujarat state details");
    assert.ok(task.states.GJ.title && task.states.GJ.title.includes("Gujarat"));
    assert.ok(task.states.GJ.lastVerifiedAt);
  });
});
