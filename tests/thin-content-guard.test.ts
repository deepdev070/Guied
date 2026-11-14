import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  evaluatePublishingGate,
  countWords,
  calculateVariantWordCount,
  THIN_CONTENT_CRITERIA,
} from "../src/lib/thin-content-guard.ts";
import { generateTaskMetadata } from "../src/lib/seo.ts";
import type { TaskContent } from "../src/types/content.ts";

describe("Prompt 83: Thin-Content Publishing Gate", () => {
  const baseMockTask = {
    slug: "sample-civic-task",
    name: "Sample Civic Task",
    description: "Comprehensive step-by-step citizen paperwork guide for testing purposes.",
    categorySlug: "identity",
    national: {
      title: "Sample Civic Task Guide (2026)",
      summary:
        "Detailed summary explaining documents, steps, statutory fees, and verified government portal links.",
      estimatedTime: "15-30 days",
      difficulty: "medium",
      status: "PUBLISHED",
      lastVerifiedAt: new Date().toISOString(),
      sourceUrl: "https://parivahan.gov.in",
      steps: [
        {
          stepNumber: 1,
          title: "Step 1: Fill the online application form",
          description:
            "Enter your official applicant details accurately per government identity records.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          stepNumber: 2,
          title: "Step 2: Upload self-attested document proofs",
          description:
            "Upload clean digital copies of your identity and address verification documents.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          stepNumber: 3,
          title: "Step 3: Pay the statutory government fees",
          description:
            "Pay the required processing fee using debit card, UPI, or Internet banking.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          stepNumber: 4,
          title: "Step 4: Book an appointment slot at the center",
          description:
            "Select an available date and time slot for biometric capture and verification.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          stepNumber: 5,
          title: "Step 5: Visit the office and collect acknowledgement",
          description:
            "Attend your scheduled appointment with original documents for final verification.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
      ],
      documentRequirements: [
        {
          name: "Document 1: Proof of Identity",
          description: "Aadhaar Card, Voter ID, or Indian Passport displaying full citizen name.",
          requirementType: "required",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          name: "Document 2: Proof of Address",
          description: "Electricity bill, registered rent agreement, or bank passbook.",
          requirementType: "required",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          name: "Document 3: Proof of Date of Birth",
          description: "10th standard school marksheet or municipal birth certificate.",
          requirementType: "required",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          name: "Document 4: Passport Sized Photographs",
          description: "Two recent colour photographs with plain white background.",
          requirementType: "required",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          name: "Document 5: Online Fee Payment Receipt",
          description: "Computerized acknowledgement printout with transaction reference number.",
          requirementType: "required",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
      ],
      fees: [
        {
          label: "Statutory Government Processing Fee",
          amount: 250,
          currency: "INR",
          paymentMode: "online",
          rulesReference: "Official Gazette Notification 2026",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
      ],
      faqItems: [
        {
          question: "How long does application processing take?",
          answer:
            "Standard processing takes between 15 to 30 working days from the date of biometric submission at the designated government center.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          question: "Can I track my application status online?",
          answer:
            "Yes, citizens can track real-time application status by entering their application number on the official department portal.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
        {
          question: "What should I do if my payment fails?",
          answer:
            "Wait 45 minutes before attempting a second payment as banking servers reconcile pending transactions automatically.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
      ],
      officialLinks: [
        {
          label: "Official Government Portal",
          url: "https://parivahan.gov.in",
          isPrimary: true,
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
      ],
      rejectionReasons: [
        {
          title: "Name spelling mismatch",
          description: "Spelling difference between Aadhaar card and school marksheet.",
          solution: "Submit an affidavit or correct Aadhaar before booking an appointment slot.",
          status: "PUBLISHED",
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: "https://parivahan.gov.in",
        },
      ],
    },
  } as unknown as TaskContent;

  it("word counter: counts words accurately", () => {
    assert.strictEqual(countWords(""), 0);
    assert.strictEqual(countWords("   "), 0);
    assert.strictEqual(countWords("Five words in this sentence."), 5);

    const calculatedWords = calculateVariantWordCount(baseMockTask, baseMockTask.national);
    assert.ok(calculatedWords > 0, "calculateVariantWordCount should return positive count");
    assert.strictEqual(THIN_CONTENT_CRITERIA.MIN_WORD_COUNT, 400);
    assert.strictEqual(THIN_CONTENT_CRITERIA.MIN_STEPS, 5);
    assert.strictEqual(THIN_CONTENT_CRITERIA.MIN_DOCUMENTS, 5);
  });

  it("gate validation: fails when documents < 5", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    task.national.documentRequirements = task.national.documentRequirements.slice(0, 4);

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("Insufficient documents")));
  });

  it("gate validation: fails when steps < 5", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    task.national.steps = task.national.steps.slice(0, 4);

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("Insufficient steps")));
  });

  it("gate validation: fails when fee info is missing", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    task.national.fees = [];
    task.national.summary = "Standard application guide.";

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("fee information")));
  });

  it("gate validation: accepts explicit 'no fee' declaration when fees array is empty", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    task.national.fees = [];
    task.national.summary = "This is a 100% free service with no fee required from citizens.";

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.metrics.hasFeeInfo, true);
  });

  it("gate validation: fails when FAQs < 3", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    task.national.faqItems = task.national.faqItems.slice(0, 2);

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("Insufficient FAQs")));
  });

  it("gate validation: fails when official links < 1", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    task.national.officialLinks = [];

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("Missing official portal link")));
  });

  it("gate validation: fails when lastVerifiedAt is older than 180 days", () => {
    const task = JSON.parse(JSON.stringify(baseMockTask)) as TaskContent;
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 185);
    task.national.lastVerifiedAt = oldDate.toISOString();

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("stale")));
  });

  it("gate validation: fails when total word count is below 400 words", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task = JSON.parse(JSON.stringify(baseMockTask)) as any;
    task.description = "Short";
    task.national.summary = "Short";
    task.national.steps = [
      {
        stepNumber: 1,
        title: "S1",
        description: "D1",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        stepNumber: 2,
        title: "S2",
        description: "D2",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        stepNumber: 3,
        title: "S3",
        description: "D3",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        stepNumber: 4,
        title: "S4",
        description: "D4",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        stepNumber: 5,
        title: "S5",
        description: "D5",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
    ];
    task.national.documentRequirements = [
      {
        name: "Doc1",
        description: "Desc1",
        requirementType: "required",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        name: "Doc2",
        description: "Desc2",
        requirementType: "required",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        name: "Doc3",
        description: "Desc3",
        requirementType: "required",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        name: "Doc4",
        description: "Desc4",
        requirementType: "required",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        name: "Doc5",
        description: "Desc5",
        requirementType: "required",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
    ];
    task.national.fees = [
      {
        label: "F1",
        amount: 10,
        currency: "INR",
        paymentMode: "online",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
    ];
    task.national.faqItems = [
      {
        question: "Q1",
        answer: "A1",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        question: "Q2",
        answer: "A2",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
      {
        question: "Q3",
        answer: "A3",
        status: "PUBLISHED",
        lastVerifiedAt: new Date().toISOString(),
        sourceUrl: "https://parivahan.gov.in",
      },
    ];

    const result = evaluatePublishingGate(task.national, task);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some((v) => v.includes("Thin content word count")));
  });

  it("SEO metadata integration: enforces noindex when page fails thin-content gate", () => {
    const meta = generateTaskMetadata({
      taskSlug: "learner-licence",
      taskName: "Learner Licence",
      passesThinContentGate: false,
    });

    assert.deepStrictEqual(
      meta.robots,
      { index: false, follow: true },
      "Pages failing the publishing gate must be marked noindex to protect domain quality"
    );
  });

  it("production audit: 100% of tasks in src/content/tasks pass the publishing gate", () => {
    const tasksDir = path.join(process.cwd(), "src/content/tasks");
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(tasksDir, file), "utf8")) as TaskContent;

      const result = evaluatePublishingGate(content.national, content);
      assert.strictEqual(
        result.passed,
        true,
        `Task ${file} must pass the publishing gate. Violations: ${result.violations.join(", ")}`
      );
      assert.ok(result.metrics.wordCount >= 400, `Task ${file} must have at least 400 words`);
    }
  });

  it("package.json includes content:gate npm script", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );
    assert.ok(packageJson.scripts["content:gate"], "package.json must define content:gate script");
  });
});
