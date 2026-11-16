/**
 * Offline Data Pack Service (Prompt 125)
 * Bundles Gujarat's top 10 civic guides and national fallbacks in the app binary
 * for instant, zero-network first launches.
 */

import bundledData from "../assets/datapack/gujarat-top10.json" with { type: "json" };

export interface BundledFee {
  label: string;
  amount: number;
  isOptional?: boolean;
}

export interface BundledDoc {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  instructions?: string[];
  appliesWhen?: unknown;
}

export interface BundledStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime?: string;
  isOnline?: boolean;
}

export interface BundledGuide {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  department: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  stateCode: string;
  stateName: string;
  isLaunchState: boolean;
  fees: BundledFee[];
  documents: BundledDoc[];
  steps: BundledStep[];
  mistakes: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  officialLinks: Array<{ title: string; url: string; description: string }>;
}

export interface DataPackMeta {
  version: string;
  generatedAt: string;
  launchState: { code: string; name: string };
  guidesCount: number;
}

// In-memory overlay cache for runtime delta updates
const dynamicOverlay = new Map<string, BundledGuide>();

/**
 * Returns metadata for the bundled offline pack.
 */
export function getOfflinePackMeta(): DataPackMeta {
  return {
    version: bundledData.version,
    generatedAt: bundledData.generatedAt,
    launchState: bundledData.launchState,
    guidesCount: bundledData.guidesCount,
  };
}

/**
 * Returns all bundled guides, merged with any newer delta updates.
 */
export function getAllBundledGuides(): BundledGuide[] {
  const baseGuides = bundledData.guides as BundledGuide[];
  return baseGuides.map((guide) => {
    const key = `${guide.slug}_${guide.stateCode.toLowerCase()}`;
    return dynamicOverlay.get(key) || guide;
  });
}

/**
 * Finds a single guide by slug and optional state.
 * Returns null if not found.
 */
export function getBundledGuide(slug: string, state?: string): BundledGuide | null {
  const stateCode = (state || "gj").toLowerCase();
  const key = `${slug}_${stateCode}`;

  // 1. Check runtime delta updates overlay
  if (dynamicOverlay.has(key)) {
    return dynamicOverlay.get(key) || null;
  }

  // 2. Search bundled data
  const baseGuides = bundledData.guides as BundledGuide[];
  const match = baseGuides.find((g) => g.slug === slug && g.stateCode.toLowerCase() === stateCode);

  if (match) return match;

  // 3. Fallback to slug match regardless of state if national fallback exists
  const fallback = baseGuides.find((g) => g.slug === slug);
  return fallback || null;
}

/**
 * Returns guides belonging to a specific category.
 */
export function getBundledGuidesByCategory(categorySlug: string): BundledGuide[] {
  const all = getAllBundledGuides();
  return all.filter((g) => g.categorySlug === categorySlug);
}

/**
 * Overlays an updated guide received via delta sync.
 */
export function registerGuideUpdate(guide: BundledGuide): void {
  const key = `${guide.slug}_${guide.stateCode.toLowerCase()}`;
  dynamicOverlay.set(key, guide);
}

/**
 * Clears the dynamic overlay (useful for testing or resetting to bundled defaults).
 */
export function clearGuideUpdates(): void {
  dynamicOverlay.clear();
}
