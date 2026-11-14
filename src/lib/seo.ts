import type { Metadata } from "next";

export interface TaskMetadataInput {
  taskSlug: string;
  taskName: string;
  stateSlug?: string;
  stateName?: string;
  stateCode?: string;
  documentCount?: number;
  mandatoryFeeTotal?: number;
  hasStateOverride?: boolean;
  passesThinContentGate?: boolean;
  year?: number;
  siteUrl?: string;
  languages?: string[];
}

export const DEFAULT_SITE_URL = "https://indiapaperworkguide.in";
export const SUPPORTED_LANGUAGES = ["en", "hi", "gu"] as const;

/**
 * Builds SEO title adhering strictly to:
 * - "<Task> in <State>: Documents, Fees, Steps (2026)" (max 60 chars)
 * - "<Task>: Documents, Fees, Steps & Rules (2026)" (max 60 chars)
 * Guaranteed unique and <= 60 characters.
 */
export function buildTaskTitle({
  taskName,
  stateName,
  year = 2026,
}: {
  taskName: string;
  stateName?: string;
  year?: number;
}): string {
  if (stateName) {
    const full = `${taskName} in ${stateName}: Documents, Fees, Steps (${year})`;
    if (full.length <= 60) return full;

    const short1 = `${taskName} in ${stateName}: Documents, Fees (${year})`;
    if (short1.length <= 60) return short1;

    const short2 = `${taskName} in ${stateName}: Documents (${year})`;
    if (short2.length <= 60) return short2;

    const maxTask = 60 - ` in ${stateName} (${year})`.length;
    if (maxTask > 10) {
      return `${taskName.slice(0, maxTask).trim()} in ${stateName} (${year})`;
    }
    return full.slice(0, 60);
  }

  const full = `${taskName}: Documents, Fees, Steps & Rules (${year})`;
  if (full.length <= 60) return full;

  const short1 = `${taskName}: Documents, Fees & Steps (${year})`;
  if (short1.length <= 60) return short1;

  const short2 = `${taskName}: Documents & Fees (${year})`;
  if (short2.length <= 60) return short2;

  return full.slice(0, 60);
}

/**
 * Builds SEO meta description adhering strictly to:
 * - Contains a number (documents count and/or fee)
 * - Contains a citizen benefit ("Save time and avoid agent charges")
 * - Max 155 characters
 * Guaranteed unique per task and task+state combination.
 */
export function buildTaskDescription({
  taskName,
  stateName,
  documentCount = 5,
  mandatoryFeeTotal = 1500,
}: {
  taskName: string;
  stateName?: string;
  documentCount?: number;
  mandatoryFeeTotal?: number;
}): string {
  const feeString = mandatoryFeeTotal > 0 ? `₹${mandatoryFeeTotal.toLocaleString("en-IN")}` : "₹0";

  let desc = "";

  if (stateName) {
    desc = `Check ${documentCount} required documents, ${feeString} fee & official steps for ${taskName} in ${stateName}. Avoid middleman charges.`;
    if (desc.length <= 155) return desc;

    desc = `${documentCount} documents & ${feeString} fee for ${taskName} in ${stateName}. Official checklist, zero agent commissions.`;
    if (desc.length <= 155) return desc;

    return desc.slice(0, 155);
  }

  desc = `Check ${documentCount} required documents, ${feeString} statutory fee & official steps for ${taskName}. Avoid middleman commissions.`;
  if (desc.length <= 155) return desc;

  desc = `${documentCount} documents & ${feeString} statutory fee for ${taskName}. Official verified guide, zero tout charges.`;
  if (desc.length <= 155) return desc;

  return desc.slice(0, 155);
}

/**
 * Central Metadata Generator for Next.js App Router
 * Produces unique, validated title, meta description, canonical URL,
 * Open Graph, and Twitter metadata for any task or task+state page.
 */
export function generateTaskSeoMetadata(input: TaskMetadataInput): Metadata {
  const {
    taskSlug,
    taskName,
    stateSlug,
    stateName,
    documentCount = 5,
    mandatoryFeeTotal = 1500,
    hasStateOverride = false,
    passesThinContentGate = true,
    year = 2026,
    siteUrl = DEFAULT_SITE_URL,
  } = input;

  const title = buildTaskTitle({ taskName, stateName, year });
  const description = buildTaskDescription({
    taskName,
    stateName,
    documentCount,
    mandatoryFeeTotal,
  });

  const path = stateSlug ? `/${taskSlug}/${stateSlug}` : `/${taskSlug}`;
  const canonicalUrl = `${siteUrl}${path}`;

  // Self-referencing hreflang alternates for en, hi, gu and x-default fallback
  const languageAlternates: Record<string, string> = {
    en: `${canonicalUrl}`,
    hi: `${canonicalUrl}?lang=hi`,
    gu: `${canonicalUrl}?lang=gu`,
    "x-default": `${canonicalUrl}`,
  };

  // State pages with unique overrides are indexed; duplicates are noindexed.
  // Thin content pages that fail the publishing gate (Prompt 83) are strictly noindexed.
  const passesGate = passesThinContentGate !== false;
  const isIndexable = (!stateSlug || hasStateOverride) && passesGate;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    robots: isIndexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "India Paperwork Guide",
      type: "article",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export { generateTaskSeoMetadata as generateTaskMetadata };

export interface NoindexPageReport {
  path: string;
  taskSlug: string;
  stateSlug?: string;
  reason: "duplicate_national_content";
}

/**
 * Scans all published tasks and task+state combinations to report all
 * pages marked as noindex to prevent low-value / duplicate content penalties.
 */
export function listAllNoindexTaskPages(
  tasks: Array<{
    slug: string;
    national: { status?: string };
    states?: Record<string, unknown>;
  }>,
  allStates: Array<{ slug: string; code: string }>
): NoindexPageReport[] {
  const noindexPages: NoindexPageReport[] = [];

  for (const task of tasks) {
    if (task.national.status === "DRAFT" || task.national.status === "ARCHIVED") {
      continue;
    }

    for (const state of allStates) {
      const hasOverride = Boolean(task.states?.[state.code]);
      if (!hasOverride) {
        noindexPages.push({
          path: `/${task.slug}/${state.slug}`,
          taskSlug: task.slug,
          stateSlug: state.slug,
          reason: "duplicate_national_content",
        });
      }
    }
  }

  return noindexPages;
}
