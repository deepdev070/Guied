"use client";

import React from "react";
import { Clock, IndianRupee, Globe2, Building2, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AtAGlanceProps {
  estimatedTime: string;
  cost: string;
  whereToApply?: "online" | "offline" | "both";
  difficulty: "easy" | "medium" | "hard";
  bestFor?: string;
  totalDocuments?: number;
  className?: string;
}

export function AtAGlance({
  estimatedTime,
  cost,
  whereToApply = "both",
  difficulty,
  bestFor,
  totalDocuments = 0,
  className,
}: AtAGlanceProps) {
  const whereLabel = {
    online: "100% Online",
    offline: "At Office Counter",
    both: "Online + Office Visit",
  }[whereToApply];

  const WhereIcon =
    whereToApply === "online" ? Globe2 : whereToApply === "offline" ? Building2 : Layers;

  const difficultyLabel = {
    easy: "Easy (Single visit)",
    medium: "Moderate (Test required)",
    hard: "Multi-step procedure",
  }[difficulty];

  const difficultyColor = {
    easy: "text-success bg-success-soft border-success/30",
    medium: "text-warning bg-warning-soft border-warning/30",
    hard: "text-danger bg-danger-soft border-danger/30",
  }[difficulty];

  const handleStartChecklist = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const docSection = document.getElementById("documents");
    if (docSection) {
      docSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="At a glance service summary"
      className={cn(
        "rounded-card border-border to-primary-soft/25 shadow-soft-xs my-6 border bg-gradient-to-br from-white via-white p-5 sm:p-6",
        className
      )}
    >
      <div className="border-border/70 mb-4 flex items-center justify-between border-b pb-3">
        <h2 className="text-text text-xs font-bold tracking-wider uppercase">At a Glance</h2>
        {totalDocuments > 0 && (
          <span className="text-muted text-xs font-medium">
            {totalDocuments} documents required
          </span>
        )}
      </div>

      {/* 4 Big Facts */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Fact 1: Time needed */}
        <div className="rounded-input border-border/60 flex flex-col border bg-white/80 p-3">
          <div className="text-muted flex items-center gap-1.5 text-xs font-medium">
            <Clock className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Time Needed</span>
          </div>
          <span className="text-body text-text mt-1 font-bold">{estimatedTime}</span>
        </div>

        {/* Fact 2: Total cost */}
        <div className="rounded-input border-border/60 flex flex-col border bg-white/80 p-3">
          <div className="text-muted flex items-center gap-1.5 text-xs font-medium">
            <IndianRupee className="text-success h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Official Fee</span>
          </div>
          <span className="text-body text-text mt-1 font-bold">{cost}</span>
        </div>

        {/* Fact 3: Where to apply */}
        <div className="rounded-input border-border/60 flex flex-col border bg-white/80 p-3">
          <div className="text-muted flex items-center gap-1.5 text-xs font-medium">
            <WhereIcon className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Where to Apply</span>
          </div>
          <span className="text-body text-text mt-1 font-bold">{whereLabel}</span>
        </div>

        {/* Fact 4: Difficulty */}
        <div className="rounded-input border-border/60 flex flex-col border bg-white/80 p-3">
          <div className="text-muted flex items-center gap-1.5 text-xs font-medium">
            <Layers className="text-muted h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Procedure</span>
          </div>
          <div className="mt-1 flex items-center">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold",
                difficultyColor
              )}
            >
              {difficultyLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Best for & Start Checklist Row */}
      <div className="border-border/70 mt-5 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small text-muted leading-relaxed">
          <strong className="text-text font-semibold">Best for: </strong>
          {bestFor ||
            "Indian citizens preparing application documents before visiting the office counter or applying online."}
        </p>

        <a
          href="#documents"
          onClick={handleStartChecklist}
          className="rounded-input bg-success hover:bg-success/90 focus-visible:ring-success/40 shadow-soft-xs inline-flex h-11 shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold text-white transition-all focus-visible:ring-3 focus-visible:outline-none active:scale-98"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>Start Checklist</span>
        </a>
      </div>
    </section>
  );
}
