import { describe, it } from "node:test";
import assert from "node:assert";
import {
  FeeSchema,
  OfficialLinkSchema,
  TaskContentSchema,
  DocumentRequirementSchema,
} from "../src/types/content.ts";

describe("Content Zod Schemas Validation", () => {
  it("validates Fee with proper rupee amount", () => {
    const validFee = {
      label: "Learner's Licence Computerized Test Fee",
      amount: 50,
      paymentMode: "online",
      rulesReference: "CMVR Rule 32",
    };
    const parsed = FeeSchema.safeParse(validFee);
    assert.strictEqual(parsed.success, true);
  });

  it("fails Fee with human-readable error when amount is negative or not a number", () => {
    const invalidFee = {
      label: "Test Fee",
      amount: -10,
    };
    const parsed = FeeSchema.safeParse(invalidFee);
    assert.strictEqual(parsed.success, false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path.includes("amount"));
      assert.ok(issue);
      assert.match(issue.message, /rupees/i);
    }
  });

  it("validates official link begins with http/https", () => {
    const validLink = {
      label: "Sarathi Parivahan Portal",
      url: "https://sarathi.parivahan.gov.in",
      isPrimary: true,
    };
    const parsed = OfficialLinkSchema.safeParse(validLink);
    assert.strictEqual(parsed.success, true);

    const invalidLink = {
      label: "Fake Portal",
      url: "ftp://files.gov.in",
    };
    const failedParse = OfficialLinkSchema.safeParse(invalidLink);
    assert.strictEqual(failedParse.success, false);
  });

  it("validates document requirement with conditional appliesWhen rule", () => {
    const docWithRule = {
      name: "Form 1A Medical Certificate",
      requirementType: "conditional",
      appliesWhen: { applicantAge: { gte: 40 } },
      copiesHint: "Original doctor signed copy",
    };
    const parsed = DocumentRequirementSchema.safeParse(docWithRule);
    assert.strictEqual(parsed.success, true);
  });

  it("validates full TaskContent authoring format with national default and state overrides", () => {
    const taskData = {
      slug: "driving-licence-learner",
      name: "Learner's Licence Application",
      description: "How to apply for an LLR driving permit across India.",
      categorySlug: "vehicles",
      national: {
        title: "Learner's Licence: National Procedure",
        summary:
          "Official steps, required documents, and ₹200 fee for obtaining a learner permit in India.",
        estimatedTime: "15-30 days",
        difficulty: "easy",
        status: "PUBLISHED",
        steps: [
          {
            stepNumber: 1,
            title: "Submit Online Application",
            description: "Fill Form 2 on Sarathi Parivahan portal with Aadhaar e-KYC.",
            where: "Online Portal",
          },
        ],
        documentRequirements: [
          {
            name: "Proof of Age",
            requirementType: "required",
            copiesHint: "Original + 1 photocopy",
          },
        ],
        fees: [
          {
            label: "Application Processing Fee",
            amount: 150,
            paymentMode: "online",
          },
          {
            label: "Computerized Test Fee",
            amount: 50,
            paymentMode: "online",
          },
        ],
        officialLinks: [
          {
            label: "Sarathi Parivahan",
            url: "https://sarathi.parivahan.gov.in",
            isPrimary: true,
          },
        ],
      },
      states: {
        GJ: {
          title: "Gujarat Learner's Licence (LLR) Online",
          summary:
            "Gujarat allows completely faceless Aadhaar e-KYC application with online computerized home test.",
        },
      },
    };

    const parsed = TaskContentSchema.safeParse(taskData);
    assert.strictEqual(parsed.success, true);
  });
});
