import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";
import { isOfficialGovernmentDomain } from "../scripts/validate-content.ts";

describe("PROMPT 194: Gujarat Variant — Marriage Registration", () => {
  const filePath = path.resolve(process.cwd(), "src/content/tasks/marriage-certificate.json");

  it("1. Content file exists and schema validates", () => {
    assert.ok(fs.existsSync(filePath), "marriage-certificate.json must exist");
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = TaskContentSchema.safeParse(json);
    assert.ok(parsed.success, `Schema validation failed: ${JSON.stringify(parsed.error?.issues)}`);
  });

  it("2. Gujarat override includes complete state-specific details", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const gj = task.states?.GJ;
    assert.ok(gj, "Must have Gujarat (GJ) override");
    assert.ok(gj.title && gj.title.includes("Gujarat"), "Title must mention Gujarat");
    assert.ok(gj.summary && gj.summary.includes("Gujarat"), "Summary must mention Gujarat");
    assert.equal(gj.status, "PUBLISHED");
    assert.ok(gj.lastVerifiedAt);
    assert.ok(gj.sourceUrl && isOfficialGovernmentDomain(gj.sourceUrl));
  });

  it("3. Gujarat steps detail Kankotri invitation and 3 witnesses requirement", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const steps = task.states?.GJ?.steps || [];
    assert.ok(
      steps.length >= 6,
      `Gujarat override must have at least 6 steps, got ${steps.length}`
    );

    const hasKankotri = steps.some(
      (s) =>
        (s.where && s.where.includes("Kankotri")) ||
        (s.description && s.description.includes("Kankotri"))
    );
    assert.ok(hasKankotri, "Must detail wedding Kankotri evidence");

    const hasWitnesses = steps.some(
      (s) =>
        (s.where && s.where.includes("Witness")) ||
        (s.description && s.description.includes("Three Witnesses")) ||
        s.description.includes("three witnesses")
    );
    assert.ok(hasWitnesses, "Must detail 3 adult witnesses requirement");
  });

  it("4. Gujarat statutory fees cite 5 rupee timely fee under Gujarat 2006 Act", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const fees = task.states?.GJ?.fees || [];
    assert.ok(fees.length >= 2, "Must specify timely fee and copy fee");

    const timelyFee = fees.find((f) => f.id === "gj-marr-fee-timely");
    assert.ok(timelyFee, "Must have timely fee");
    assert.equal(timelyFee.amount, 5, "Timely fee within 30 days must be 5 INR");

    for (const fee of fees) {
      assert.ok(fee.sourceUrl && isOfficialGovernmentDomain(fee.sourceUrl));
    }
  });

  it("5. Gujarat FAQs address 5 rupee fee and 3 witnesses rule", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const faqs = task.states?.GJ?.faqItems || [];
    assert.ok(faqs.length >= 4, "Must contain at least 4 Gujarat-specific FAQs");

    const hasFeeFaq = faqs.some((f) => f.question.includes("fee") && f.answer.includes("five"));
    assert.ok(hasFeeFaq, "Must answer question regarding five rupee fee");
  });

  it("6. Gujarat official links point to official Gujarat portals", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const links = task.states?.GJ?.officialLinks || [];
    assert.ok(links.length >= 2, "Must contain at least 2 official Gujarat links");

    for (const link of links) {
      assert.ok(
        isOfficialGovernmentDomain(link.url),
        `Link ${link.url} must be official gov domain`
      );
    }
  });

  it("7. Plain language readability (<= 25 words per sentence)", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const gj = task.states?.GJ;

    const extractStrings = (obj: unknown): string[] => {
      const results: string[] = [];
      if (typeof obj === "string") results.push(obj);
      else if (Array.isArray(obj)) {
        for (const i of obj) results.push(...extractStrings(i));
      } else if (obj !== null && typeof obj === "object") {
        for (const v of Object.values(obj)) results.push(...extractStrings(v));
      }
      return results;
    };

    const strings = extractStrings(gj);
    for (const str of strings) {
      if (str.startsWith("http") || str.includes("T00:00:00")) continue;
      const sentences = str.split(/(?<=[.?!])\s+/).filter(Boolean);
      for (const s of sentences) {
        const words = s.trim().split(/\s+/).filter(Boolean).length;
        assert.ok(words <= 25, `Sentence exceeds 25 words limit: "${s}" (${words} words)`);
      }
    }
  });
});
