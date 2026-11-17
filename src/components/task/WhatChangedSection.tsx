"use client";

import React, { useState } from "react";
import { History, ChevronDown, ChevronUp, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { getTaskChangelog, type ChangelogItem } from "@/data/task-changelogs";
import { cn } from "@/lib/utils";

export interface WhatChangedSectionProps {
  taskSlug: string;
  stateCode?: string;
  savedVersion?: string;
  className?: string;
}

export function WhatChangedSection({
  taskSlug,
  stateCode,
  savedVersion,
  className,
}: WhatChangedSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const changelog = getTaskChangelog(taskSlug, stateCode);

  if (changelog.length === 0) {
    return null;
  }

  const savedTime = savedVersion ? new Date(savedVersion).getTime() : 0;

  return (
    <section
      id="what-changed"
      aria-label="What changed in this guide"
      className={cn(
        "shadow-soft-xs rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all sm:p-7",
        className
      )}
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#003366]">
            <History className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
                What Changed in This Guide
              </h2>
              <span className="rounded-full bg-[#E2E8F0] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
                {changelog.length} updates
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Verified changelog of official rule, fee, and portal updates so you never get caught
              out by old rules.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse changelog" : "Expand changelog"}
          className="rounded-lg border border-[#E2E8F0] p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Changelog Timeline Content */}
      {isOpen && (
        <div className="mt-6 border-t border-[#F1F5F9] pt-6">
          <div className="relative ml-2 space-y-6 border-l-2 border-[#E2E8F0] pl-5 sm:pl-6">
            {changelog.map((item, idx) => {
              const itemTime = new Date(item.date).getTime();
              const isNewerThanSaved = savedTime > 0 && !isNaN(itemTime) && itemTime > savedTime;

              const badgeColor =
                item.changeType === "fee"
                  ? "bg-[#E8F7EE] text-[#15803D] border-[#86EFAC]"
                  : item.changeType === "rule"
                    ? "bg-[#EAF1FF] text-[#1D4ED8] border-[#BFDBFE]"
                    : item.changeType === "portal"
                      ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                      : "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]";

              return (
                <div key={item.id} className="group relative">
                  {/* Timeline dot */}
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[27px] h-3.5 w-3.5 rounded-full border-2 bg-white sm:-left-[31px]",
                      isNewerThanSaved
                        ? "border-[#B45309] bg-[#FEF3C7] ring-4 ring-amber-100"
                        : "border-[#003366]"
                    )}
                    aria-hidden="true"
                  />

                  {/* Header Row: Date & Type */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#64748B]">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                        day: "numeric",
                      })}
                    </span>

                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                        badgeColor
                      )}
                    >
                      {item.changeTypeLabel}
                    </span>

                    {isNewerThanSaved && (
                      <span className="inline-flex animate-pulse items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                        <Sparkles className="h-3 w-3 text-amber-800" />
                        <span>UPDATED SINCE YOUR LAST SAVE</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-1.5 text-sm font-bold text-[#0F172A] sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#475569] sm:text-sm">
                    {item.description}
                  </p>

                  {/* Official Source Link */}
                  <div className="mt-2.5 flex items-center gap-1 text-xs">
                    <span className="text-[#64748B]">Official Authority:</span>
                    <a
                      href={item.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#003366] hover:underline"
                    >
                      <span>{item.officialSourceLabel}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy Footnote */}
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#64748B]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#15803D]" />
            <span>
              <strong>Zero Email Required:</strong> Changes are tracked locally in your browser so
              you stay updated without ever receiving promotional emails or spam.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
