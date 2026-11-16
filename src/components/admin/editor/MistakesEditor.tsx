"use client";

import React from "react";
import { Plus, Trash2, AlertOctagon } from "lucide-react";
import type { RejectionReason } from "@/types/content";

export interface MistakesEditorProps {
  rejectionReasons: RejectionReason[];
  onChange: (reasons: RejectionReason[]) => void;
}

export function MistakesEditor({ rejectionReasons, onChange }: MistakesEditorProps) {
  const handleAdd = () => {
    const newReason: RejectionReason = {
      title: "Common Rejection Reason",
      description: "Explain why official counter staff reject or delay the application.",
      solution: "Provide the exact corrective action the applicant should take in advance.",
      status: "PUBLISHED",
    };
    onChange([...rejectionReasons, newReason]);
  };

  const handleRemove = (index: number) => {
    onChange(rejectionReasons.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<RejectionReason>) => {
    const copy = [...rejectionReasons];
    const existing = copy[index];
    if (existing) {
      copy[index] = { ...existing, ...updates };
      onChange(copy);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">
            Rejection Reasons & Mistakes to Avoid ({rejectionReasons.length})
          </h2>
          <p className="text-xs text-[#6B7280]">
            Proactive alerts warning citizens of frequent errors and how to prevent them.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Rejection Reason</span>
        </button>
      </div>

      {rejectionReasons.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
          No rejection reasons added.
        </div>
      ) : (
        <div className="space-y-3">
          {rejectionReasons.map((reason, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#C5221F]">
                  <AlertOctagon className="h-3.5 w-3.5" />
                  <span>
                    Mistake #{idx + 1}: {reason.title || "Untitled Issue"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="rounded p-1 text-[#C5221F] hover:bg-[#FCE8E6]"
                  title="Remove mistake"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Mistake Title *
                  </label>
                  <input
                    type="text"
                    value={reason.title}
                    onChange={(e) => handleUpdate(idx, { title: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Name Spelling Mismatch Across ID Proofs"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Why it Causes Rejection / Delay *
                  </label>
                  <textarea
                    rows={2}
                    value={reason.description}
                    onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="Explain the consequence at the verification portal or counter."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    How to Prevent / Corrective Solution *
                  </label>
                  <textarea
                    rows={2}
                    value={reason.solution}
                    onChange={(e) => handleUpdate(idx, { solution: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="Exact corrective action (e.g. get gazette notification or update Aadhaar first)."
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
