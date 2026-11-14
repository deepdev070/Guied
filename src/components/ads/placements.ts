import type { AdFormat } from "./formats";

export type AdPlacementKey =
  | "HOME_BELOW_HERO"
  | "HOME_MID"
  | "TASK_TOP"
  | "TASK_SIDEBAR_STICKY"
  | "TASK_INLINE_1"
  | "TASK_INLINE_2"
  | "TASK_BOTTOM"
  | "CATEGORY_LIST"
  | "SEARCH_RESULTS"
  | "GUIDES_LIST";

export interface AdPlacementConfig {
  key: AdPlacementKey;
  slotId: string;
  name: string;
  format: AdFormat;
  desktopOnly?: boolean;
  minContentSpacingPx: number;
  description: string;
}

/**
 * Single source of truth for all advertisement placements (Prompt 86).
 *
 * ETIQUETTE RULES:
 * 1. Max 3 ads visible per viewport on mobile.
 * 2. Never place an ad above the H1 (content comes first).
 * 3. Minimum 300px of content spacing between ads.
 * 4. Zero ads on legal and verification pages (/terms, /privacy-policy, /disclaimer, /how-we-verify).
 * 5. Zero ads in print or PDF export.
 */
export const AD_PLACEMENTS: Record<AdPlacementKey, AdPlacementConfig> = {
  HOME_BELOW_HERO: {
    key: "HOME_BELOW_HERO",
    slotId: "home-below-hero",
    name: "Home Below Hero Banner",
    format: "leaderboard",
    minContentSpacingPx: 300,
    description: "Positioned directly under the homepage hero search, before category grid.",
  },
  HOME_MID: {
    key: "HOME_MID",
    slotId: "home-mid",
    name: "Home Mid-Page Rectangle",
    format: "rectangle",
    minContentSpacingPx: 400,
    description: "Positioned between popular tasks and trust strip.",
  },
  TASK_TOP: {
    key: "TASK_TOP",
    slotId: "task-top",
    name: "Task At A Glance Footer",
    format: "leaderboard",
    minContentSpacingPx: 300,
    description: "Positioned immediately below At a Glance box, never above H1.",
  },
  TASK_SIDEBAR_STICKY: {
    key: "TASK_SIDEBAR_STICKY",
    slotId: "task-sidebar-sticky",
    name: "Task Sticky Sidebar Rectangle",
    format: "rectangle",
    desktopOnly: true,
    minContentSpacingPx: 300,
    description: "Sticky 300x250 slot in the desktop right-hand rail.",
  },
  TASK_INLINE_1: {
    key: "TASK_INLINE_1",
    slotId: "task-inline-1",
    name: "Task After Documents",
    format: "in-article",
    minContentSpacingPx: 350,
    description: "In-article fluid slot placed between Documents and Steps sections.",
  },
  TASK_INLINE_2: {
    key: "TASK_INLINE_2",
    slotId: "task-inline-2",
    name: "Task After Steps",
    format: "in-article",
    minContentSpacingPx: 350,
    description: "In-article fluid slot placed between Steps and Fees sections.",
  },
  TASK_BOTTOM: {
    key: "TASK_BOTTOM",
    slotId: "task-bottom",
    name: "Task Before FAQs",
    format: "leaderboard",
    minContentSpacingPx: 300,
    description: "Placed immediately before the FAQ accordion.",
  },
  CATEGORY_LIST: {
    key: "CATEGORY_LIST",
    slotId: "category-list",
    name: "Category List Mid-Feed",
    format: "rectangle",
    minContentSpacingPx: 300,
    description: "Placed inside category guide listings after the 3rd task.",
  },
  SEARCH_RESULTS: {
    key: "SEARCH_RESULTS",
    slotId: "search-results",
    name: "Search Results Interstitial",
    format: "rectangle",
    minContentSpacingPx: 300,
    description: "Placed within search results feed after top results.",
  },
  GUIDES_LIST: {
    key: "GUIDES_LIST",
    slotId: "guides-list",
    name: "All Guides Directory Banner",
    format: "leaderboard",
    minContentSpacingPx: 300,
    description: "Placed in the central guides directory.",
  },
};

/**
 * Restricted paths where ads must never be displayed (legal, verification, print, error pages).
 */
export const NO_AD_ROUTES = [
  "/terms",
  "/privacy-policy",
  "/disclaimer",
  "/how-we-verify",
  "/report-mistake",
  "/my-checklists",
  "/health",
] as const;

/**
 * Verifies if a given path is an ad-free legal or administrative route.
 */
export function isLegalOrAdFreeRoute(path: string): boolean {
  if (!path) return false;
  const clean = path.split("?")[0]?.split("#")[0] || path;
  return NO_AD_ROUTES.some((route) => clean === route || clean.startsWith(`${route}/`));
}

/**
 * Verifies whether an ad placement is allowed to render under strict etiquette rules.
 */
export function canRenderAdPlacement(options: {
  path: string;
  placement: AdPlacementConfig;
  isMobile?: boolean;
}): boolean {
  const { path, placement, isMobile = false } = options;

  // Rule 4: None on legal pages
  if (isLegalOrAdFreeRoute(path)) {
    return false;
  }

  // Desktop only restriction (e.g. TASK_SIDEBAR_STICKY)
  if (isMobile && placement.desktopOnly) {
    return false;
  }

  return true;
}
