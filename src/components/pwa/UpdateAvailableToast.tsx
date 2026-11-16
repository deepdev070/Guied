"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UpdateAvailableToastProps {
  forceShow?: boolean;
  className?: string;
}

export function UpdateAvailableToast({ forceShow = false, className }: UpdateAvailableToastProps) {
  const [isOpen, setIsOpen] = useState(forceShow);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent<{ registration?: ServiceWorkerRegistration }>;
      const registration = customEvent.detail?.registration;
      if (registration?.waiting) {
        setWaitingWorker(registration.waiting);
      }
      setIsOpen(true);
    };

    window.addEventListener("sw-update-available", handleUpdateAvailable);

    return () => {
      window.removeEventListener("sw-update-available", handleUpdateAvailable);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);

    if (typeof window !== "undefined") {
      if (waitingWorker) {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
      }

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      }

      // Fallback reload if controllerchange doesn't fire within 800ms
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  if (!isOpen && !forceShow) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="New application version notification"
      className={cn(
        "border-primary/20 shadow-soft-lg text-text animate-slide-up fixed right-4 bottom-4 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-white p-3.5 sm:right-6 sm:bottom-6",
        className
      )}
    >
      <div className="bg-primary-soft text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 pr-1">
        <div className="flex items-center gap-2">
          <p className="text-small text-text font-bold">New version available</p>
          <span className="bg-primary inline-block h-2 w-2 rounded-full" aria-hidden="true" />
        </div>
        <p className="text-text-muted mt-0.5 text-[11px]">
          Refresh to get updated paperwork guides.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-primary hover:bg-primary-hover focus:ring-primary inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          {isRefreshing ? "Updating..." : "Refresh"}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss new version notification"
          className="text-text-muted hover:text-text hover:bg-surface-subtle focus:ring-primary cursor-pointer rounded-md p-1.5 transition-colors focus:ring-2 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
