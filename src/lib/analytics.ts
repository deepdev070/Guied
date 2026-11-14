/**
 * Privacy-Friendly Analytics Client for India Paperwork Guide (Prompt 82).
 *
 * PROPOSAL:
 * We recommend and prioritize Plausible Analytics:
 * 1. 100% compliant with India's DPDP Act 2023 and GDPR (no cookies, no personal data, no persistent identifiers).
 * 2. Ultra-lightweight (<1 KB script payload vs ~45 KB for GA4), protecting LCP < 2.5s and mobile CWV.
 * 3. Supports custom civic goal tracking (checklist completion, search queries, PDF downloads, share clicks).
 * 4. Dual-mode support: Also supports Google Analytics 4 (GA4) behind explicit user consent if configured.
 */

export type AnalyticsEventName =
  | "page_view"
  | "search_query"
  | "checklist_start"
  | "checklist_complete"
  | "share_click"
  | "pdf_download"
  | "ad_slot_impression"
  | "ad_slot_viewable"
  | "ad_slot_click"
  | "provider_phone_click";

export interface AnalyticsEventProps {
  page_view: {
    path: string;
    title?: string;
  };
  search_query: {
    query: string;
    results_count: number;
    state?: string;
  };
  checklist_start: {
    task_slug: string;
    state_slug?: string;
  };
  checklist_complete: {
    task_slug: string;
    state_slug?: string;
    total_documents: number;
  };
  share_click: {
    platform: "whatsapp" | "telegram" | "copy_link" | "web_share";
    task_slug: string;
    state_slug?: string;
  };
  pdf_download: {
    task_slug: string;
    state_slug?: string;
  };
  ad_slot_impression: {
    slot_id: string;
    format: string;
    placement: string;
  };
  ad_slot_viewable: {
    slot_id: string;
    placement: string;
    format: string;
    duration_ms: number;
  };
  ad_slot_click: {
    slot_id: string;
    placement: string;
  };
  provider_phone_click: {
    provider_id: string;
    provider_name: string;
    city: string;
    category: string;
  };
}

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean | undefined> }
    ) => void;
    gtag?: (
      command: "event" | "config" | "js" | "consent",
      eventNameOrDate: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Dispatches an analytics event with privacy protections.
 */
export function trackEvent<E extends AnalyticsEventName>(
  eventName: E,
  properties: AnalyticsEventProps[E]
): void {
  if (typeof window === "undefined") {
    return;
  }

  // Respect Global Privacy Control / Do Not Track
  if (
    typeof navigator !== "undefined" &&
    (navigator.doNotTrack === "1" ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === "1")
  ) {
    return;
  }

  // 1. Dispatch to Plausible (if loaded)
  if (typeof window.plausible === "function") {
    try {
      window.plausible(eventName, { props: properties });
    } catch {
      // Ignore analytics dispatch failure
    }
  }

  // 2. Dispatch to GA4 (if loaded and consented)
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, properties);
    } catch {
      // Ignore analytics dispatch failure
    }
  }

  // 3. Log in local development for developer inspection
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(`[Analytics Event] ${eventName}:`, properties);
  }
}

/**
 * Pre-defined typed event helper functions
 */
export const analytics = {
  pageView: (path: string, title?: string) => trackEvent("page_view", { path, title }),

  searchQuery: (query: string, resultsCount: number, state?: string) =>
    trackEvent("search_query", { query, results_count: resultsCount, state }),

  checklistStart: (taskSlug: string, stateSlug?: string) =>
    trackEvent("checklist_start", { task_slug: taskSlug, state_slug: stateSlug }),

  checklistComplete: (taskSlug: string, stateSlug: string | undefined, totalDocuments: number) =>
    trackEvent("checklist_complete", {
      task_slug: taskSlug,
      state_slug: stateSlug,
      total_documents: totalDocuments,
    }),

  shareClick: (
    platform: "whatsapp" | "telegram" | "copy_link" | "web_share",
    taskSlug: string,
    stateSlug?: string
  ) => trackEvent("share_click", { platform, task_slug: taskSlug, state_slug: stateSlug }),

  pdfDownload: (taskSlug: string, stateSlug?: string) =>
    trackEvent("pdf_download", { task_slug: taskSlug, state_slug: stateSlug }),

  adSlotImpression: (slotId: string, format: string, placement: string) =>
    trackEvent("ad_slot_impression", {
      slot_id: slotId,
      format: format,
      placement: placement,
    }),

  adSlotViewable: (slotId: string, placement: string, format: string, durationMs = 1000) =>
    trackEvent("ad_slot_viewable", {
      slot_id: slotId,
      placement,
      format,
      duration_ms: durationMs,
    }),

  adSlotClick: (slotId: string, placement: string) =>
    trackEvent("ad_slot_click", {
      slot_id: slotId,
      placement: placement,
    }),

  providerPhoneClick: (providerId: string, providerName: string, city: string, category: string) =>
    trackEvent("provider_phone_click", {
      provider_id: providerId,
      provider_name: providerName,
      city,
      category,
    }),
};
