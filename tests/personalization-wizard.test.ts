import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { evaluate, type Rule } from "../src/lib/rule-evaluator.ts";

describe("Personalisation Wizard & Conditional Document Filtering", () => {
  it("filters driving licence documents by applicant age and category", () => {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "src/content/tasks/driving-licence-learner.json"),
      "utf-8"
    );
    const task = JSON.parse(raw);
    const docs = task.national.documentRequirements;
    assert.strictEqual(docs.length, 5);

    // Scenario A: Young adult applying for private motorcycle/car (age 24, non-transport)
    const answersYoung = { applicantAge: 24, licenceCategory: "non_transport" };
    const filteredYoung = docs.filter((d: { appliesWhen?: unknown }) =>
      evaluate(d.appliesWhen as Rule, answersYoung)
    );
    assert.strictEqual(
      filteredYoung.length,
      4,
      "Form 1A should be excluded for applicants under 40"
    );
    assert.ok(
      !filteredYoung.some((d: { name: string }) => d.name.includes("Form 1A")),
      "Should not include Form 1A"
    );

    // Scenario B: Senior applicant aged 45 (Form 1A mandatory)
    const answersSenior = { applicantAge: 45, licenceCategory: "non_transport" };
    const filteredSenior = docs.filter((d: { appliesWhen?: unknown }) =>
      evaluate(d.appliesWhen as Rule, answersSenior)
    );
    assert.strictEqual(
      filteredSenior.length,
      5,
      "Form 1A must be included for applicants 40 or older"
    );
    assert.ok(
      filteredSenior.some((d: { name: string }) => d.name.includes("Form 1A")),
      "Must include Form 1A Medical Certificate"
    );

    // Scenario C: Commercial driver aged 28
    const answersCommercial = { applicantAge: 28, licenceCategory: "commercial_transport" };
    const filteredCommercial = docs.filter((d: { appliesWhen?: unknown }) =>
      evaluate(d.appliesWhen as Rule, answersCommercial)
    );
    assert.strictEqual(
      filteredCommercial.length,
      5,
      "Form 1A must be included for commercial drivers"
    );
  });

  it("filters passport renewal documents based on scheme and address change", () => {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "src/content/tasks/passport-renewal.json"),
      "utf-8"
    );
    const task = JSON.parse(raw);
    const docs = task.national.documentRequirements;
    assert.strictEqual(docs.length, 7);

    // Scenario A: Normal renewal at same address, no spouse addition, Non-ECR eligible
    const answersNormal = {
      scheme: "normal",
      addressChanged: false,
      nonEcrEligible: true,
      addSpouse: false,
    };
    const filteredNormal = docs.filter((d: { appliesWhen?: unknown }) =>
      evaluate(d.appliesWhen as Rule, answersNormal)
    );
    assert.strictEqual(
      filteredNormal.length,
      3,
      "Only Old Passport, Photocopy, and Non-ECR proof needed"
    );

    // Scenario B: Tatkaal renewal with address change and spouse endorsement
    const answersTatkaal = {
      scheme: "tatkaal",
      addressChanged: true,
      nonEcrEligible: true,
      addSpouse: true,
    };
    const filteredTatkaal = docs.filter((d: { appliesWhen?: unknown }) =>
      evaluate(d.appliesWhen as Rule, answersTatkaal)
    );
    assert.strictEqual(
      filteredTatkaal.length,
      6,
      "All 6 documents required under Tatkaal with new address and spouse"
    );
  });
});
