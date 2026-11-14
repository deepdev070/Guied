"use client";

import React, { useState, useMemo } from "react";
import { StepList, type StepItem } from "@/components/ui/StepList";
import type { Step } from "@/types/content";
import { Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepsSectionProps {
  steps: Step[];
}

export function StepsSection({ steps }: StepsSectionProps) {
  const [filterMode, setFilterMode] = useState<"all" | "online" | "office">("all");

  // Determine if task supports both online and offline counter steps
  const { hasOnline, hasOffice } = useMemo(() => {
    let online = false;
    let office = false;
    for (const s of steps) {
      const lower = (s.where || "").toLowerCase();
      if (lower.includes("online") || lower.includes("portal")) online = true;
      if (
        lower.includes("rto") ||
        lower.includes("counter") ||
        lower.includes("office") ||
        lower.includes("centre") ||
        lower.includes("track") ||
        lower.includes("physical")
      ) {
        office = true;
      }
    }
    return { hasOnline: online, hasOffice: office };
  }, [steps]);

  const supportsBoth = hasOnline && hasOffice;

  // Filter steps based on toggle selection
  const filteredSteps = useMemo(() => {
    if (filterMode === "all") return steps;

    return steps.filter((s) => {
      const lower = (s.where || "").toLowerCase();
      if (filterMode === "online") {
        return lower.includes("online") || lower.includes("portal");
      }
      if (filterMode === "office") {
        return (
          lower.includes("rto") ||
          lower.includes("counter") ||
          lower.includes("office") ||
          lower.includes("centre") ||
          lower.includes("track") ||
          lower.includes("physical")
        );
      }
      return true;
    });
  }, [steps, filterMode]);

  const formattedSteps: StepItem[] = filteredSteps.map((s, idx) => ({
    stepNumber: s.stepNumber || idx + 1,
    title: s.title,
    description: s.description,
    where: s.where,
    timeEstimate: s.estimatedTime,
    callout: s.calloutText
      ? {
          variant: s.calloutType || "tip",
          title: s.calloutTitle,
          content: s.calloutText,
        }
      : undefined,
    link: s.officialLinkUrl
      ? {
          href: s.officialLinkUrl,
          label: s.officialLinkLabel || "Official Portal",
          isExternal: true,
        }
      : undefined,
  }));

  return (
    <section id="steps" aria-labelledby="steps-heading" className="my-12 scroll-mt-28">
      <div className="border-border/80 mb-6 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 id="steps-heading" className="text-h2 text-text font-bold tracking-tight">
            Step-by-Step Procedure
          </h2>
          <p className="text-small text-muted mt-1">
            Follow these sequential steps from online registration to final counter collection.
          </p>
        </div>

        {/* Online / At Office Toggle Filter when task supports both */}
        {supportsBoth && (
          <div
            role="group"
            aria-label="Filter steps by location"
            className="rounded-chip border-border bg-surface-alt/80 flex items-center border p-1"
          >
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              aria-pressed={filterMode === "all"}
              className={cn(
                "rounded-chip px-3 py-1 text-xs font-semibold transition-all",
                filterMode === "all"
                  ? "text-primary shadow-soft-xs bg-white"
                  : "text-muted hover:text-text"
              )}
            >
              All Steps ({steps.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("online")}
              aria-pressed={filterMode === "online"}
              className={cn(
                "rounded-chip px-3 py-1 text-xs font-semibold transition-all",
                filterMode === "online"
                  ? "text-primary shadow-soft-xs bg-white"
                  : "text-muted hover:text-text"
              )}
            >
              Online Only
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("office")}
              aria-pressed={filterMode === "office"}
              className={cn(
                "rounded-chip px-3 py-1 text-xs font-semibold transition-all",
                filterMode === "office"
                  ? "text-primary shadow-soft-xs bg-white"
                  : "text-muted hover:text-text"
              )}
            >
              At Office Counter
            </button>
          </div>
        )}
      </div>

      <StepList steps={formattedSteps} />

      {/* Post-submission tracking & document collection guidance */}
      <div className="rounded-card border-success/30 bg-success-soft/25 mt-8 border p-5">
        <div className="flex items-start gap-3.5">
          <div className="bg-success mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-body text-text font-bold">
              What to Do After Submission: Status Tracking & Collection
            </h3>
            <p className="text-small text-muted mt-1 leading-relaxed">
              Once you submit your application and biometric verification is complete:
            </p>
            <ul className="text-small text-muted mt-2 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Keep the Acknowledgement Slip:</strong> Safely note your Application
                  Number or SMS reference to track status on the official portal.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Delivery via Speed Post:</strong> Physical cards or renewed booklets are
                  dispatched to your registered address via India Post Speed Post with tracking.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Digital Download (DigiLocker / mParivahan):</strong> Legally valid digital
                  documents become available on DigiLocker immediately upon counter approval under
                  IT Act Rule 9A.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
