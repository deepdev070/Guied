"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Fee } from "@/types/content";

export interface FeesEditorProps {
  fees: Fee[];
  onChange: (fees: Fee[]) => void;
}

export function FeesEditor({ fees, onChange }: FeesEditorProps) {
  const handleAddFee = () => {
    const newFee: Fee = {
      label: "Statutory Application Fee",
      amount: 150,
      currency: "INR",
      paymentMode: "both",
      isOptional: false,
      rulesReference: "Official Gazette Schedule",
      status: "PUBLISHED",
    };
    onChange([...fees, newFee]);
  };

  const handleRemoveFee = (index: number) => {
    onChange(fees.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<Fee>) => {
    const copy = [...fees];
    const existing = copy[index];
    if (existing) {
      copy[index] = { ...existing, ...updates };
      onChange(copy);
    }
  };

  const totalMandatory = fees
    .filter((f) => !f.isOptional)
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">
            Statutory Government Fees ({fees.length})
          </h2>
          <p className="text-xs text-[#6B7280]">
            Official fees mandated by statutory rules. Standard total: ₹
            {totalMandatory.toLocaleString("en-IN")}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddFee}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Fee Item</span>
        </button>
      </div>

      {fees.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
          No fee items added. (If this civic procedure is 100% free of charge, leave empty).
        </div>
      ) : (
        <div className="space-y-3">
          {fees.map((fee, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <span className="text-xs font-bold text-[#111827]">
                  Fee Item #{idx + 1}: {fee.label || "Untitled Fee"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFee(idx)}
                  className="rounded p-1 text-[#C5221F] hover:bg-[#FCE8E6]"
                  title="Remove fee"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Fee Description / Purpose *
                  </label>
                  <input
                    type="text"
                    value={fee.label}
                    onChange={(e) => handleUpdate(idx, { label: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Learner's Licence Test Fee"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Amount (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-[#6B7280]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={fee.amount}
                      onChange={(e) =>
                        handleUpdate(idx, { amount: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] py-1.5 pr-3 pl-6 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Payment Mode
                  </label>
                  <select
                    value={fee.paymentMode || "both"}
                    onChange={(e) =>
                      handleUpdate(idx, {
                        paymentMode: e.target.value as "online" | "counter" | "both",
                      })
                    }
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                  >
                    <option value="both">Online & Counter</option>
                    <option value="online">Online Only</option>
                    <option value="counter">At Office Counter Only</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Statutory Rule Reference
                  </label>
                  <input
                    type="text"
                    value={fee.rulesReference || ""}
                    onChange={(e) => handleUpdate(idx, { rulesReference: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Central Motor Vehicles Rules, 1989 (Rule 32)"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#374151]">
                    <input
                      type="checkbox"
                      checked={Boolean(fee.isOptional)}
                      onChange={(e) => handleUpdate(idx, { isOptional: e.target.checked })}
                      className="rounded border-[#D1D5DB] text-[#003366] focus:ring-[#003366]"
                    />
                    <span>Optional Addon Fee</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
