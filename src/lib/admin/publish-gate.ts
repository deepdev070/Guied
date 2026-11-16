import type { TaskContent } from "../../types/content.ts";
import {
  evaluatePublishingGate,
  THIN_CONTENT_CRITERIA,
  type ThinContentCheckResult,
} from "../thin-content-guard.ts";

export interface PublishGateCheckItem {
  id: string;
  label: string;
  passed: boolean;
  currentValue: string | number;
  requiredValue: string | number;
  description: string;
}

export interface PublishGateReport {
  canPublish: boolean;
  currentStatus: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  targetStatus: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  checklist: PublishGateCheckItem[];
  violations: string[];
  rawResult: ThinContentCheckResult;
}

/**
 * Runs the comprehensive thin-content publish gate on a guide before publishing
 */
export function runPublishGate(
  task: TaskContent,
  targetStatus: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED" = "PUBLISHED"
): PublishGateReport {
  const rawResult = evaluatePublishingGate(task.national, task);
  const metrics = rawResult.metrics;

  const checklist: PublishGateCheckItem[] = [
    {
      id: "documents",
      label: "Required Documents",
      passed: metrics.documentCount >= THIN_CONTENT_CRITERIA.MIN_DOCUMENTS,
      currentValue: metrics.documentCount,
      requiredValue: THIN_CONTENT_CRITERIA.MIN_DOCUMENTS,
      description: "Checklist of documents citizen must bring or upload",
    },
    {
      id: "steps",
      label: "Procedure Steps",
      passed: metrics.stepCount >= THIN_CONTENT_CRITERIA.MIN_STEPS,
      currentValue: metrics.stepCount,
      requiredValue: THIN_CONTENT_CRITERIA.MIN_STEPS,
      description: "Sequential step-by-step instructions from start to finish",
    },
    {
      id: "fees",
      label: "Statutory Fees",
      passed: metrics.hasFeeInfo,
      currentValue: metrics.hasFeeInfo ? "Declared" : "Missing",
      requiredValue: "Declared",
      description: "Official fees schedule or explicit ₹0 / no-fee declaration",
    },
    {
      id: "faqs",
      label: "Frequently Asked Questions",
      passed: metrics.faqCount >= THIN_CONTENT_CRITERIA.MIN_FAQS,
      currentValue: metrics.faqCount,
      requiredValue: THIN_CONTENT_CRITERIA.MIN_FAQS,
      description: "Frequently asked questions answering citizen concerns",
    },
    {
      id: "links",
      label: "Official Government Link",
      passed: metrics.officialLinkCount >= THIN_CONTENT_CRITERIA.MIN_OFFICIAL_LINKS,
      currentValue: metrics.officialLinkCount,
      requiredValue: THIN_CONTENT_CRITERIA.MIN_OFFICIAL_LINKS,
      description: "At least 1 authentic official .gov.in or .nic.in portal URL",
    },
    {
      id: "freshness",
      label: "Verification Freshness",
      passed: metrics.daysSinceVerification <= THIN_CONTENT_CRITERIA.MAX_VERIFICATION_AGE_DAYS,
      currentValue: `${metrics.daysSinceVerification} days ago`,
      requiredValue: `<= ${THIN_CONTENT_CRITERIA.MAX_VERIFICATION_AGE_DAYS} days`,
      description: "Verification date must be within 180 days",
    },
    {
      id: "words",
      label: "Substantive Word Count",
      passed: metrics.wordCount >= THIN_CONTENT_CRITERIA.MIN_WORD_COUNT,
      currentValue: `${metrics.wordCount} words`,
      requiredValue: `>= ${THIN_CONTENT_CRITERIA.MIN_WORD_COUNT} words`,
      description: "Comprehensive substantive guide content to avoid thin content",
    },
  ];

  const canPublish = rawResult.passed;

  return {
    canPublish,
    currentStatus: task.national?.status || "DRAFT",
    targetStatus,
    checklist,
    violations: rawResult.violations,
    rawResult,
  };
}
