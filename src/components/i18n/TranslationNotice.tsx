"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, HelpCircle } from "lucide-react";
import { type Locale, t } from "@/i18n";

export interface TranslationNoticeProps {
  locale: Locale;
  isReviewed?: boolean;
  className?: string;
}

/**
 * Civic Machine Translation Notice Banner (Prompt 96).
 * Shown on non-English pages that have not yet been reviewed by human civic experts.
 * Prompts citizens to help review and report any mistranslation.
 */
export function TranslationNotice({
  locale,
  isReviewed = false,
  className = "",
}: TranslationNoticeProps) {
  if (locale === "en" || isReviewed) {
    return null;
  }

  const noticeText = t(locale, "translation.machineNotice");
  const helpText = t(locale, "translation.reviewHelp");

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-card border-warning/30 bg-warning-soft/70 text-warning my-4 flex flex-col items-start gap-2 border p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between ${className}`}
      data-translation-notice="machine-unreviewed"
      data-locale={locale}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span className="font-medium text-amber-900">{noticeText}</span>
      </div>

      <Link
        href="/report-mistake"
        className="rounded-input border-warning/40 text-warning shadow-soft-xs inline-flex shrink-0 items-center gap-1.5 border bg-white/80 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{helpText}</span>
      </Link>
    </div>
  );
}
