import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";
import { isOfficialGovernmentDomain } from "../scripts/validate-content.ts";

describe("PROMPT 199: Gujarat Variant — Shop and Establishment Licence", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/content/tasks/shop-and-establishment-licence.json"
  );

  it("1. Content file exists and schema validates", () => {
    assert.ok(fs.existsSync(filePath), "shop-and-establishment-licence.json must exist");
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

  it("3. Gujarat steps detail zero-fee Form A intimation and Gujarati signboard", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const steps = task.states?.GJ?.steps || [];
    assert.ok(
      steps.length >= 6,
      `Gujarat override must have at least 6 steps, got ${steps.length}`
    );

    const hasIntimation = steps.some(
      (s) =>
        (s.title && s.title.includes("Form A")) ||
        (s.description && s.description.includes("Form A"))
    );
    assert.ok(hasIntimation, "Must detail Form A intimation for under 10 workers");

    const hasSignboard = steps.some(
      (s) =>
        (s.title && s.title.includes("Signboard")) ||
        (s.description && s.description.includes("Gujarati"))
    );
    assert.ok(hasSignboard, "Must detail Gujarati language signboard mandate");
  });

  it("4. Gujarat statutory fees cite zero fee for small shops", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const fees = task.states?.GJ?.fees || [];
    assert.ok(fees.length >= 2, "Must specify small shop and larger unit fees");

    const smallFee = fees.find((f) => f.id === "gj-shop-fee-under10");
    assert.ok(smallFee, "Must have small shop fee entry");
    assert.equal(smallFee.amount, 0, "Under 10 workers fee must be 0 INR (Free)");

    for (const fee of fees) {
      assert.ok(fee.sourceUrl && isOfficialGovernmentDomain(fee.sourceUrl));
    }
  });

  it("5. Gujarat FAQs address lifetime validity and Gujarati signboards", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const faqs = task.states?.GJ?.faqItems || [];
    assert.ok(faqs.length >= 4, "Must contain at least 4 Gujarat-specific FAQs");

    const hasLifetimeFaq = faqs.some(
      (f) => f.question.includes("renewal") && f.answer.includes("lifetime")
    );
    assert.ok(hasLifetimeFaq, "Must answer question regarding lifetime validity");
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
