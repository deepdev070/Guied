import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { trackEvent, analytics } from "../src/lib/analytics.ts";

describe("Prompt 82: Privacy Analytics & Google Search Console", () => {
  beforeEach(() => {
    // Reset global window mocks
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { navigator?: unknown }).navigator;
  });

  it("trackEvent: safely skips execution in SSR environment without window", () => {
    assert.doesNotThrow(() => {
      trackEvent("page_view", { path: "/passport-renewal" });
    });
  });

  it("trackEvent: respects Do Not Track (DNT) header and suppresses tracking", () => {
    let plausibleCalled = false;
    (globalThis as unknown as { window: unknown }).window = {
      plausible: () => {
        plausibleCalled = true;
      },
    };
    (globalThis as unknown as { navigator: unknown }).navigator = {
      doNotTrack: "1",
    };

    trackEvent("page_view", { path: "/driving-licence-learner" });
    assert.strictEqual(plausibleCalled, false, "Must not fire analytics when DNT is enabled");
  });

  it("trackEvent: dispatches typed event to Plausible and GA4", () => {
    let capturedPlausibleEvent = "";
    let capturedPlausibleProps: unknown = null;
    let capturedGtagEvent = "";
    let capturedGtagProps: unknown = null;

    (globalThis as unknown as { window: unknown }).window = {
      plausible: (name: string, options?: { props?: unknown }) => {
        capturedPlausibleEvent = name;
        capturedPlausibleProps = options?.props;
      },
      gtag: (command: string, name: string | Date, params?: unknown) => {
        if (command === "event") {
          capturedGtagEvent = String(name);
          capturedGtagProps = params;
        }
      },
    };
    (globalThis as unknown as { navigator: unknown }).navigator = {
      doNotTrack: "0",
    };

    analytics.searchQuery("driving licence", 5, "gujarat");

    assert.strictEqual(capturedPlausibleEvent, "search_query");
    assert.deepStrictEqual(capturedPlausibleProps, {
      query: "driving licence",
      results_count: 5,
      state: "gujarat",
    });

    assert.strictEqual(capturedGtagEvent, "search_query");
    assert.deepStrictEqual(capturedGtagProps, {
      query: "driving licence",
      results_count: 5,
      state: "gujarat",
    });
  });

  it("analytics helpers: format payloads for civic interactions accurately", () => {
    const events: Array<{ name: string; props: unknown }> = [];

    (globalThis as unknown as { window: unknown }).window = {
      plausible: (name: string, options?: { props?: unknown }) => {
        events.push({ name, props: options?.props });
      },
    };
    (globalThis as unknown as { navigator: unknown }).navigator = {
      doNotTrack: "0",
    };

    analytics.checklistStart("passport-renewal", "gujarat");
    analytics.checklistComplete("passport-renewal", "gujarat", 8);
    analytics.shareClick("whatsapp", "Passport Renewal", "Gujarat");
    analytics.pdfDownload("passport-renewal", "gujarat");
    analytics.adSlotImpression("leaderboard-top", "728x90", "leaderboard");

    assert.strictEqual(events.length, 5);
    assert.strictEqual(events[0]?.name, "checklist_start");
    assert.strictEqual(events[1]?.name, "checklist_complete");
    assert.strictEqual(events[2]?.name, "share_click");
    assert.strictEqual(events[3]?.name, "pdf_download");
    assert.strictEqual(events[4]?.name, "ad_slot_impression");
  });

  it("Search Console verification: layout metadata supports google verification token", () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
    assert.ok(
      layoutContent.includes("verification:"),
      "RootLayout metadata must include verification property"
    );
    assert.ok(
      layoutContent.includes("NEXT_PUBLIC_GSC_VERIFICATION"),
      "RootLayout must check NEXT_PUBLIC_GSC_VERIFICATION for Google Search Console"
    );
    assert.ok(
      layoutContent.includes("<AnalyticsScript />") || layoutContent.includes("<AnalyticsScript"),
      "RootLayout must render AnalyticsScript component"
    );
  });

  it("AnalyticsScript: supports Plausible and GA4 with default denied consent", () => {
    const scriptContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/analytics/AnalyticsScript.tsx"),
      "utf8"
    );
    assert.ok(
      scriptContent.includes("plausible.io/js/script.tagged-events.js"),
      "AnalyticsScript must support Plausible script tag"
    );
    assert.ok(
      scriptContent.includes("googletagmanager.com/gtag/js"),
      "AnalyticsScript must support GA4 script tag"
    );
    assert.ok(
      scriptContent.includes("'ad_storage': 'denied'"),
      "GA4 initialization must default ad storage to denied for privacy"
    );
  });

  it("docs/analytics.md: documents Plausible proposal, Search Console verification and sitemap submission", () => {
    const docsContent = fs.readFileSync(path.join(process.cwd(), "docs/analytics.md"), "utf8");
    assert.ok(
      docsContent.includes("Plausible Analytics"),
      "Must propose and document Plausible Analytics"
    );
    assert.ok(
      docsContent.includes("Google Search Console"),
      "Must explain Search Console verification"
    );
    assert.ok(docsContent.includes("sitemap.xml"), "Must include step-by-step sitemap submission");
  });
});
