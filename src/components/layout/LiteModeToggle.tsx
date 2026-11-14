"use client";

import React, { useState } from "react";
import { Zap, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const CIVIC_LITE_MODE_STORAGE_KEY = "civic_lite_mode";
export const CIVIC_LITE_MODE_COOKIE = "civic_lite_mode";

function getInitialLiteMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(CIVIC_LITE_MODE_STORAGE_KEY);
    if (saved !== null) {
      return saved === "true";
    }
    const attr = document.documentElement.getAttribute("data-lite-mode");
    return attr === "true";
  } catch {
    return false;
  }
}

function persistLiteMode(isLite: boolean): void {
  if (typeof window === "undefined") return;
  try {
    document.documentElement.setAttribute("data-lite-mode", isLite ? "true" : "false");
    localStorage.setItem(CIVIC_LITE_MODE_STORAGE_KEY, isLite ? "true" : "false");
    document.cookie = `${CIVIC_LITE_MODE_COOKIE}=${isLite ? "true" : "false"}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Local storage unavailable
  }
}

export interface LiteModeToggleProps {
  className?: string;
  variant?: "header" | "footer" | "mobile" | "inline";
}

export function LiteModeToggle({ className, variant = "header" }: LiteModeToggleProps) {
  const [isLite, setIsLite] = useState<boolean>(getInitialLiteMode);

  const handleToggle = () => {
    const nextState = !isLite;
    setIsLite(nextState);
    persistLiteMode(nextState);
  };

  if (variant === "footer") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isLite}
        onClick={handleToggle}
        className={cn(
          "focus-visible:ring-primary/40 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
          isLite
            ? "border-success/40 bg-success-soft text-success font-semibold"
            : "border-border bg-surface text-muted hover:text-text hover:bg-surface-alt",
          className
        )}
        title="Lite mode removes illustrations and animations to conserve mobile data on 2G/3G connections"
      >
        {isLite ? (
          <>
            <Zap className="fill-success text-success h-3.5 w-3.5" aria-hidden="true" />
            <span>Lite Mode: ON (Data saver)</span>
          </>
        ) : (
          <>
            <ZapOff className="text-muted h-3.5 w-3.5" aria-hidden="true" />
            <span>Lite Mode: OFF</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "border-border bg-surface flex items-center justify-between rounded-xl border p-3",
          className
        )}
      >
        <div className="flex flex-col">
          <span className="text-text text-xs font-bold">Lite Mode (Data Saver)</span>
          <span className="text-muted text-[11px]">
            {isLite ? "Illustrations & animations disabled" : "Optimised for slow 3G networks"}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isLite}
          onClick={handleToggle}
          className={cn(
            "focus-visible:ring-primary/40 relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:outline-none",
            isLite ? "bg-success" : "bg-muted/40"
          )}
        >
          <span className="sr-only">Toggle Lite Mode</span>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
              isLite ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    );
  }

  // Default: Header icon button
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLite}
      aria-label={`Lite Mode: ${isLite ? "ON" : "OFF"}. Conserve mobile data on 3G and older phones.`}
      onClick={handleToggle}
      className={cn(
        "focus-visible:ring-primary/40 flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:outline-none",
        isLite
          ? "border-success/40 bg-success-soft text-success shadow-2xs"
          : "border-border bg-surface text-muted hover:bg-surface-alt hover:text-text",
        className
      )}
      title={
        isLite
          ? "Lite Mode active: Illustrations and animations disabled for maximum speed"
          : "Enable Lite Mode for 3G/slow connections"
      }
    >
      <Zap
        className={cn("h-3.5 w-3.5", isLite ? "fill-success text-success" : "text-muted")}
        aria-hidden="true"
      />
      <span className="hidden sm:inline">{isLite ? "Lite: ON" : "Lite"}</span>
    </button>
  );
}
