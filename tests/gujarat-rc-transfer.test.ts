import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";
import { isOfficialGovernmentDomain } from "../scripts/validate-content.ts";

describe("PROMPT 190: Gujarat Variant — Vehicle RC Transfer", () => {
  const filePath = path.resolve(process.cwd(), "src/content/tasks/vehicle-rc-transfer.json");

  it("1. Content file exists and schema validates", () => {
    assert.ok(fs.existsSync(filePath), "vehicle-rc-transfer.json must exist");
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

  it("3. Gujarat steps detail dual Aadhaar e-KYC and chassis pencil print", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const steps = task.states?.GJ?.steps || [];
    assert.ok(steps.length >= 6, `Gujarat override must have at least 6 steps, got ${steps.length}`);

    const hasDualAadhaar = steps.some((s) => (s.title && s.title.includes("Dual")) || (s.description && s.description.includes("Buyer and seller")));
    assert.ok(hasDualAadhaar, "Must detail dual Aadhaar authentication");

    const hasChassis = steps.some((s) => (s.title && s.title.includes("Chassis")) || (s.description && s.description.includes("chassis")));
    assert.ok(hasChassis, "Must detail chassis pencil print inspection");
  });

  it("4. Gujarat statutory fees cite two-wheeler and car transfer packages", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const fees = task.states?.GJ?.fees || [];
    assert.ok(fees.length >= 2, "Must specify two-wheeler and car transfer fees");

    const twFee = fees.find((f) => f.id === "gj-rc-fee-twowheeler");
    assert.ok(twFee, "Must have two-wheeler fee");
    assert.equal(twFee.amount, 350, "Two-wheeler composite fee must be 350 INR");

    for (const fee of fees) {
      assert.ok(fee.sourceUrl && isOfficialGovernmentDomain(fee.sourceUrl));
    }
  });

  it("5. Gujarat FAQs address online transfer and road tax calculation", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const faqs = task.states?.GJ?.faqItems || [];
    assert.ok(faqs.length >= 4, "Must contain at least 4 Gujarat-specific FAQs");

    const hasTaxFaq = faqs.some((f) => f.question.includes("road tax") || f.answer.includes("depreciated"));
    assert.ok(hasTaxFaq, "Must answer question regarding Gujarat road tax calculations");
  });

  it("6. Gujarat official links point to official Gujarat portals", () => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const task: TaskContent = JSON.parse(raw);
    const links = task.states?.GJ?.officialLinks || [];
    assert.ok(links.length >= 2, "Must contain at least 2 official Gujarat links");

    for (const link of links) {
      assert.ok(isOfficialGovernmentDomain(link.url), `Link ${link.url} must be official gov domain`);
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
