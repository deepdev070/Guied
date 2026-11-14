"use client";

import React, { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { X } from "lucide-react";
import { AdSlot } from "./AdSlot";

export interface MobileAnchorAdProps {
  /**
   * Whether the mobile anchor slot is enabled. Defaults to false (off by default per Prompt 90).
   */
  enabled?: boolean;
  /**
   * Custom placement ID. Defaults to "task-mobile-anchor".
   */
  slotId?: string;
}

const SESSION_DISMISSED_KEY = "civic_mobile_anchor_dismissed";

function subscribeSession(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDismissedSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1";
  } catch {
    return true;
  }
}

function getDismissedServerSnapshot(): boolean {
  return true;
}

/**
 * Mobile Anchor Placeholder Ad Slot (Prompt 90).
 * - Standard 320x50 bottom anchor for mobile screens (< 768px).
 * - Off by default; controlled by NEXT_PUBLIC_MOBILE_ANCHOR_ENABLED or enabled prop.
 * - Only appears after user scrolls past 50% of the page.
 * - Positioned above the mobile floating action bar (bottom-[64px]) to strictly prevent overlap.
 * - Dismissible via (x) button; stays dismissed for the entire browser session (sessionStorage).
 */
export function MobileAnchorAd({
  enabled = process.env.NEXT_PUBLIC_MOBILE_ANCHOR_ENABLED === "true",
  slotId = "task-mobile-anchor",
}: MobileAnchorAdProps) {
  const isSessionDismissed = useSyncExternalStore(
    subscribeSession,
    getDismissedSnapshot,
    getDismissedServerSnapshot
  );

  const [hasScrolledPastHalf, setHasScrolledPastHalf] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);

  const isDismissed = isSessionDismissed || localDismissed;

  // Scroll listener: triggers visibility after 50% scroll
  useEffect(() => {
    if (!enabled || isDismissed) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const progress = scrollY / totalHeight;
      if (progress >= 0.5) {
        setHasScrolledPastHalf(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [enabled, isDismissed]);

  const handleDismiss = useCallback(() => {
    setLocalDismissed(true);
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  }, []);

  if (!enabled || isDismissed || !hasScrolledPastHalf) {
    return null;
  }

  return (
    <div
      id="mobile-anchor-ad-wrapper"
      role="region"
      aria-label="Bottom mobile advertisement"
      className="fixed inset-x-0 bottom-[64px] z-30 flex justify-center px-2 py-1 transition-transform duration-300 sm:hidden print:hidden"
    >
      <div className="rounded-input border-border/90 shadow-soft-xl relative flex items-center justify-center border bg-white/95 p-1 backdrop-blur-xs">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-input bg-surface-alt/90 text-muted hover:text-text hover:bg-surface-alt focus-visible:ring-primary/40 border-border shadow-soft-xs absolute -top-3 -right-2 z-10 flex h-6 w-6 items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Dismiss advertisement"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        {/* 320x50 Anchor Ad Slot */}
        <AdSlot
          name="Mobile Bottom Anchor"
          format="anchor"
          placementId={slotId}
          className="my-0 border-0 p-0 shadow-none"
          forceEnabled={enabled}
        />
      </div>
    </div>
  );
}
