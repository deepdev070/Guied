"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { HelpCircle, ExternalLink, X } from "lucide-react";
import { getGlossaryTermBySlug, type GlossaryTerm } from "@/data/glossary";

export interface GlossaryTooltipProps {
  termSlug: string;
  displayText?: React.ReactNode;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ termSlug, displayText, children }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "gu">("en");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = useId();

  const term: GlossaryTerm | undefined = getGlossaryTermBySlug(termSlug);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!term) {
    return <>{children || displayText || termSlug}</>;
  }

  const label = children || displayText || term.termEn;

  return (
    <span className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="border-primary text-text hover:text-primary inline-flex cursor-help items-center gap-0.5 border-b border-dotted font-semibold transition-colors"
      >
        <span>{label}</span>
        <HelpCircle className="text-primary/70 inline h-3 w-3" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          onMouseLeave={() => setIsOpen(false)}
          className="rounded-card border-border bg-background shadow-soft-xl absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 border p-3.5 text-left text-xs sm:w-80"
        >
          {/* Header */}
          <div className="border-border/80 flex items-start justify-between gap-2 border-b pb-2">
            <div>
              <span className="text-text block text-sm font-bold">{term.termEn}</span>
              <span className="text-muted text-[11px]">
                {activeLang === "en"
                  ? term.termHi
                  : activeLang === "hi"
                    ? term.termGu
                    : term.termHi}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close tooltip"
              className="text-muted hover:text-text cursor-pointer rounded p-0.5"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="rounded-input bg-surface-alt mt-2 flex gap-1 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveLang("en")}
              className={`flex-1 rounded px-1.5 py-0.5 transition-colors ${
                activeLang === "en"
                  ? "bg-background text-primary shadow-soft-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("hi")}
              className={`flex-1 rounded px-1.5 py-0.5 transition-colors ${
                activeLang === "hi"
                  ? "bg-background text-primary shadow-soft-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("gu")}
              className={`flex-1 rounded px-1.5 py-0.5 transition-colors ${
                activeLang === "gu"
                  ? "bg-background text-primary shadow-soft-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              ગુજરાતી
            </button>
          </div>

          {/* Definition */}
          <p className="text-text mt-2 text-xs leading-relaxed">
            {activeLang === "en" ? term.defEn : activeLang === "hi" ? term.defHi : term.defGu}
          </p>

          {/* Footer link */}
          <div className="border-border/60 mt-3 flex items-center justify-between border-t pt-2">
            <span className="text-muted text-[10px]">Class 8 Verified Guide</span>
            <Link
              href={`/glossary/${term.slug}`}
              className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-xs font-bold"
              onClick={() => setIsOpen(false)}
            >
              <span>Full Details</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </span>
  );
}
