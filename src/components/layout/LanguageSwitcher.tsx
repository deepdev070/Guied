"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { SUPPORTED_LOCALES, LOCALES_META } from "@/i18n";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LanguageSwitcherProps {
  variant?: "header" | "footer" | "mobile";
  className?: string;
}

/**
 * Universal Accessible Language Switcher Component (Prompt 97).
 * - Displays native language names: English, हिन्दी, ગુજરાતી.
 * - Keeps user on the exact same page in the selected language.
 * - Remembers choice across sessions via localStorage and 1-year cookie.
 * - Fully responsive with touch-friendly targets for small screens (360px+).
 */
export function LanguageSwitcher({ variant = "header", className }: LanguageSwitcherProps) {
  const { locale, setLocale, isPending } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentMeta = LOCALES_META[locale];

  // 1. FOOTER VARIANT (Inline segmented touch buttons)
  if (variant === "footer") {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-1.5", className)}
        role="region"
        aria-label="Language selection"
        data-language-switcher="footer"
      >
        {SUPPORTED_LOCALES.map((loc) => {
          const meta = LOCALES_META[loc];
          const isSelected = locale === loc;
          return (
            <button
              key={loc}
              type="button"
              disabled={isPending}
              onClick={() => setLocale(loc)}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "rounded-input focus-visible:ring-primary/40 flex min-h-[44px] items-center justify-center border px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:ring-3 focus-visible:outline-none",
                isSelected
                  ? "border-primary bg-primary shadow-soft-xs text-white"
                  : "border-border text-muted hover:text-text hover:bg-surface hover:border-primary/40 bg-white"
              )}
            >
              <span>{meta.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. MOBILE DRAWER VARIANT (Large 3-grid touch buttons)
  if (variant === "mobile") {
    return (
      <div
        className={cn("grid grid-cols-3 gap-2", className)}
        role="region"
        aria-label="Language options"
        data-language-switcher="mobile"
      >
        {SUPPORTED_LOCALES.map((loc) => {
          const meta = LOCALES_META[loc];
          const isSelected = locale === loc;
          return (
            <button
              key={loc}
              type="button"
              disabled={isPending}
              onClick={() => setLocale(loc)}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "rounded-input focus-visible:ring-primary/40 flex min-h-[44px] flex-col items-center justify-center border p-2 text-center transition-all focus-visible:ring-3 focus-visible:outline-none",
                isSelected
                  ? "border-primary bg-primary shadow-soft-xs font-bold text-white"
                  : "border-border text-muted hover:text-text hover:bg-surface bg-white font-medium"
              )}
            >
              <span className="text-sm">{meta.nativeName}</span>
              <span className="text-[10px] opacity-80">{meta.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. HEADER VARIANT (Compact dropdown with native names)
  return (
    <div ref={containerRef} className={cn("relative", className)} data-language-switcher="header">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-chip border-border bg-surface text-text hover:border-primary hover:bg-surface-alt focus-visible:ring-primary/40 flex min-h-[40px] items-center gap-1.5 border px-3 py-1 text-xs font-semibold shadow-xs transition-colors focus-visible:ring-3 focus-visible:outline-none sm:min-h-[44px]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentMeta.nativeName} (${currentMeta.name}). Click to change.`}
      >
        <Globe className="text-muted h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="font-bold">{currentMeta.nativeName}</span>
        <ChevronDown
          className={cn(
            "text-muted h-3 w-3 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="rounded-card border-border shadow-soft-lg animate-in fade-in-0 zoom-in-95 absolute right-0 z-50 mt-1.5 w-44 border bg-white py-1.5"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const meta = LOCALES_META[loc];
            const isSelected = locale === loc;
            return (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={cn(
                  "hover:bg-surface-alt focus-visible:bg-surface-alt flex min-h-[44px] w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none",
                  isSelected ? "bg-primary-soft text-primary font-bold" : "text-text"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-sm leading-snug">{meta.nativeName}</span>
                  <span className="text-muted text-[10px]">{meta.name}</span>
                </div>
                {isSelected && (
                  <Check className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
