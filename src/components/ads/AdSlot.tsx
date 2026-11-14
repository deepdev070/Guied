"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { subscribeToConsent, getConsentSnapshot, getConsentServerSnapshot } from "@/lib/consent";
import { getAdProvider } from "@/lib/ads/provider";
import { Heart } from "lucide-react";
import { HouseAd } from "./HouseAd";
import { AD_FORMAT_CONFIGS, type AdFormat, type AdFormatConfig } from "./formats";

export { AD_FORMAT_CONFIGS, type AdFormat, type AdFormatConfig };

export interface AdSlotProps {
  /**
   * Human-readable name of the slot (e.g. "Home Below Hero", "Task Sidebar Sticky")
   */
  name: string;
  /**
   * Standard advertisement format
   */
  format: AdFormat;
  /**
   * Unique placement ID matching the ad network slot ID
   */
  placementId: string;
  /**
   * Optional custom styling
   */
  className?: string;
  /**
   * Optional manual override for ads enabled status
   */
  forceEnabled?: boolean;
}

/**
 * Universal Core Web Vitals-Safe AdSlot Component (Prompt 85, 88 & 89).
 * - Reserves exact height (min-height) to completely prevent layout shift (CLS < 0.1).
 * - Styled with soft surface-alt background, dashed border, and small muted "ADVERTISEMENT" caps.
 * - Shows a visible "Ad space - <dimension>" label ONLY in development.
 * - Integrates with provider abstraction (AdSense / None).
 * - Lazy-loads slots via IntersectionObserver only when approaching viewport.
 * - Controlled by NEXT_PUBLIC_ADS_ENABLED environment variable and user privacy consent.
 * - Ad-blocker detection with polite, guilt-free civic support fallback.
 * - Fires viewability impressions via privacy-friendly analytics client.
 */
export function AdSlot({ name, format, placementId, className, forceEnabled }: AdSlotProps) {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );
  const advertisingAllowed = consent ? consent.advertising : false;
  const formatConfig = AD_FORMAT_CONFIGS[format] || AD_FORMAT_CONFIGS.rectangle;
  const slotRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isRendered, setIsRendered] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const isAdsEnabled =
    forceEnabled ?? (process.env.NEXT_PUBLIC_ADS_ENABLED === "true" && advertisingAllowed);
  const isDev = process.env.NODE_ENV === "development";

  // 1. Initial slot impression tracking
  useEffect(() => {
    analytics.adSlotImpression(placementId, formatConfig.dimensions, name);
  }, [placementId, formatConfig.dimensions, name]);

  // 2. Prompt 93: Viewability tracking (50% visible for 1 continuous second)
  useEffect(() => {
    const el = slotRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let hasFired = false;

    const viewabilityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !hasFired) {
          if (!timer) {
            timer = setTimeout(() => {
              hasFired = true;
              analytics.adSlotViewable(placementId, name, format, 1000);
              viewabilityObserver.disconnect();
            }, 1000);
          }
        } else {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: [0.5] }
    );

    viewabilityObserver.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      viewabilityObserver.disconnect();
    };
  }, [placementId, name, format]);

  // 3. Lazy-load slot with IntersectionObserver (Prompt 89)
  useEffect(() => {
    if (!isAdsEnabled || isRendered) return;

    const el = slotRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          observer.disconnect();
          setIsRendered(true);

          const provider = getAdProvider();
          provider
            .init()
            .then((success) => {
              if (success && containerRef.current) {
                provider.renderSlot({
                  slotId: placementId,
                  format,
                  container: containerRef.current,
                  dimensions: formatConfig.dimensions,
                });
              } else if (!success) {
                // Script blocked or network failure -> graceful fallback
                setIsBlocked(true);
              }
            })
            .catch(() => {
              setIsBlocked(true);
            });
        }
      },
      { rootMargin: "250px" } // Pre-fetch 250px before entering viewport to avoid jank
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isAdsEnabled, isRendered, placementId, format, formatConfig.dimensions]);

  return (
    <aside
      ref={slotRef}
      id={`ad-slot-${placementId}`}
      aria-label={`Advertisement: ${name}`}
      role="complementary"
      onClick={() => analytics.adSlotClick(placementId, name)}
      className={cn(
        "rounded-card border-border bg-surface-alt/70 mx-auto my-6 flex flex-col items-center justify-center border border-dashed p-3 text-center transition-opacity print:hidden",
        formatConfig.className,
        className
      )}
      style={{ minHeight: `${formatConfig.minHeightPx}px` }}
      data-ad-slot={placementId}
      data-ad-format={format}
      data-ad-name={name}
      data-ads-enabled={isAdsEnabled ? "true" : "false"}
    >
      {/* 1. Compliant 'ADVERTISEMENT' micro-header */}
      <span className="text-muted/70 text-[10px] font-semibold tracking-wider uppercase">
        Advertisement
      </span>

      {/* 2. Development Placeholder Label (shown ONLY in development) */}
      {isDev && (
        <div className="border-border/60 text-muted mt-1.5 flex flex-col items-center justify-center rounded border border-dashed bg-white/60 px-3 py-1.5 text-xs">
          <span className="text-text font-semibold">Ad space — {formatConfig.dimensions}</span>
          <span className="text-muted text-[11px]">
            {name} ({placementId})
          </span>
        </div>
      )}

      {/* 3. Live Ad Container or Ad-Blocker Civic Support Fallback (Prompt 89) */}
      {isAdsEnabled && !isBlocked && (
        <div
          ref={containerRef}
          id={`ad-container-${placementId}`}
          className="w-full flex-1"
          aria-hidden="true"
        />
      )}

      {/* 4. Graceful Ad-Blocker Fallback (Zero guilt-tripping) */}
      {isBlocked && (
        <div className="rounded-input border-border/80 shadow-soft-xs my-auto flex max-w-sm items-center gap-2 border bg-white/80 px-3 py-2 text-left text-xs">
          <Heart className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-muted leading-tight">
            Support free paperwork checklists: Share this guide with friends or family applying for
            documents.
          </span>
        </div>
      )}

      {/* 5. House Ad & Affiliate Partner Fallback (Prompt 91) */}
      {!isAdsEnabled && !isDev && !isBlocked && <HouseAd format={format} slotId={placementId} />}
    </aside>
  );
}
