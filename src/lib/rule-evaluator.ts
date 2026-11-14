/**
 * Rule Evaluator for Conditional Citizen Document Requirements.
 * Evaluates json rules against user-provided citizen profile answers
 * (e.g. age, marital status, vehicle type, applicant state).
 */

export type ComparisonOperator = "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "in" | "nin";

export interface ValueComparison {
  eq?: unknown;
  ne?: unknown;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  in?: unknown[];
  nin?: unknown[];
}

export type FieldRule = unknown | ValueComparison;

export interface LogicalRule {
  and?: Rule[];
  or?: Rule[];
  not?: Rule;
}

export type Rule = boolean | null | undefined | (LogicalRule & Record<string, unknown>);

export type Answers = Record<string, unknown>;

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function evaluateFieldRule(fieldRule: unknown, actualValue: unknown): boolean {
  // Direct primitive equality (e.g. {"maritalStatus": "married"} or {"hasAadhaar": true})
  if (!isObject(fieldRule)) {
    return actualValue === fieldRule;
  }

  const comparison = fieldRule as ValueComparison;
  let hasOperators = false;

  // Equality: eq
  if ("eq" in comparison) {
    hasOperators = true;
    if (actualValue !== comparison.eq) return false;
  }

  // Inequality: ne
  if ("ne" in comparison) {
    hasOperators = true;
    if (actualValue === comparison.ne) return false;
  }

  // Less than: lt
  if ("lt" in comparison && typeof comparison.lt === "number") {
    hasOperators = true;
    if (typeof actualValue !== "number" || actualValue >= comparison.lt) {
      return false;
    }
  }

  // Less than or equal: lte
  if ("lte" in comparison && typeof comparison.lte === "number") {
    hasOperators = true;
    if (typeof actualValue !== "number" || actualValue > comparison.lte) {
      return false;
    }
  }

  // Greater than: gt
  if ("gt" in comparison && typeof comparison.gt === "number") {
    hasOperators = true;
    if (typeof actualValue !== "number" || actualValue <= comparison.gt) {
      return false;
    }
  }

  // Greater than or equal: gte
  if ("gte" in comparison && typeof comparison.gte === "number") {
    hasOperators = true;
    if (typeof actualValue !== "number" || actualValue < comparison.gte) {
      return false;
    }
  }

  // In array: in
  if ("in" in comparison && Array.isArray(comparison.in)) {
    hasOperators = true;
    if (!comparison.in.includes(actualValue)) {
      return false;
    }
  }

  // Not in array: nin
  if ("nin" in comparison && Array.isArray(comparison.nin)) {
    hasOperators = true;
    if (comparison.nin.includes(actualValue)) {
      return false;
    }
  }

  // If object had no recognized operators, fallback to deep or reference equality
  if (!hasOperators) {
    return JSON.stringify(fieldRule) === JSON.stringify(actualValue);
  }

  return true;
}

/**
 * Evaluates an `appliesWhen` rule against a set of user answers.
 * Returns true if the rule is satisfied or if rule is null/undefined/true.
 */
export function evaluate(rule: Rule, answers: Answers = {}): boolean {
  // If rule is omitted, null, or true, document applies unconditionally to all citizens
  if (rule === null || rule === undefined || rule === true) {
    return true;
  }

  if (rule === false) {
    return false;
  }

  if (!isObject(rule)) {
    return false;
  }

  // Logical operator: AND
  if ("and" in rule && Array.isArray(rule.and)) {
    return rule.and.every((subRule) => evaluate(subRule, answers));
  }

  // Logical operator: OR
  if ("or" in rule && Array.isArray(rule.or)) {
    return rule.or.some((subRule) => evaluate(subRule, answers));
  }

  // Logical operator: NOT
  if ("not" in rule && rule.not !== undefined) {
    return !evaluate(rule.not as Rule, answers);
  }

  // Field-based rules (e.g. { "maritalStatus": "married", "applicantAge": { "gte": 40 } })
  for (const [key, fieldRule] of Object.entries(rule)) {
    const actualValue = answers[key];
    if (!evaluateFieldRule(fieldRule, actualValue)) {
      return false;
    }
  }

  return true;
}
