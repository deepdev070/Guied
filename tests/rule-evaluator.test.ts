import { describe, it } from "node:test";
import assert from "node:assert";
import { evaluate } from "../src/lib/rule-evaluator.ts";

describe("Rule Evaluator - Conditional Documents", () => {
  it("returns true for null, undefined, or empty rules (unconditional)", () => {
    assert.strictEqual(evaluate(null, {}), true);
    assert.strictEqual(evaluate(undefined, {}), true);
    assert.strictEqual(evaluate(true, {}), true);
    assert.strictEqual(evaluate({}, {}), true);
  });

  it("returns false for false rule", () => {
    assert.strictEqual(evaluate(false, {}), false);
  });

  it("evaluates direct equality (primitive)", () => {
    const rule = { maritalStatus: "married" };
    assert.strictEqual(evaluate(rule, { maritalStatus: "married" }), true);
    assert.strictEqual(evaluate(rule, { maritalStatus: "single" }), false);
    assert.strictEqual(evaluate(rule, {}), false);
  });

  it("evaluates explicit equals operator ({ eq: ... })", () => {
    const rule = { vehicleType: { eq: "motorcycle_with_gear" } };
    assert.strictEqual(evaluate(rule, { vehicleType: "motorcycle_with_gear" }), true);
    assert.strictEqual(evaluate(rule, { vehicleType: "scooter" }), false);
  });

  it("evaluates inequality operator ({ ne: ... })", () => {
    const rule = { citizenship: { ne: "foreign" } };
    assert.strictEqual(evaluate(rule, { citizenship: "indian" }), true);
    assert.strictEqual(evaluate(rule, { citizenship: "foreign" }), false);
  });

  it("evaluates 'in' operator", () => {
    const rule = { state: { in: ["GJ", "MH", "DL"] } };
    assert.strictEqual(evaluate(rule, { state: "GJ" }), true);
    assert.strictEqual(evaluate(rule, { state: "MH" }), true);
    assert.strictEqual(evaluate(rule, { state: "KA" }), false);
    assert.strictEqual(evaluate(rule, {}), false);
  });

  it("evaluates 'nin' (not in) operator", () => {
    const rule = { category: { nin: ["exempted", "diplomatic"] } };
    assert.strictEqual(evaluate(rule, { category: "regular" }), true);
    assert.strictEqual(evaluate(rule, { category: "exempted" }), false);
  });

  it("evaluates 'lt' (less than) operator", () => {
    const rule = { applicantAge: { lt: 18 } };
    assert.strictEqual(evaluate(rule, { applicantAge: 17 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 18 }), false);
    assert.strictEqual(evaluate(rule, { applicantAge: 25 }), false);
  });

  it("evaluates 'lte' (less than or equal) operator", () => {
    const rule = { applicantAge: { lte: 18 } };
    assert.strictEqual(evaluate(rule, { applicantAge: 18 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 17 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 19 }), false);
  });

  it("evaluates 'gt' (greater than) operator", () => {
    const rule = { applicantAge: { gt: 40 } };
    assert.strictEqual(evaluate(rule, { applicantAge: 41 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 40 }), false);
    assert.strictEqual(evaluate(rule, { applicantAge: 25 }), false);
  });

  it("evaluates 'gte' (greater than or equal) operator", () => {
    const rule = { applicantAge: { gte: 40 } };
    assert.strictEqual(evaluate(rule, { applicantAge: 40 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 45 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 39 }), false);
  });

  it("evaluates range comparisons (e.g. 18 <= age < 60)", () => {
    const rule = { applicantAge: { gte: 18, lt: 60 } };
    assert.strictEqual(evaluate(rule, { applicantAge: 18 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 35 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 60 }), false);
    assert.strictEqual(evaluate(rule, { applicantAge: 17 }), false);
  });

  it("evaluates logical AND operator", () => {
    const rule = {
      and: [{ applicantAge: { gte: 18 } }, { hasAadhaar: true }],
    };

    assert.strictEqual(evaluate(rule, { applicantAge: 20, hasAadhaar: true }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 16, hasAadhaar: true }), false);
    assert.strictEqual(evaluate(rule, { applicantAge: 20, hasAadhaar: false }), false);
  });

  it("evaluates logical OR operator", () => {
    const rule = {
      or: [
        { applicantAge: { gte: 60 } }, // Senior citizen
        { disability: true }, // Specially abled
      ],
    };

    assert.strictEqual(evaluate(rule, { applicantAge: 65, disability: false }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 30, disability: true }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 30, disability: false }), false);
  });

  it("evaluates logical NOT operator", () => {
    const rule = {
      not: { applicantAge: { lt: 18 } },
    };

    assert.strictEqual(evaluate(rule, { applicantAge: 20 }), true);
    assert.strictEqual(evaluate(rule, { applicantAge: 16 }), false);
  });

  it("evaluates realistic multi-condition civic scenario: Form 1A Medical Fitness Requirement", () => {
    // Form 1A is mandatory IF applicant is 40 or older OR applying for a commercial transport licence
    const form1ARule = {
      or: [{ applicantAge: { gte: 40 } }, { licenceCategory: "commercial_transport" }],
    };

    // Case 1: 42 year old applying for non-transport bike/car -> required
    assert.strictEqual(
      evaluate(form1ARule, { applicantAge: 42, licenceCategory: "non_transport" }),
      true
    );

    // Case 2: 24 year old applying for commercial bus -> required
    assert.strictEqual(
      evaluate(form1ARule, { applicantAge: 24, licenceCategory: "commercial_transport" }),
      true
    );

    // Case 3: 22 year old applying for private bike -> not required
    assert.strictEqual(
      evaluate(form1ARule, { applicantAge: 22, licenceCategory: "non_transport" }),
      false
    );
  });
});
