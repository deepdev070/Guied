"use client";

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { DocumentRequirement } from "@/types/content";
import { AppliesWhenBuilder } from "./AppliesWhenBuilder";

export interface DocumentsEditorProps {
  documents: DocumentRequirement[];
  onChange: (docs: DocumentRequirement[]) => void;
}

export function DocumentsEditor({ documents, onChange }: DocumentsEditorProps) {
  const handleAddDoc = () => {
    const newDoc: DocumentRequirement = {
      name: "New Required Document",
      description: "Brief instructions on acceptable format and validity.",
      requirementType: "required",
      copiesHint: "Original + 1 self-attested photocopy",
      displayOrder: documents.length,
      status: "PUBLISHED",
    };
    onChange([...documents, newDoc]);
  };

  const handleRemoveDoc = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= documents.length) return;

    const copy = [...documents];
    const item = copy[index];
    const target = copy[targetIndex];
    if (item && target) {
      copy[index] = target;
      copy[targetIndex] = item;
      onChange(copy);
    }
  };

  const handleUpdate = (index: number, updates: Partial<DocumentRequirement>) => {
    const copy = [...documents];
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
            Document Checklist Requirements ({documents.length})
          </h2>
          <p className="text-xs text-[#6B7280]">
            Citizens check these off before visiting the counter or uploading online.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddDoc}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Document</span>
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
          No documents added yet. At least 1 required document is necessary.
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EBF3FB] text-xs font-bold text-[#003366]">
                    {idx + 1}
                  </span>
                  <span className="max-w-xs truncate text-xs font-bold text-[#111827] sm:max-w-md">
                    {doc.name || "Untitled Document"}
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
                    disabled={idx === documents.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="mx-1 h-3.5 w-px bg-[#E5E7EB]" />
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="rounded p-1 text-[#C5221F] hover:bg-[#FCE8E6]"
                    title="Remove document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Document Name */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Aadhaar Card / Valid Passport"
                    required
                  />
                </div>

                {/* Requirement Type */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Requirement Type
                  </label>
                  <select
                    value={doc.requirementType}
                    onChange={(e) =>
                      handleUpdate(idx, {
                        requirementType: e.target.value as "required" | "optional" | "conditional",
                      })
                    }
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                  >
                    <option value="required">Mandatory (Required)</option>
                    <option value="conditional">Conditional (Specific cases)</option>
                    <option value="optional">Optional / Alternative</option>
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Guidance & Acceptable Variations
                  </label>
                  <input
                    type="text"
                    value={doc.description || ""}
                    onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Must have matching date of birth and full address."
                  />
                </div>

                {/* Copies hint */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Copies & Presentation Hint
                  </label>
                  <input
                    type="text"
                    value={doc.copiesHint || ""}
                    onChange={(e) => handleUpdate(idx, { copiesHint: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. 1 self-attested photocopy"
                  />
                </div>
              </div>

              {/* Visual AppliesWhen Builder */}
              <AppliesWhenBuilder
                value={doc.appliesWhen}
                onChange={(rule) => handleUpdate(idx, { appliesWhen: rule })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
