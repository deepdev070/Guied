"use client";

import React, { useState, useMemo } from "react";
import { Calculator, IndianRupee, ExternalLink, ShieldCheck, Check } from "lucide-react";
import type { FeeCalculatorConfig } from "@/types/content";

export interface FeeCalculatorProps {
  config: FeeCalculatorConfig;
  className?: string;
}

export function FeeCalculator({ config, className = "" }: FeeCalculatorProps) {
  // Initialize selections with defaultChoiceId from config
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const opt of config.options) {
      initial[opt.id] = opt.defaultChoiceId;
    }
    return initial;
  });

  const handleSelect = (optionId: string, choiceId: string) => {
    setSelections((prev) => ({
      ...prev,
      [optionId]: choiceId,
    }));
  };

  // Calculate live breakdown and total
  const { total, breakdown } = useMemo(() => {
    let currentTotal = config.baseFee;
    const activeBreakdown: Array<{ label: string; amount: number }> = [
      { label: config.baseFeeLabel || "Base statutory fee", amount: config.baseFee },
    ];

    for (const opt of config.options) {
      const selectedChoiceId = selections[opt.id] || opt.defaultChoiceId;
      const choice = opt.choices.find((c) => c.id === selectedChoiceId);
      if (choice) {
        currentTotal += choice.amount;
        if (choice.amount !== 0) {
          activeBreakdown.push({
            label: `${opt.label}: ${choice.label}`,
            amount: choice.amount,
          });
        }
      }
    }

    return {
      total: Math.max(0, currentTotal),
      breakdown: activeBreakdown,
    };
  }, [config, selections]);

  return (
    <div
      aria-label="Interactive Total Cost Calculator"
      className={`rounded-card border-border bg-background shadow-soft-xs border p-5 md:p-6 ${className}`}
    >
      {/* Header */}
      <div className="border-border/80 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary-soft text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-body text-text font-bold">
              {config.title || "Customise & Calculate Total Fee"}
            </h3>
            <p className="text-muted text-xs">
              {config.description ||
                "Select your required processing speed, booklet pages, and options to see your live official total."}
            </p>
          </div>
        </div>

        {config.rulesReference && (
          <span className="bg-surface-alt text-muted self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto">
            {config.rulesReference}
          </span>
        )}
      </div>

      {/* Options Selection Grid */}
      <div className="mt-5 space-y-5">
        {config.options.map((opt) => {
          const currentChoiceId = selections[opt.id] || opt.defaultChoiceId;

          return (
            <div key={opt.id} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-text text-xs font-bold">{opt.label}</span>
                {opt.description && (
                  <span className="text-muted text-[11px]">{opt.description}</span>
                )}
              </div>

              {/* Choices radio-style tiles */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {opt.choices.map((choice) => {
                  const isSelected = currentChoiceId === choice.id;
                  const deltaString =
                    choice.amount > 0
                      ? `+₹${choice.amount.toLocaleString("en-IN")}`
                      : choice.amount < 0
                        ? `-₹${Math.abs(choice.amount).toLocaleString("en-IN")}`
                        : "Included";

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelect(opt.id, choice.id)}
                      className={`rounded-input flex cursor-pointer items-center justify-between border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary-soft/40 shadow-soft-xs ring-primary/40 ring-1"
                          : "border-border bg-surface-alt/40 hover:border-border/80 hover:bg-surface-alt"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-background"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-text text-xs font-bold">{choice.label}</div>
                          {choice.description && (
                            <div className="text-muted text-[11px] leading-tight">
                              {choice.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                          choice.amount > 0
                            ? "bg-accent-soft text-warning"
                            : choice.amount < 0
                              ? "bg-success-soft text-success"
                              : "bg-surface text-muted"
                        }`}
                      >
                        {deltaString}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Calculated Total Banner */}
      <div className="rounded-input border-success/30 bg-success-soft/30 mt-6 border p-4.5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-muted block text-xs font-semibold tracking-wider uppercase">
              Official Live Total
            </span>
            <div className="text-text mt-1 flex items-center text-2xl font-black">
              <IndianRupee className="text-success h-6 w-6" aria-hidden="true" />
              <span>{total.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-muted mt-1 text-xs">
              Exact statutory fee to pay on the official government portal.
            </p>
          </div>

          {/* Official Source Link */}
          <div className="flex flex-col sm:items-end">
            <a
              href={config.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-input bg-background border-border/80 hover:border-primary/50 hover:bg-primary-soft/30 text-text inline-flex cursor-pointer items-center gap-2 border px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <ShieldCheck className="text-success h-4 w-4" aria-hidden="true" />
              <span>{config.officialSourceLabel || "Verify on Official Gazette"}</span>
              <ExternalLink className="text-muted h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <span className="text-muted mt-1 text-[11px]">
              No agent commission or extra charges
            </span>
          </div>
        </div>

        {/* Itemized Cost Breakdown */}
        {breakdown.length > 1 && (
          <div className="border-border/60 mt-3.5 border-t pt-3 text-xs">
            <span className="text-muted mb-1.5 block font-bold">Cost Breakdown:</span>
            <div className="space-y-1">
              {breakdown.map((item, idx) => (
                <div key={idx} className="text-muted flex justify-between">
                  <span>{item.label}</span>
                  <span className="text-text font-semibold">
                    {item.amount < 0 ? "-" : ""}₹{Math.abs(item.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
