import { db } from "./db.ts";

export interface LogMissingPageParams {
  url: string;
  referrer?: string | null;
  userAgent?: string | null;
}

/**
 * Logs a 404 missing URL into the database MissingPage table.
 * Wrapped in try-catch so it never crashes the user experience if DB is unreachable.
 */
export async function logMissingPage({
  url,
  referrer,
  userAgent,
}: LogMissingPageParams): Promise<{ success: boolean; id?: string }> {
  if (!url || typeof url !== "string") {
    return { success: false };
  }

  const cleanUrl = url.trim().slice(0, 2048);
  const cleanReferrer = referrer ? referrer.trim().slice(0, 2048) : null;
  const cleanUserAgent = userAgent ? userAgent.trim().slice(0, 512) : null;

  try {
    // Check if missing URL was already recorded, increment count if so
    const existing = await db.missingPage.findFirst({
      where: { url: cleanUrl },
    });

    if (existing) {
      const updated = await db.missingPage.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          referrer: cleanReferrer || existing.referrer,
          userAgent: cleanUserAgent || existing.userAgent,
        },
      });
      return { success: true, id: updated.id };
    }

    const created = await db.missingPage.create({
      data: {
        url: cleanUrl,
        referrer: cleanReferrer,
        userAgent: cleanUserAgent,
        count: 1,
      },
    });

    return { success: true, id: created.id };
  } catch (err) {
    // Graceful error logging - do not fail request if database connection is offline
    console.warn("[MissingPage] Failed to log 404 URL to database:", err);
    return { success: false };
  }
}
