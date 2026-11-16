"use client";

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { Step } from "@/types/content";

export interface StepsEditorProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export function StepsEditor({ steps, onChange }: StepsEditorProps) {
  const handleAddStep = () => {
    const newStep: Step = {
      stepNumber: steps.length + 1,
      title: "New Procedure Step",
      description: "Explain clearly what the citizen needs to do at this stage.",
      where: "Online (State Portal)",
      estimatedTime: "15 minutes",
      status: "PUBLISHED",
    };
    onChange([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    onChange(renumbered);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const copy = [...steps];
    const item = copy[index];
    const target = copy[targetIndex];
    if (item && target) {
      copy[index] = target;
      copy[targetIndex] = item;
      // Renumber
      const renumbered = copy.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
      onChange(renumbered);
    }
  };

  const handleUpdate = (index: number, updates: Partial<Step>) => {
    const copy = [...steps];
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
            Step-by-Step Procedure ({steps.length})
          </h2>
          <p className="text-xs text-[#6B7280]">
            Sequential steps guiding the citizen from start to completion.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddStep}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Step</span>
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
          No steps added yet. Add at least 1 step to describe the procedure.
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="max-w-xs truncate text-xs font-bold text-[#111827] sm:max-w-md">
                    {step.title || "Untitled Step"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="mx-1 h-3.5 w-px bg-[#E5E7EB]" />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="rounded p-1 text-[#C5221F] hover:bg-[#FCE8E6]"
                    title="Remove step"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Step Title */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Step Title *
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleUpdate(idx, { title: e.target.value })}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="e.g. Fill Form 2 on Parivahan Sewa"
                      required
                    />
                  </div>

                  {/* Where */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Location / Mode
                    </label>
                    <input
                      type="text"
                      value={step.where || ""}
                      onChange={(e) => handleUpdate(idx, { where: e.target.value })}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="e.g. Online or RTO Counter"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Step Instructions *
                  </label>
                  <textarea
                    rows={3}
                    value={step.description}
                    onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="Clear instructions written in plain language (Class 8 reading level, <= 25 words per sentence)."
                    required
                  />
                </div>

                {/* Estimated Time & Callout */}
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-[#6B7280] uppercase">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={step.estimatedTime || ""}
                      onChange={(e) => handleUpdate(idx, { estimatedTime: e.target.value })}
                      className="w-full rounded border border-[#D1D5DB] bg-white px-2.5 py-1 text-xs text-[#111827]"
                      placeholder="e.g. 15–20 minutes"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-[#6B7280] uppercase">
                      Highlight Callout Type
                    </label>
                    <select
                      value={step.calloutType || ""}
                      onChange={(e) =>
                        handleUpdate(idx, {
                          calloutType:
                            (e.target.value as "tip" | "important" | "warning" | "success") ||
                            undefined,
                        })
                      }
                      className="w-full rounded border border-[#D1D5DB] bg-white px-2 py-1 text-xs text-[#111827]"
                    >
                      <option value="">None</option>
                      <option value="tip">Tip (Helpful advisory)</option>
                      <option value="important">Important (Must follow)</option>
                      <option value="warning">Warning (Risk of delay)</option>
                      <option value="success">Success</option>
                    </select>
                  </div>

                  {step.calloutType && (
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-[#6B7280] uppercase">
                        Callout Note Text
                      </label>
                      <input
                        type="text"
                        value={step.calloutText || ""}
                        onChange={(e) => handleUpdate(idx, { calloutText: e.target.value })}
                        className="w-full rounded border border-[#D1D5DB] bg-white px-2.5 py-1 text-xs text-[#111827]"
                        placeholder="e.g. Keep acknowledgment receipt saved as PDF"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
