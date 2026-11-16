"use client";

import React from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import type { FaqItem } from "@/types/content";

export interface FaqEditorProps {
  faqItems: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}

export function FaqEditor({ faqItems, onChange }: FaqEditorProps) {
  const handleAdd = () => {
    const newItem: FaqItem = {
      question: "Frequently Asked Question",
      answer: "Clear, factual answer citing official guidelines.",
      displayOrder: faqItems.length,
      status: "PUBLISHED",
    };
    onChange([...faqItems, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(faqItems.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<FaqItem>) => {
    const copy = [...faqItems];
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
            Frequently Asked Questions ({faqItems.length})
          </h2>
          <p className="text-xs text-[#6B7280]">
            Common queries answered in plain language (at least 3 FAQs recommended for SEO).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add FAQ</span>
        </button>
      </div>

      {faqItems.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
          No FAQs added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {faqItems.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                  <HelpCircle className="h-3.5 w-3.5 text-[#003366]" />
                  <span>
                    Q#{idx + 1}: {faq.question || "Untitled Question"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="rounded p-1 text-[#C5221F] hover:bg-[#FCE8E6]"
                  title="Remove FAQ"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdate(idx, { question: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Can I take the learner licence test from home?"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Answer *
                  </label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => handleUpdate(idx, { answer: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="Answer clearly citing portal capabilities and requirements."
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
