/**
 * Shared Utilities for Civic Paperwork: Freshness and Rule Evaluator
 */

// ==========================================
// 1. FRESHNESS LOGIC
// ==========================================

export type FreshnessStatus = "fresh" | "aging" | "stale";

export interface FreshnessInfo {
  status: FreshnessStatus;
  badgeVariant: "verified" | "needs-update";
  label: string;
  daysSince: number;
  formattedDate: string;
  isStale: boolean;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const ONE_EIGHTY_DAYS_MS = 180 * 24 * 60 * 60 * 1000;

export function getFreshnessInfo(
  lastVerifiedAt: string | Date | null | undefined,
  referenceDate: Date = new Date()
): FreshnessInfo {
  if (!lastVerifiedAt) {
    return {
      status: "stale",
      badgeVariant: "needs-update",
      label: "Verification Needed",
      daysSince: 999,
      formattedDate: "Not verified",
      isStale: true,
    };
  }

  const verifiedDate =
    typeof lastVerifiedAt === "string" ? new Date(lastVerifiedAt) : lastVerifiedAt;

  if (isNaN(verifiedDate.getTime())) {
    return {
      status: "stale",
      badgeVariant: "needs-update",
      label: "Invalid Verification Date",
      daysSince: 999,
      formattedDate: "Unknown",
      isStale: true,
    };
  }

  const diffMs = referenceDate.getTime() - verifiedDate.getTime();
  const daysSince = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  const formattedDate = verifiedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (diffMs <= NINETY_DAYS_MS) {
    return {
      status: "fresh",
      badgeVariant: "verified",
      label: `Verified (${formattedDate})`,
      daysSince,
      formattedDate,
      isStale: false,
    };
  }

  if (diffMs <= ONE_EIGHTY_DAYS_MS) {
    return {
      status: "aging",
      badgeVariant: "needs-update",
      label: `Verified ${daysSince} days ago`,
      daysSince,
      formattedDate,
      isStale: false,
    };
  }

  return {
    status: "stale",
    badgeVariant: "needs-update",
    label: `Awaiting 2026 Revision (${formattedDate})`,
    daysSince,
    formattedDate,
    isStale: true,
  };
}

export function isFresh(
  lastVerifiedAt: string | Date | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  return getFreshnessInfo(lastVerifiedAt, referenceDate).status === "fresh";
}

export function isStale(
  lastVerifiedAt: string | Date | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  return getFreshnessInfo(lastVerifiedAt, referenceDate).isStale;
}

// ==========================================
// 2. APPLIES-WHEN RULE EVALUATOR
// ==========================================

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
  if (!isObject(fieldRule)) {
    return actualValue === fieldRule;
  }

  const comparison = fieldRule as ValueComparison;

  if ("eq" in comparison) {
    if (actualValue !== comparison.eq) return false;
  }

  if ("ne" in comparison) {
    if (actualValue === comparison.ne) return false;
  }

  if ("lt" in comparison && typeof comparison.lt === "number") {
    if (typeof actualValue !== "number" || actualValue >= comparison.lt) {
      return false;
    }
  }

  if ("lte" in comparison && typeof comparison.lte === "number") {
    if (typeof actualValue !== "number" || actualValue > comparison.lte) {
      return false;
    }
  }

  if ("gt" in comparison && typeof comparison.gt === "number") {
    if (typeof actualValue !== "number" || actualValue <= comparison.gt) {
      return false;
    }
  }

  if ("gte" in comparison && typeof comparison.gte === "number") {
    if (typeof actualValue !== "number" || actualValue < comparison.gte) {
      return false;
    }
  }

  if ("in" in comparison && Array.isArray(comparison.in)) {
    if (!comparison.in.includes(actualValue)) {
      return false;
    }
  }

  if ("nin" in comparison && Array.isArray(comparison.nin)) {
    if (comparison.nin.includes(actualValue)) {
      return false;
    }
  }

  return true;
}

export function evaluate(rule: Rule, answers: Answers = {}): boolean {
  if (rule === true || rule === undefined || rule === null) return true;
  if (rule === false) return false;
  if (!isObject(rule)) return true;

  if (Array.isArray(rule.and)) {
    const andPass = rule.and.every((subRule) => evaluate(subRule, answers));
    if (!andPass) return false;
  }

  if (Array.isArray(rule.or)) {
    const orPass = rule.or.some((subRule) => evaluate(subRule, answers));
    if (!orPass) return false;
  }

  if ("not" in rule && rule.not !== undefined) {
    const notPass = !evaluate(rule.not, answers);
    if (!notPass) return false;
  }

  for (const [key, fieldRule] of Object.entries(rule)) {
    if (key === "and" || key === "or" || key === "not") continue;
    const actualVal = answers[key];
    if (!evaluateFieldRule(fieldRule, actualVal)) {
      return false;
    }
  }

  return true;
}
