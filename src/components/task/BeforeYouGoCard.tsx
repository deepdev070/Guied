"use client";

import React, { useState } from "react";
import {
  FolderCheck,
  Copy,
  Camera,
  CreditCard,
  FileText,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { getDefaultBeforeYouGoItems } from "@/lib/before-you-go";
import type { BeforeYouGo, BeforeYouGoItem, DocumentRequirement, Fee } from "@/types/content";

export interface BeforeYouGoCardProps {
  taskTitle: string;
  stateName?: string;
  beforeYouGo?: BeforeYouGo;
  documents?: DocumentRequirement[];
  fees?: Fee[];
  className?: string;
}

export function BeforeYouGoCard({
  taskTitle,
  stateName,
  beforeYouGo,
  className = "",
}: BeforeYouGoCardProps) {
  const items: BeforeYouGoItem[] =
    beforeYouGo?.items && beforeYouGo.items.length >= 5
      ? beforeYouGo.items
      : getDefaultBeforeYouGoItems(taskTitle);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const isAllChecked = items.length > 0 && checkedIds.length === items.length;

  const renderIcon = (index: number) => {
    switch (index) {
      case 0:
        return <FolderCheck className="text-primary h-5 w-5" aria-hidden="true" />;
      case 1:
        return <Copy className="text-primary h-5 w-5" aria-hidden="true" />;
      case 2:
        return <Camera className="text-primary h-5 w-5" aria-hidden="true" />;
      case 3:
        return <CreditCard className="text-primary h-5 w-5" aria-hidden="true" />;
      default:
        return <FileText className="text-primary h-5 w-5" aria-hidden="true" />;
    }
  };

  return (
    <section
      aria-label="Before you leave home checklist"
      className={`rounded-card border-border bg-surface-alt/30 shadow-soft-xs border p-5 sm:p-6 print:hidden ${className}`}
    >
      {/* Header */}
      <div className="border-border/80 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-accent-soft text-warning rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              Final Counter Prep
            </span>
            <span className="text-muted text-xs font-semibold">
              {checkedIds.length} of {items.length} Checked
            </span>
          </div>
          <h2 className="text-h3 text-text mt-1 font-black tracking-tight">
            {beforeYouGo?.title || "Before You Leave Home"}
          </h2>
          <p className="text-muted mt-0.5 text-xs">
            {beforeYouGo?.subtitle ||
              `Verify these 5 essential physical items before walking out your door${stateName ? ` in ${stateName}` : ""}.`}
          </p>
        </div>

        {checkedIds.length > 0 && (
          <button
            type="button"
            onClick={() => setCheckedIds([])}
            className="text-muted hover:text-text inline-flex cursor-pointer items-center gap-1 self-start text-xs font-semibold sm:self-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset checks</span>
          </button>
        )}
      </div>

      {/* 5 Final Checks List */}
      <div className="mt-5 space-y-3">
        {items.map((item, index) => {
          const isChecked = checkedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`rounded-input flex cursor-pointer items-start gap-3.5 border p-3.5 transition-all ${
                isChecked
                  ? "border-success/40 bg-success-soft/30 shadow-soft-xs"
                  : "border-border bg-background hover:border-primary/40 hover:bg-surface-alt/50"
              }`}
            >
              {/* Checkbox indicator */}
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  isChecked ? "border-success bg-success text-white" : "border-border bg-background"
                }`}
                aria-hidden="true"
              >
                {isChecked && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
              </div>

              {/* Icon badge */}
              <div className="bg-primary-soft/60 mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full sm:flex">
                {renderIcon(index)}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted text-[11px] font-bold uppercase">
                    Check #{index + 1}
                  </span>
                  <h3
                    className={`text-xs font-bold sm:text-sm ${isChecked ? "text-success line-through" : "text-text"}`}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted mt-1 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success banner when all 5 are checked */}
      {isAllChecked && (
        <div className="rounded-input border-success/40 bg-success-soft/50 text-success animate-fadeIn mt-4 flex items-center gap-2.5 border p-3.5 text-xs font-bold">
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            🎉 All 5 physical checks ready! You are 100% prepared to visit the counter with zero
            rejection risk.
          </span>
        </div>
      )}
    </section>
  );
}
