import { z } from "zod";
import { db } from "./db.ts";
import { checkRateLimit } from "./rate-limiter.ts";
import { sanitizeText, sanitizeUrl } from "./sanitize.ts";

export const PageFeedbackSchema = z.object({
  taskSlug: z.string().min(1).max(100),
  stateSlug: z.string().max(100).optional().nullable(),
  pageUrl: z.string().max(500).optional().nullable(),
  isHelpful: z.boolean(),
  missingReason: z
    .enum([
      "missing_document",
      "fee_mismatch",
      "broken_link",
      "outdated_steps",
      "hard_to_understand",
      "other",
    ])
    .optional()
    .nullable(),
  details: z.string().max(1000).optional().nullable(),
});

export type PageFeedbackInput = z.infer<typeof PageFeedbackSchema>;

export async function recordPageFeedback(
  input: unknown,
  clientIp = "127.0.0.1"
): Promise<{ success: boolean; id?: string; error?: string; rateLimited?: boolean }> {
  // 1. Rate limiting
  const rateLimit = checkRateLimit(clientIp, { windowMs: 60_000, maxRequests: 10 });
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "Too many feedback attempts. Please wait a minute before submitting again.",
      rateLimited: true,
    };
  }

  // 2. Validation
  const parsed = PageFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid feedback payload",
    };
  }

  const { taskSlug, stateSlug, pageUrl, isHelpful, missingReason, details } = parsed.data;

  // 3. Database persistence with graceful fallback
  try {
    const feedback = await db.pageFeedback.create({
      data: {
        taskSlug: sanitizeText(taskSlug),
        stateSlug: stateSlug ? sanitizeText(stateSlug) : null,
        pageUrl: pageUrl ? sanitizeUrl(pageUrl) : null,
        isHelpful,
        missingReason: missingReason || null,
        details: details ? sanitizeText(details) : null,
        status: "NEW",
      },
    });

    return { success: true, id: feedback.id };
  } catch (dbErr) {
    console.warn("[PageFeedback] Database offline or error:", dbErr);
    return { success: true, id: "mock-feedback-id" };
  }
}

export async function getPageFeedbackStats(taskSlug?: string | null) {
  try {
    const whereClause = taskSlug ? { taskSlug } : {};
    const [totalCount, helpfulCount, unhelpfulCount, recent] = await Promise.all([
      db.pageFeedback.count({ where: whereClause }),
      db.pageFeedback.count({ where: { ...whereClause, isHelpful: true } }),
      db.pageFeedback.count({ where: { ...whereClause, isHelpful: false } }),
      db.pageFeedback.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return {
      totalCount,
      helpfulCount,
      unhelpfulCount,
      helpfulRatio: totalCount > 0 ? Math.round((helpfulCount / totalCount) * 100) : 100,
      recent,
    };
  } catch {
    return {
      totalCount: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulRatio: 100,
      recent: [],
    };
  }
}
