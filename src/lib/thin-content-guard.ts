import type { TaskContent, TaskVariant } from "@/types/content";
import type { MergedTaskVariant } from "./queries";

export const THIN_CONTENT_CRITERIA = {
  MIN_DOCUMENTS: 5,
  MIN_STEPS: 5,
  MIN_FAQS: 3,
  MIN_OFFICIAL_LINKS: 1,
  MAX_VERIFICATION_AGE_DAYS: 180,
  MIN_WORD_COUNT: 400,
} as const;

export interface ThinContentMetrics {
  documentCount: number;
  stepCount: number;
  hasFeeInfo: boolean;
  faqCount: number;
  officialLinkCount: number;
  daysSinceVerification: number;
  wordCount: number;
}

export interface ThinContentCheckResult {
  passed: boolean;
  taskSlug: string;
  stateSlug?: string;
  pageTitle: string;
  metrics: ThinContentMetrics;
  violations: string[];
}

/**
 * Counts words in a string, stripping markup and whitespace.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter((word) => word.length > 0).length;
}

/**
 * Calculates total readable word count across all sections of a task variant.
 */
export function calculateVariantWordCount(
  task: Pick<TaskContent, "name" | "description">,
  variant: MergedTaskVariant | TaskVariant
): number {
  const parts: string[] = [
    task.name || "",
    task.description || "",
    variant.title || "",
    variant.summary || "",
  ];

  // Steps
  if (Array.isArray(variant.steps)) {
    for (const step of variant.steps) {
      parts.push(step.title || "");
      parts.push(step.description || "");
      if (step.calloutText) parts.push(step.calloutText);
    }
  }

  // Documents
  if (Array.isArray(variant.documentRequirements)) {
    for (const doc of variant.documentRequirements) {
      parts.push(doc.name || "");
      parts.push(doc.description || "");
      if (doc.specs?.instructions) {
        parts.push(doc.specs.instructions.join(" "));
      }
    }
  }

  // Fees
  if (Array.isArray(variant.fees)) {
    for (const fee of variant.fees) {
      parts.push(fee.label || "");
      if (fee.rulesReference) parts.push(fee.rulesReference);
    }
  }

  // FAQs
  if (Array.isArray(variant.faqItems)) {
    for (const faq of variant.faqItems) {
      parts.push(faq.question || "");
      parts.push(faq.answer || "");
    }
  }

  // Rejection reasons / mistakes
  if (Array.isArray(variant.rejectionReasons)) {
    for (const reason of variant.rejectionReasons) {
      parts.push(reason.title || "");
      parts.push(reason.description || "");
      parts.push(reason.solution || "");
    }
  }

  // Official links
  if (Array.isArray(variant.officialLinks)) {
    for (const link of variant.officialLinks) {
      parts.push(link.label || "");
      if (link.department) parts.push(link.department);
      if (link.portalName) parts.push(link.portalName);
    }
  }

  return countWords(parts.join(" "));
}

/**
 * Evaluates whether a task page variant passes the thin-content publishing gate (Prompt 83).
 *
 * Requirements to be PUBLISHED and indexed:
 * 1. At least 5 documents
 * 2. At least 5 steps
 * 3. Fee info or explicit "no fee"
 * 4. At least 3 FAQs
 * 5. At least 1 official government link
 * 6. Verified date within 180 days
 * 7. 400+ words of unique text
 */
export function evaluatePublishingGate(
  variant: MergedTaskVariant | TaskVariant,
  task: TaskContent,
  options?: { currentDate?: Date; stateSlug?: string }
): ThinContentCheckResult {
  const violations: string[] = [];
  const currentDate = options?.currentDate || new Date();

  // 1. Documents (>= 5)
  const docCount = variant.documentRequirements?.length || 0;
  if (docCount < THIN_CONTENT_CRITERIA.MIN_DOCUMENTS) {
    violations.push(
      `Insufficient documents: has ${docCount}, minimum required is ${THIN_CONTENT_CRITERIA.MIN_DOCUMENTS}`
    );
  }

  // 2. Steps (>= 5)
  const stepCount = variant.steps?.length || 0;
  if (stepCount < THIN_CONTENT_CRITERIA.MIN_STEPS) {
    violations.push(
      `Insufficient steps: has ${stepCount}, minimum required is ${THIN_CONTENT_CRITERIA.MIN_STEPS}`
    );
  }

  // 3. Fee info or explicit "no fee"
  const hasFeeInfo =
    (variant.fees && variant.fees.length > 0) ||
    Boolean((variant as { isFree?: boolean }).isFree) ||
    variant.summary?.toLowerCase().includes("free") ||
    variant.summary?.toLowerCase().includes("no fee") ||
    false;

  if (!hasFeeInfo) {
    violations.push("Missing statutory fee information or explicit 'no fee' declaration");
  }

  // 4. FAQs (>= 3)
  const faqCount = variant.faqItems?.length || 0;
  if (faqCount < THIN_CONTENT_CRITERIA.MIN_FAQS) {
    violations.push(
      `Insufficient FAQs: has ${faqCount}, minimum required is ${THIN_CONTENT_CRITERIA.MIN_FAQS}`
    );
  }

  // 5. Official Link (>= 1)
  const linkCount = variant.officialLinks?.length || 0;
  if (linkCount < THIN_CONTENT_CRITERIA.MIN_OFFICIAL_LINKS) {
    violations.push(
      `Missing official portal link: has ${linkCount}, minimum required is ${THIN_CONTENT_CRITERIA.MIN_OFFICIAL_LINKS}`
    );
  }

  // 6. Verification age (within 180 days)
  let daysSinceVerification = 999;
  if (variant.lastVerifiedAt) {
    const verifiedDate = new Date(variant.lastVerifiedAt);
    if (!isNaN(verifiedDate.getTime())) {
      const diffMs = currentDate.getTime() - verifiedDate.getTime();
      daysSinceVerification = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  if (daysSinceVerification > THIN_CONTENT_CRITERIA.MAX_VERIFICATION_AGE_DAYS) {
    violations.push(
      `Verification is stale: last verified ${daysSinceVerification} days ago (maximum allowed: ${THIN_CONTENT_CRITERIA.MAX_VERIFICATION_AGE_DAYS} days)`
    );
  }

  // 7. Word count (>= 400)
  const wordCount = calculateVariantWordCount(task, variant);
  if (wordCount < THIN_CONTENT_CRITERIA.MIN_WORD_COUNT) {
    violations.push(
      `Thin content word count: ${wordCount} words, minimum required is ${THIN_CONTENT_CRITERIA.MIN_WORD_COUNT} words`
    );
  }

  const passed = violations.length === 0;

  return {
    passed,
    taskSlug: task.slug,
    stateSlug: options?.stateSlug,
    pageTitle: variant.title || task.name,
    metrics: {
      documentCount: docCount,
      stepCount: stepCount,
      hasFeeInfo,
      faqCount,
      officialLinkCount: linkCount,
      daysSinceVerification,
      wordCount,
    },
    violations,
  };
}

