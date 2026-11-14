"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import type { ThinContentCheckResult } from "@/lib/thin-content-guard";

export interface ThinContentWarningProps {
  checkResult: ThinContentCheckResult;
  className?: string;
}

/**
 * Admin Warning Banner (Prompt 83)
 * Alerts administrators and editors when a page fails the Google/AdSense publishing gate.
 */
export function ThinContentWarning({ checkResult, className = "" }: ThinContentWarningProps) {
  if (checkResult.passed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-label="Thin-content publishing gate warning"
      className={`rounded-card border-danger/40 bg-danger-soft text-danger mb-6 border p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-danger mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          <h4 className="text-danger text-sm font-bold">
            ⚠️ Publishing Gate Warning: Thin Content Detected
          </h4>
          <p className="text-danger/90 text-xs leading-relaxed">
            This guide fails Google Search and Google AdSense &quot;Helpful Content&quot; standards.
            To protect your domain authority, this page is automatically marked with{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 font-mono font-semibold">noindex</code>{" "}
            until the following criteria are met:
          </p>
          <ul className="text-danger/90 mt-2 list-disc space-y-0.5 pl-5 text-xs">
            {checkResult.violations.map((violation, idx) => (
              <li key={idx}>{violation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
