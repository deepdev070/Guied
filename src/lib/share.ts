/**
 * Share utilities for WhatsApp, Telegram, Web Share API, and clipboard copy.
 * Adds standardized UTM analytics parameters to track viral citizen referrals.
 * Features category-specific, non-spammy WhatsApp copy in English, Hindi, and Gujarati (Prompt 143).
 */

import whatsappData from "../content/whatsapp-templates.json" with { type: "json" };

export interface ShareUrlOptions {
  pageUrl: string;
  source: "whatsapp" | "telegram" | "copylink" | "webshare";
  medium?: string;
  campaign?: string;
}

export type SupportedShareLocale = "en" | "hi" | "gu";

export interface WhatsAppShareOptions {
  taskTitle: string;
  stateName?: string;
  pageUrl: string;
  categorySlug?: string;
  locale?: string;
  templateIndex?: number;
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
 * Resolves a category-specific, non-spammy WhatsApp message template in the requested language.
 */
export function getWhatsAppShareMessage({
  taskTitle,
  stateName = "All India",
  pageUrl,
  categorySlug = "default",
  locale = "en",
  templateIndex = 0,
}: WhatsAppShareOptions): string {
  const trackedUrl = buildShareUrl({ pageUrl, source: "whatsapp" });

  const validLocale = (locale === "hi" || locale === "gu" ? locale : "en") as SupportedShareLocale;

  const defaultTemplates = (whatsappData.templates as any).default as Record<
    SupportedShareLocale,
    string[]
  >;
  const categories = whatsappData.templates as Record<
    string,
    Record<SupportedShareLocale, string[]> | undefined
  >;

  const categoryTemplates = categories[categorySlug] || defaultTemplates;
  const langTemplates =
    (categoryTemplates && categoryTemplates[validLocale]) ||
    (categoryTemplates && categoryTemplates.en) ||
    defaultTemplates.en;

  const safeIndex = Math.abs(templateIndex) % (langTemplates.length || 1);
  const rawTemplate =
    langTemplates[safeIndex] || langTemplates[0] || "Check out {title} ({state}): {url}";

  return rawTemplate
    .replace(/\{title\}/g, taskTitle)
    .replace(/\{state\}/g, stateName)
    .replace(/\{url\}/g, trackedUrl);
}

/**
 * Builds pre-filled message URL for WhatsApp share with category and language personalization.
 */
export function buildWhatsAppShareUrl(
  taskTitle: string,
  stateName = "All India",
  pageUrl: string,
  categorySlug = "default",
  locale: string = "en",
  templateIndex = 0
): string {
  const message = getWhatsAppShareMessage({
    taskTitle,
    stateName,
    pageUrl,
    categorySlug,
    locale,
    templateIndex,
  });
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
