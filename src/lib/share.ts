/**
 * Share utilities for WhatsApp, Telegram, Web Share API, and clipboard copy.
 * Adds standardized UTM analytics parameters to track viral citizen referrals.
 */

export interface ShareUrlOptions {
  pageUrl: string;
  source: "whatsapp" | "telegram" | "copylink" | "webshare";
  medium?: string;
  campaign?: string;
}

/**
 * Appends standard UTM tracking parameters to a URL.
 */
export function buildShareUrl({
  pageUrl,
  source,
  medium = "share",
  campaign = "checklist_share",
}: ShareUrlOptions): string {
  try {
    const url = new URL(pageUrl);
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", campaign);
    return url.toString();
  } catch {
    // Fallback if URL constructor fails with relative path
    const separator = pageUrl.includes("?") ? "&" : "?";
    return `${pageUrl}${separator}utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
  }
}

/**
 * Builds pre-filled message for WhatsApp share.
 */
export function buildWhatsAppShareUrl(
  taskTitle: string,
  stateName: string,
  pageUrl: string
): string {
  const trackedUrl = buildShareUrl({ pageUrl, source: "whatsapp" });
  const message = `Here is the verified checklist, fees, and official links for *${taskTitle}* (${stateName}):\n${trackedUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Builds share URL for Telegram.
 */
export function buildTelegramShareUrl(
  taskTitle: string,
  stateName: string,
  pageUrl: string
): string {
  const trackedUrl = buildShareUrl({ pageUrl, source: "telegram" });
  const text = `Verified checklist, fees and official steps for ${taskTitle} (${stateName})`;
  return `https://t.me/share/url?url=${encodeURIComponent(trackedUrl)}&text=${encodeURIComponent(text)}`;
}

/**
 * Helper to build native Web Share payload.
 */
export function buildWebShareData(taskTitle: string, stateName: string, pageUrl: string) {
  const trackedUrl = buildShareUrl({ pageUrl, source: "webshare" });
  return {
    title: `${taskTitle} (${stateName}) - Verified Checklist & Fees`,
    text: `Complete document checklist, statutory fees, and official links for ${taskTitle} in ${stateName}.`,
    url: trackedUrl,
  };
}
