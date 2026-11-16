"use client";

import React from "react";

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  keywords?: string[];
}

export interface SeoFieldsEditorProps {
  seo: SeoFields;
  onChange: (seo: SeoFields) => void;
  defaultTitle: string;
  defaultSummary: string;
  slug: string;
}

export function SeoFieldsEditor({
  seo,
  onChange,
  defaultTitle,
  defaultSummary,
  slug,
}: SeoFieldsEditorProps) {
  const activeTitle = seo.metaTitle || defaultTitle;
  const activeDesc = seo.metaDescription || defaultSummary;
  const canonical = seo.canonicalUrl || `https://indiapaperwork.in/${slug}`;

  const handleUpdate = (updates: Partial<SeoFields>) => {
    onChange({ ...seo, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5E7EB] pb-2">
        <h2 className="text-sm font-bold text-[#111827]">
          Search Engine Optimization (SEO) & Metadata
        </h2>
        <p className="text-xs text-[#6B7280]">
          Configure Google search snippet preview, social sharing cards, and target keywords.
        </p>
      </div>

      {/* Google Search Snippet Preview */}
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <span className="mb-2 block text-[10px] font-bold tracking-wider text-[#6B7280] uppercase">
          Google Search Result Snippet Preview
        </span>
        <div className="max-w-xl space-y-1 rounded-lg border border-[#E5E7EB] bg-white p-3.5">
          <div className="truncate font-mono text-xs text-[#202124]">{canonical}</div>
          <div className="cursor-pointer truncate text-base font-medium text-[#1A0DAB] hover:underline">
            {activeTitle ? `${activeTitle} | India Paperwork Guide` : "Guide Title"}
          </div>
          <div className="line-clamp-2 text-xs leading-relaxed text-[#4D5156]">
            {activeDesc || "Clear, step-by-step paperwork procedure guide for Indian citizens."}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#374151]">Custom Meta Title</label>
            <span
              className={`text-[10px] ${
                activeTitle.length > 60 ? "font-bold text-[#C5221F]" : "text-[#6B7280]"
              }`}
            >
              {activeTitle.length} / 60 characters (recommended)
            </span>
          </div>
          <input
            type="text"
            value={seo.metaTitle || ""}
            onChange={(e) => handleUpdate({ metaTitle: e.target.value })}
            placeholder={defaultTitle}
            className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#374151]">Meta Description</label>
            <span
              className={`text-[10px] ${
                activeDesc.length > 160 ? "font-bold text-[#C5221F]" : "text-[#6B7280]"
              }`}
            >
              {activeDesc.length} / 160 characters
            </span>
          </div>
          <textarea
            rows={3}
            value={seo.metaDescription || ""}
            onChange={(e) => handleUpdate({ metaDescription: e.target.value })}
            placeholder={defaultSummary}
            className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
          />
        </div>

        {/* Canonical Override */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
            Canonical URL Override
          </label>
          <input
            type="url"
            value={seo.canonicalUrl || ""}
            onChange={(e) => handleUpdate({ canonicalUrl: e.target.value })}
            placeholder={`https://indiapaperwork.in/${slug}`}
            className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
          />
        </div>

        {/* Target Keywords */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
            Target Keywords (Comma Separated)
          </label>
          <input
            type="text"
            value={(seo.keywords || []).join(", ")}
            onChange={(e) =>
              handleUpdate({
                keywords: e.target.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean),
              })
            }
            placeholder="e.g. driving licence, learner licence, parivahan, rto test"
            className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
