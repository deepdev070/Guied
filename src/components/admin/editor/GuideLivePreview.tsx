"use client";

import React, { useState } from "react";
import type { TaskContent } from "@/types/content";
import { AtAGlance } from "@/components/task/AtAGlance";
import { DocumentSection } from "@/components/task/DocumentSection";
import { StepsSection } from "@/components/task/StepsSection";
import { FeesSection } from "@/components/task/FeesSection";
import { MistakesSection } from "@/components/task/MistakesSection";
import { FaqSection } from "@/components/task/FaqSection";
import { OfficialLinksSection } from "@/components/task/OfficialLinksSection";
import { ShieldCheck, Eye, Smartphone, Monitor } from "lucide-react";

export interface GuideLivePreviewProps {
  task: TaskContent;
}

export function GuideLivePreview({ task }: GuideLivePreviewProps) {
  const [completedDocs, setCompletedDocs] = useState<string[]>([]);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  const national = task.national;
  const docs = national.documentRequirements || [];
  const steps = national.steps || [];
  const fees = national.fees || [];
  const mistakes = national.rejectionReasons || [];
  const faqs = national.faqItems || [];
  const links = national.officialLinks || [];

  const handleToggleDoc = (docId: string) => {
    setCompletedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleResetDocs = () => {
    setCompletedDocs([]);
  };

  // Cost calculation
  const totalCost =
    fees.length > 0
      ? `₹${fees
          .filter((f) => !f.isOptional)
          .reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
          .toLocaleString("en-IN")}`
      : "Free (₹0)";

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] p-4 sm:p-6">
      {/* Device Toggle & Banner */}
      <div className="mb-6 flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#003366]" />
          <span className="text-xs font-bold tracking-wider text-[#111827] uppercase">
            Live Component Preview
          </span>
          <span className="rounded-full bg-[#EBF3FB] px-2 py-0.5 text-[10px] font-semibold text-[#003366]">
            Real Citizen Components
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[#D1D5DB] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setDeviceMode("desktop")}
            className={`rounded p-1.5 text-xs transition-colors ${
              deviceMode === "desktop"
                ? "bg-[#003366] text-white"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
            title="Desktop view"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`rounded p-1.5 text-xs transition-colors ${
              deviceMode === "mobile"
                ? "bg-[#003366] text-white"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
            title="Mobile (360px) view"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`mx-auto overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-200 ${
          deviceMode === "mobile" ? "max-w-[390px]" : "max-w-4xl"
        }`}
      >
        <div className="space-y-8 p-4 sm:p-8">
          {/* Header */}
          <div className="space-y-3 border-b border-[#E5E7EB] pb-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#EBF3FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#003366]">
                {task.categorySlug || "Civic Service"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Official Guide</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              {national.title || task.name || "Untitled Guide"}
            </h1>

            <p className="text-sm leading-relaxed text-[#4B5563]">
              {national.summary || "No summary provided yet."}
            </p>
          </div>

          {/* At A Glance */}
          <AtAGlance
            estimatedTime={national.estimatedTime || "15–30 days"}
            cost={totalCost}
            difficulty={national.difficulty || "medium"}
            totalDocuments={docs.length}
          />

          {/* Documents Section */}
          <DocumentSection
            documents={docs}
            completedIds={completedDocs}
            onToggleDoc={handleToggleDoc}
            onResetDocs={handleResetDocs}
            taskTitle={national.title || task.name}
            taskSlug={task.slug}
          />

          {/* Steps Section */}
          <StepsSection steps={steps} />

          {/* Fees Section */}
          <FeesSection fees={fees} />

          {/* Mistakes Section */}
          <MistakesSection reasons={mistakes} />

          {/* FAQs Section */}
          <FaqSection faqs={faqs} />

          {/* Official Links Section */}
          <OfficialLinksSection links={links} />
        </div>
      </div>
    </div>
  );
}
