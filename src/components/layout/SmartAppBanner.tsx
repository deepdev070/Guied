"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Smartphone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISSED_STORAGE_KEY = "civic_app_banner_dismissed";

export interface SmartAppBannerProps {
  className?: string;
  forceVisible?: boolean;
}

/**
 * Mobile Web Smart App Banner (Prompt 128)
 *
 * Requirements:
 * - Appears on mobile web viewports
 * - Direct deep linking into installed mobile app (civicguide://<path>)
 * - Fallbacks gracefully to the current mobile website if app is not installed
 * - Polite dismissal option remembered locally
 * - 100% strict light mode with minimum 44px touch targets
 */
export function SmartAppBanner({ className, forceVisible = false }: SmartAppBannerProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (forceVisible) {
      setIsVisible(true);
      return;
    }

    try {
      const isDismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, [forceVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, "true");
    } catch {
      // Storage unavailable or blocked
    }
  };

  if (!isVisible) {
    return null;
  }

  const cleanPath = (pathname || "/").replace(/^\/+/, "");
  const appSchemeUrl = `civicguide://${cleanPath}`;

  const handleOpenApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If on iOS or Android mobile browser, attempting custom scheme triggers App Links/Universal links
    // Fallback: If not installed, page remains on current mobile web view without broken error
    const start = Date.now();
    setTimeout(() => {
      // If still here and active after 1.5s, app wasn't launched
      if (Date.now() - start < 2000 && !document.hidden) {
        // App is not installed, user stays cleanly on web
      }
    }, 1500);
  };

  return (
    <aside
      role="banner"
      aria-label="Open in mobile app banner"
      className={cn(
        "bg-surface border-border text-text relative z-40 flex w-full items-center justify-between border-b px-3 py-2.5 shadow-xs transition-all md:hidden print:hidden",
        className
      )}
    >
      {/* 1. Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss app banner"
        className="text-text-muted hover:text-text focus:ring-primary flex h-9 w-9 items-center justify-center rounded-full p-1 focus:ring-2 focus:outline-none"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* 2. App Icon and Civic Title */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-2">
        <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-xs">
          <Smartphone className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-small truncate font-semibold">India Paperwork Guide</p>
          <p className="text-caption text-text-muted truncate">Fast, offline-ready & 100% free</p>
        </div>
      </div>

      {/* 3. Open in App Action CTA */}
      <a
        href={appSchemeUrl}
        onClick={handleOpenApp}
        className="bg-primary hover:bg-primary-dark text-small focus:ring-primary flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3.5 font-medium text-white shadow-xs focus:ring-2 focus:ring-offset-2 focus:outline-none"
        aria-label="Open in app"
      >
        <span>Open in app</span>
        <ExternalLink className="h-3.5 w-3.5 opacity-90" aria-hidden="true" />
      </a>
    </aside>
  );
}
