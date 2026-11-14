"use client";

import React, { useState } from "react";
import { siteConfig } from "@/lib/site";
import type { MergedTaskVariant } from "@/lib/queries";
import type { TaskContent } from "@/types/content";
import type { StateSeedData } from "../../../prisma/data/states";

export interface PrintTaskViewProps {
  task: TaskContent;
  variant: MergedTaskVariant;
  state?: StateSeedData;
  isStatePage?: boolean;
}

export function PrintTaskView({ task, variant, state, isStatePage = false }: PrintTaskViewProps) {
  const [printDate] = useState<string>(() => {
    try {
      return new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "14 Nov 2026";
    }
  });

  const stateName = isStatePage && state ? state.name : variant.stateName || "All India (National)";
  const mandatoryFees = variant.fees.filter((f) => !f.isOptional);
  const totalMandatory = mandatoryFees.reduce((acc, f) => acc + f.amount, 0);

  return (
    <div
      data-testid="print-task-view"
      className="hidden font-sans print:m-0 print:block print:w-full print:bg-white print:p-0 print:text-black"
    >
      {/* 1. Print Header */}
      <div className="mb-4 border-b-2 border-black pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold tracking-wider text-gray-700 uppercase">
              {siteConfig.name} • Citizen Paperwork Checklist
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{task.name}</h2>
          </div>
          <div className="text-right text-xs text-gray-700">
            <div>
              <strong>State / UT:</strong> {stateName}
            </div>
            <div>
              <strong>Date generated:</strong> {printDate}
            </div>
            {variant.lastVerifiedAt && (
              <div>
                <strong>Verified:</strong> {String(variant.lastVerifiedAt)}
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-700 italic">{variant.summary}</p>
      </div>

      {/* 2. Checklist with Empty Boxes */}
      <section className="mb-6 break-inside-avoid">
        <h2 className="mb-3 border-b border-gray-400 pb-1 text-sm font-bold tracking-wider uppercase">
          Required Documents Checklist ({variant.documentRequirements.length} Items)
        </h2>
        <div className="space-y-2.5">
          {variant.documentRequirements.map((doc, idx) => (
            <div
              key={doc.id || `doc-${idx}`}
              className="flex break-inside-avoid items-start gap-2.5 border-b border-gray-200 pb-2 text-xs"
            >
              {/* Empty Checkbox Box for physical pen checkmark */}
              <div
                data-testid="print-empty-box"
                className="mt-0.5 h-4 w-4 shrink-0 rounded-xs border-2 border-black"
                aria-hidden="true"
              />
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-black">{doc.name}</span>
                  <span className="text-[11px] font-medium text-gray-700">
                    {doc.requirementType === "optional"
                      ? "(Optional)"
                      : doc.requirementType === "conditional"
                        ? "(Conditional)"
                        : "(Mandatory)"}{" "}
                    {doc.copiesHint ? `• ${doc.copiesHint}` : ""}
                  </span>
                </div>
                {doc.description && (
                  <p className="mt-0.5 text-xs leading-snug text-gray-800">{doc.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Statutory Fees in Compact Form */}
      {variant.fees.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="mb-2 border-b border-gray-400 pb-1 text-sm font-bold tracking-wider uppercase">
            Statutory Fees (Official Gazette Rates)
          </h2>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100 text-left">
                <th className="p-1.5 font-bold">Fee Description</th>
                <th className="w-28 p-1.5 font-bold">Type</th>
                <th className="w-24 p-1.5 text-right font-bold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {variant.fees.map((fee, idx) => (
                <tr key={`fee-${idx}`} className="border-b border-gray-200">
                  <td className="p-1.5">{fee.label}</td>
                  <td className="p-1.5 text-gray-700">
                    {fee.isOptional ? "Optional / Fast-track" : "Mandatory"}
                  </td>
                  <td className="p-1.5 text-right font-medium">
                    ₹{fee.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-black bg-gray-50 font-bold">
                <td className="p-1.5" colSpan={2}>
                  Total Mandatory Statutory Fee
                </td>
                <td className="p-1.5 text-right font-bold text-black">
                  ₹{totalMandatory.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1 text-[10px] text-gray-600 italic">
            * Always demand an official computerized government receipt for every rupee paid. Never
            pay unreceipted cash.
          </p>
        </section>
      )}

      {/* 4. Procedure Steps in Compact Form */}
      {variant.steps.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="mb-2 border-b border-gray-400 pb-1 text-sm font-bold tracking-wider uppercase">
            Procedure Steps (Compact Overview)
          </h2>
          <ol className="space-y-1.5 text-xs">
            {variant.steps.map((step) => (
              <li
                key={`step-${step.stepNumber}`}
                className="flex break-inside-avoid items-start gap-2"
              >
                <span className="w-6 shrink-0 font-bold text-black">{step.stepNumber}.</span>
                <div className="flex-1">
                  <span className="font-bold text-black">{step.title}</span>
                  {step.where && (
                    <span className="ml-1 text-[10px] font-medium text-gray-600">
                      [{step.where}]
                    </span>
                  )}
                  <p className="text-[11px] leading-snug text-gray-800">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 5. Official Links with Full URLs */}
      {variant.officialLinks.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="mb-2 border-b border-gray-400 pb-1 text-sm font-bold tracking-wider uppercase">
            Official Portals & Verification URLs
          </h2>
          <ul className="space-y-1.5 text-xs">
            {variant.officialLinks.map((link, idx) => (
              <li key={`link-${idx}`} className="break-inside-avoid">
                <span className="font-bold text-black">{link.label}: </span>
                <span className="font-mono text-[11px] text-blue-900 underline">{link.url}</span>
                {(link.department || link.portalName) && (
                  <span className="ml-1 text-[11px] text-gray-600">
                    ({[link.portalName, link.department].filter(Boolean).join(" • ")})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. Print Footer */}
      <div className="mt-4 break-inside-avoid border-t-2 border-black pt-3 text-center text-xs text-gray-700">
        <p className="font-bold">Generated by {siteConfig.name} - verify on official portal</p>
        <p className="mt-0.5 text-[10px] text-gray-600">
          {siteConfig.baseUrl} • Independent citizen informational resource • Not affiliated with
          any government department
        </p>
      </div>
    </div>
  );
}
