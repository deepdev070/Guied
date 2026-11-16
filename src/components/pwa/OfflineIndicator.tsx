"use client";

import React, { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
}

export interface OfflineIndicatorProps {
  className?: string;
  forceOffline?: boolean;
}

export function OfflineIndicator({ className, forceOffline = false }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();
  const effectiveOffline = forceOffline || !isOnline;

  if (!effectiveOffline) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-950 shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-bold text-amber-900">
            Offline - your progress is saved on this device
          </span>
          <span className="hidden text-amber-700/80 sm:inline">•</span>
          <span className="text-amber-800">No account or network needed</span>
        </div>
      </div>
      <span className="shrink-0 rounded bg-amber-200/70 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
        Local Only
      </span>
    </aside>
  );
}
