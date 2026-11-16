import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 124: Mobile Personalization Wizard & Instant Document Filtering", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const wizardPath = path.join(
    mobileDir,
    "components",
    "wizard",
    "MobilePersonalizationWizard.tsx"
  );
  const taskDetailPath = path.join(mobileDir, "app", "task", "[slug].tsx");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wizardModule: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let evaluate: any;

  before(async () => {
    const wizardDataPath = path.join(mobileDir, "components", "wizard", "wizard-data.ts");
    wizardModule = await import(wizardDataPath);

    const utilsPath = path.join(process.cwd(), "packages", "utils", "src", "index.ts");
    const utilsModule = await import(utilsPath);
    evaluate = utilsModule.evaluate;
  });

  test("1. Wizard file exists and defines 4 citizen questions", () => {
    assert.ok(fs.existsSync(wizardPath), "MobilePersonalizationWizard.tsx must exist");
    const { WIZARD_QUESTIONS } = wizardModule;

    assert.equal(WIZARD_QUESTIONS.length, 4, "Must define exactly 4 questions");

    // Question 1: Age
    const ageQ = WIZARD_QUESTIONS[0];
    assert.equal(ageQ.id, "age");
    assert.match(ageQ.title, /Applicant Age/i);
    assert.ok(
      ageQ.options.some((o: { values: Record<string, unknown> }) => o.values.applicantAge === 25)
    );
    assert.ok(
      ageQ.options.some((o: { values: Record<string, unknown> }) => o.values.applicantAge === 45)
    );

    // Question 2: Vehicle Class
    const vehQ = WIZARD_QUESTIONS[1];
    assert.equal(vehQ.id, "vehicleClass");
    assert.match(vehQ.title, /Vehicle Class/i);
    assert.ok(
      vehQ.options.some(
        (o: { values: Record<string, unknown> }) => o.values.vehicleClass === "two_wheeler"
      )
    );
    assert.ok(
      vehQ.options.some(
        (o: { values: Record<string, unknown> }) => o.values.vehicleClass === "four_wheeler"
      )
    );

    // Question 3: Commercial / Transport
    const commQ = WIZARD_QUESTIONS[2];
    assert.equal(commQ.id, "commercial");
    assert.match(commQ.title, /Commercial \/ Transport/i);
    assert.ok(
      commQ.options.some((o: { values: Record<string, unknown> }) => o.values.commercial === false)
    );
    assert.ok(
      commQ.options.some((o: { values: Record<string, unknown> }) => o.values.commercial === true)
    );

    // Question 4: State Jurisdiction
    const stateQ = WIZARD_QUESTIONS[3];
    assert.equal(stateQ.id, "state");
    assert.match(stateQ.title, /State/i);
    assert.ok(
      stateQ.options.some((o: { values: Record<string, unknown> }) => o.values.stateCode === "GJ")
    );
    assert.ok(
      stateQ.options.some(
        (o: { values: Record<string, unknown> }) => o.values.stateCode === "NATIONAL"
      )
    );
  });

  test("2. Wizard UI supports step navigation, radio selection, and apply controls", () => {
    const content = fs.readFileSync(wizardPath, "utf-8");

    // Steps & counter
    assert.match(content, /currentStep/);
    assert.match(content, /Question \{currentStep \+ 1\} of \{WIZARD_QUESTIONS\.length\}/);
    assert.match(content, /stepSegment/);

    // Navigation buttons
    assert.match(content, /handleNext/);
    assert.match(content, /handlePrev/);
    assert.match(content, /Apply & Filter/);
    assert.match(content, /Back/);

    // Option selection
    assert.match(content, /handleSelectOption/);
    assert.match(content, /radioCircle/);
    assert.match(content, /optionCardSelected/);
  });

  test("3. Rule evaluator correctly filters documents based on wizard answers", () => {
    const docForm1A = {
      id: "doc-4",
      name: "Form 1A Medical Certificate",
      appliesWhen: {
        or: [{ applicantAge: { gte: 40 } }, { commercial: true }],
      },
    };

    // Case A: 25 years old, private non-transport -> Form 1-A does NOT apply
    const answersYoungPrivate = { applicantAge: 25, commercial: false };
    const appliesA = evaluate(docForm1A.appliesWhen, answersYoungPrivate);
    assert.equal(appliesA, false, "Form 1-A should not apply for 25yo private driver");

    // Case B: 45 years old, private non-transport -> Form 1-A DOES apply
    const answersOlderPrivate = { applicantAge: 45, commercial: false };
    const appliesB = evaluate(docForm1A.appliesWhen, answersOlderPrivate);
    assert.equal(appliesB, true, "Form 1-A must apply for applicant aged 40+");

    // Case C: 22 years old, commercial transport -> Form 1-A DOES apply
    const answersYoungCommercial = { applicantAge: 22, commercial: true };
    const appliesC = evaluate(docForm1A.appliesWhen, answersYoungCommercial);
    assert.equal(appliesC, true, "Form 1-A must apply for commercial transport regardless of age");
  });

  test("4. Task detail screen mounts MobilePersonalizationWizard and filters documents list", () => {
    assert.ok(fs.existsSync(taskDetailPath), "Task detail screen must exist");
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /MobilePersonalizationWizard/);
    assert.match(content, /wizardAnswers/);
    assert.match(content, /activeFilterCount/);
    assert.match(content, /filteredDocuments/);
    assert.match(content, /Personalize Checklist/);
    assert.match(content, /setShowWizardModal/);
  });

  test("5. Complies with design tokens, minTouchTarget >= 44pt, and accessibility standards", () => {
    const content = fs.readFileSync(wizardPath, "utf-8");

    assert.match(content, /layout\.minTouchTarget/);
    assert.match(content, /accessibilityRole="button"/);
    assert.match(content, /accessibilityState=\{\{\s*selected\s*\}\}/);
    assert.match(content, /colors\.primary/);
    assert.match(content, /colors\.surface/);
  });
});
