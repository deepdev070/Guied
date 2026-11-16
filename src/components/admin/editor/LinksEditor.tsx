"use client";

import React from "react";
import { Plus, Trash2, Link2 } from "lucide-react";
import type { OfficialLink } from "@/types/content";

export interface LinksEditorProps {
  officialLinks: OfficialLink[];
  onChange: (links: OfficialLink[]) => void;
}

export function LinksEditor({ officialLinks, onChange }: LinksEditorProps) {
  const handleAdd = () => {
    const newLink: OfficialLink = {
      label: "Official Government Portal",
      url: "https://parivahan.gov.in",
      isPrimary: officialLinks.length === 0,
      department: "Ministry of Road Transport and Highways",
      portalName: "Parivahan Sewa",
      status: "PUBLISHED",
    };
    onChange([...officialLinks, newLink]);
  };

  const handleRemove = (index: number) => {
    onChange(officialLinks.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<OfficialLink>) => {
    const copy = [...officialLinks];
    const existing = copy[index];
    if (existing) {
      copy[index] = { ...existing, ...updates };
      // If setting isPrimary to true, set others to false
      if (updates.isPrimary) {
        copy.forEach((l, i) => {
          if (i !== index) l.isPrimary = false;
        });
      }
      onChange(copy);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">
            Official Government Portals & Sources ({officialLinks.length})
          </h2>
          <p className="text-xs text-[#6B7280]">
            Direct links to authentic .gov.in or .nic.in portals where citizens apply.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Official Link</span>
        </button>
      </div>

      {officialLinks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
          At least 1 official government link is required for publishing.
        </div>
      ) : (
        <div className="space-y-3">
          {officialLinks.map((link, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                  <Link2 className="h-3.5 w-3.5 text-[#003366]" />
                  <span>
                    Portal #{idx + 1}: {link.label || "Untitled Portal"}
                    {link.isPrimary && (
                      <span className="ml-2 rounded bg-[#E6F4EA] px-1.5 py-0.5 text-[10px] font-bold text-[#137333]">
                        PRIMARY
                      </span>
                    )}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="rounded p-1 text-[#C5221F] hover:bg-[#FCE8E6]"
                  title="Remove link"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Button / Link Label *
                  </label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdate(idx, { label: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Apply Online on Sarathi Parivahan"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Official URL (.gov.in / .nic.in) *
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdate(idx, { url: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="https://sarathi.parivahan.gov.in/..."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Portal Name
                  </label>
                  <input
                    type="text"
                    value={link.portalName || ""}
                    onChange={(e) => handleUpdate(idx, { portalName: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Parivahan Sewa"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                    Governing Ministry / Department
                  </label>
                  <input
                    type="text"
                    value={link.department || ""}
                    onChange={(e) => handleUpdate(idx, { department: e.target.value })}
                    className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    placeholder="e.g. Ministry of Road Transport & Highways"
                  />
                </div>

                <div className="pt-1 sm:col-span-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#374151]">
                    <input
                      type="checkbox"
                      checked={Boolean(link.isPrimary)}
                      onChange={(e) => handleUpdate(idx, { isPrimary: e.target.checked })}
                      className="rounded border-[#D1D5DB] text-[#003366] focus:ring-[#003366]"
                    />
                    <span>Set as Primary Application Portal (Highlighted Call-to-Action)</span>
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
