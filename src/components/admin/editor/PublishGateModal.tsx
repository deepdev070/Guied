"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, X } from "lucide-react";
import type { PublishGateReport } from "@/lib/admin/publish-gate";

export interface PublishGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PublishGateReport | null;
  onConfirmPublish: () => void;
  isPublishing?: boolean;
}

export function PublishGateModal({
  isOpen,
  onClose,
  report,
  onConfirmPublish,
  isPublishing = false,
}: PublishGateModalProps) {
  if (!isOpen || !report) return null;

  const passedCount = report.checklist.filter((item) => item.passed).length;
  const totalCount = report.checklist.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                report.canPublish ? "bg-[#E6F4EA] text-[#137333]" : "bg-[#FCE8E6] text-[#C5221F]"
              }`}
            >
              {report.canPublish ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 id="publish-gate-title" className="text-lg font-bold text-[#111827]">
                Publishing Quality Gate Audit
              </h2>
              <p className="text-xs text-[#6B7280]">
                {passedCount} of {totalCount} criteria satisfied
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto p-6">
          {report.canPublish ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#CEEAD6] bg-[#E6F4EA] p-4 text-xs text-[#137333]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">All Quality Gate Checks Passed!</p>
                <p className="mt-0.5 text-xs text-[#137333]">
                  This civic paperwork guide satisfies all statutory completeness rules, minimum
                  word count, and official verification standards. It is ready for public release.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-[#F5C2C7] bg-[#FCE8E6] p-4 text-xs text-[#C5221F]">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Publishing Blocked: Thin-Content Guard</p>
                <p className="mt-0.5 text-xs text-[#C5221F]">
                  To protect citizens from inaccurate or thin instructions, civic guides cannot be
                  marked PUBLISHED until all 7 requirements pass.
                </p>
              </div>
            </div>
          )}

          {/* Checklist items */}
          <div className="space-y-2.5">
            {report.checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-xl border p-3.5 text-xs ${
                  item.passed
                    ? "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]"
                    : "border-[#F8D7DA] bg-[#FFF5F5] text-[#721C24]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#137333]" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#C5221F]" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-[#111827]">{item.label}</div>
                    <div className="mt-0.5 text-[11px] text-[#6B7280]">{item.description}</div>
                  </div>
                </div>

                <div className="shrink-0 pl-3 text-right">
                  <div
                    className={`text-xs font-semibold ${
                      item.passed ? "text-[#137333]" : "text-[#C5221F]"
                    }`}
                  >
                    {item.currentValue}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">Req: {item.requiredValue}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Violations detail */}
          {report.violations.length > 0 && (
            <div className="pt-2">
              <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-[#C5221F] uppercase">
                Specific Missing Elements:
              </span>
              <ul className="list-inside list-disc space-y-1 rounded-xl border border-[#F5C2C7] bg-[#FCE8E6] p-3 text-xs text-[#C5221F]">
                {report.violations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-[#4B5563] transition-colors hover:bg-[#F3F4F6]"
          >
            Close & Continue Editing
          </button>

          {report.canPublish && (
            <button
              type="button"
              onClick={onConfirmPublish}
              disabled={isPublishing}
              className="cursor-pointer rounded-lg bg-[#137333] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#0E5826] disabled:opacity-50"
            >
              {isPublishing ? "Publishing Guide..." : "Confirm & Publish to Citizens"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
