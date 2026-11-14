"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type TextScale = "100" | "115" | "130";

export const TEXT_SCALES: Array<{
  value: TextScale;
  label: string;
  displayLabel: string;
  percentage: string;
}> = [
  { value: "100", label: "Normal text size (100%)", displayLabel: "A-", percentage: "100%" },
  { value: "115", label: "Medium text size (115%)", displayLabel: "A", percentage: "115%" },
  { value: "130", label: "Large text size (130%)", displayLabel: "A+", percentage: "130%" },
];

export const CIVIC_TEXT_SCALE_STORAGE_KEY = "civic_text_scale";
export const CIVIC_TEXT_SCALE_COOKIE = "civic_text_scale";

function getInitialScale(): TextScale {
  if (typeof window === "undefined") return "100";
  try {
    const saved = localStorage.getItem(CIVIC_TEXT_SCALE_STORAGE_KEY);
    if (saved === "100" || saved === "115" || saved === "130") {
      return saved;
    }
    const attr = document.documentElement.getAttribute("data-text-scale");
    if (attr === "100" || attr === "115" || attr === "130") {
      return attr;
    }
  } catch {
    // Local storage inaccessible
  }
  return "100";
}

function persistTextScale(scale: TextScale): void {
  if (typeof window === "undefined") return;
  try {
    document.documentElement.setAttribute("data-text-scale", scale);
    localStorage.setItem(CIVIC_TEXT_SCALE_STORAGE_KEY, scale);
    document.cookie = `${CIVIC_TEXT_SCALE_COOKIE}=${scale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Local storage disabled
  }
}

export interface TextSizeControlProps {
  className?: string;
  variant?: "header" | "mobile";
}

export function TextSizeControl({ className, variant = "header" }: TextSizeControlProps) {
  const [currentScale, setCurrentScale] = useState<TextScale>(getInitialScale);

  const handleSelectScale = (scale: TextScale) => {
    setCurrentScale(scale);
    persistTextScale(scale);
  };

  return (
    <div
      role="group"
      aria-label="Text size control"
      className={cn(
        "border-border bg-surface inline-flex items-center rounded-lg border p-0.5 shadow-2xs",
        variant === "mobile" && "w-full justify-between p-1",
        className
      )}
    >
      {TEXT_SCALES.map((scale) => {
        const isActive = currentScale === scale.value;
        return (
          <button
            key={scale.value}
            type="button"
            aria-label={scale.label}
            aria-pressed={isActive}
            onClick={() => handleSelectScale(scale.value)}
            className={cn(
              "focus-visible:ring-primary/40 flex cursor-pointer items-center justify-center rounded-md font-bold transition-all focus-visible:ring-2 focus-visible:outline-none",
              variant === "header" && "h-8 px-2.5 text-xs",
              variant === "mobile" && "h-11 flex-1 text-sm",
              isActive
                ? "bg-primary shadow-soft-xs text-white"
                : "text-muted hover:bg-surface-alt/80 hover:text-text"
            )}
          >
            <span
              className={cn(
                scale.value === "100" && "text-[11px]",
                scale.value === "115" && "text-xs",
                scale.value === "130" && "text-sm font-extrabold"
              )}
            >
              {scale.displayLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
