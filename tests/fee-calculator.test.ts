import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FeeCalculatorConfigSchema, type FeeCalculatorConfig } from "../src/types/content.ts";

describe("Prompt 69: Total Cost Calculator", () => {
  const samplePassportCalculator: FeeCalculatorConfig = {
    title: "Passport Re-issue Fee Calculator",
    description:
      "Select application urgency (Normal vs Tatkaal), booklet pages, and applicant age.",
    baseFee: 1500,
    baseFeeLabel: "Standard Passport Re-issue (36 Pages Booklet, Adult)",
    rulesReference: "Passports Rules 1980 Schedule IV",
    officialSourceUrl: "https://passportindia.gov.in/AppOnlineProject/fee/feeSchedule",
    officialSourceLabel: "Ministry of External Affairs Fee Schedule",
    options: [
      {
        id: "scheme",
        label: "Processing Scheme",
        type: "scheme",
        defaultChoiceId: "normal",
        choices: [
          { id: "normal", label: "Normal Scheme (10–15 business days)", amount: 0 },
          { id: "tatkal", label: "Tatkaal Scheme (1–3 business days)", amount: 2000 },
        ],
      },
      {
        id: "pages",
        label: "Booklet Size",
        type: "pages",
        defaultChoiceId: "pages36",
        choices: [
          { id: "pages36", label: "36 Pages (Standard Booklet)", amount: 0 },
          { id: "pages60", label: "60 Pages (Jumbo Booklet)", amount: 500 },
        ],
      },
      {
        id: "applicant",
        label: "Applicant Category",
        type: "applicant",
        defaultChoiceId: "adult",
        choices: [
          { id: "adult", label: "Adult (18+ years)", amount: 0 },
          { id: "minor", label: "Minor (Below 18 years)", amount: -500 },
        ],
      },
      {
        id: "delivery",
        label: "Dispatch & Notifications",
        type: "delivery",
        defaultChoiceId: "standard_post",
        choices: [
          { id: "standard_post", label: "Speed Post Delivery", amount: 0 },
          { id: "sms_alert", label: "Speed Post + Premium SMS Tracking", amount: 50 },
        ],
      },
    ],
  };

  it("validates FeeCalculatorConfigSchema with required fields and government source URL", () => {
    const validated = FeeCalculatorConfigSchema.parse(samplePassportCalculator);
    assert.equal(validated.baseFee, 1500);
    assert.equal(validated.options.length, 4);
    assert.ok(validated.officialSourceUrl.includes(".gov.in"));
  });

  it("fails schema validation when sourceUrl is not a valid URL", () => {
    assert.throws(() => {
      FeeCalculatorConfigSchema.parse({
        ...samplePassportCalculator,
        officialSourceUrl: "not-a-url",
      });
    });
  });

  it("calculates live totals accurately for different citizen choices", () => {
    const computeTotal = (choices: Record<string, string>) => {
      let sum = samplePassportCalculator.baseFee;
      for (const opt of samplePassportCalculator.options) {
        const choiceId = choices[opt.id] || opt.defaultChoiceId;
        const choice = opt.choices.find((c) => c.id === choiceId);
        if (choice) sum += choice.amount;
      }
      return sum;
    };

    // 1. Standard default adult normal: ₹1,500
    assert.equal(
      computeTotal({
        scheme: "normal",
        pages: "pages36",
        applicant: "adult",
        delivery: "standard_post",
      }),
      1500
    );

    // 2. Tatkal adult with 36 pages: ₹1,500 + ₹2,000 = ₹3,500
    assert.equal(
      computeTotal({
        scheme: "tatkal",
        pages: "pages36",
        applicant: "adult",
        delivery: "standard_post",
      }),
      3500
    );

    // 3. Tatkal adult with 60 pages (jumbo): ₹1,500 + ₹2,000 + ₹500 = ₹4,000
    assert.equal(
      computeTotal({
        scheme: "tatkal",
        pages: "pages60",
        applicant: "adult",
        delivery: "standard_post",
      }),
      4000
    );

    // 4. Minor normal 36 pages: ₹1,500 - ₹500 = ₹1,000
    assert.equal(
      computeTotal({
        scheme: "normal",
        pages: "pages36",
        applicant: "minor",
        delivery: "standard_post",
      }),
      1000
    );

    // 5. Minor Tatkal with SMS alerts: ₹1,500 + ₹2,000 - ₹500 + ₹50 = ₹3,050
    assert.equal(
      computeTotal({
        scheme: "tatkal",
        pages: "pages36",
        applicant: "minor",
        delivery: "sms_alert",
      }),
      3050
    );
  });

  it("verifies task content JSON files include feeCalculator configurations", () => {
    const passportJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "src/content/tasks/passport-renewal.json"), "utf-8")
    );
    assert.ok(passportJson.national.feeCalculator, "passport-renewal.json must have feeCalculator");
    assert.equal(passportJson.national.feeCalculator.baseFee, 1500);
    assert.ok(passportJson.national.feeCalculator.officialSourceUrl.includes(".gov.in"));

    const learnerJson = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/content/tasks/driving-licence-learner.json"),
        "utf-8"
      )
    );
    assert.ok(
      learnerJson.national.feeCalculator,
      "driving-licence-learner.json must have feeCalculator"
    );
    assert.equal(learnerJson.national.feeCalculator.baseFee, 200);

    const newDlJson = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/content/tasks/driving-licence-new.json"),
        "utf-8"
      )
    );
    assert.ok(newDlJson.national.feeCalculator, "driving-licence-new.json must have feeCalculator");
    assert.equal(newDlJson.national.feeCalculator.baseFee, 700);
  });

  it("verifies FeeCalculator component implementation", () => {
    const compPath = path.join(process.cwd(), "src/components/task/FeeCalculator.tsx");
    assert.ok(fs.existsSync(compPath), "FeeCalculator.tsx must exist");

    const code = fs.readFileSync(compPath, "utf-8");
    assert.ok(code.includes("officialSourceUrl"), "Must link to official government fee source");
    assert.ok(code.includes("total.toLocaleString"), "Must format live total in rupees");
    assert.ok(code.includes("breakdown"), "Must display itemized cost breakdown");
  });

  it("verifies FeesSection and TaskPageView integrate FeeCalculator", () => {
    const feesSectionCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/FeesSection.tsx"),
      "utf-8"
    );
    assert.ok(
      feesSectionCode.includes("FeeCalculator"),
      "FeesSection must import and render FeeCalculator"
    );

    const taskPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskPageView.tsx"),
      "utf-8"
    );
    assert.ok(
      taskPageCode.includes("feeCalculator={variant.feeCalculator}"),
      "TaskPageView must forward feeCalculator to FeesSection"
    );
  });
});
