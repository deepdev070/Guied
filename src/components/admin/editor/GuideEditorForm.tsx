"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskContent } from "@/types/content";
import { TaskContentSchema } from "@/types/content";
import {
  Save,
  Eye,
  FileEdit,
  Columns,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  History,
  ShieldCheck,
  Download,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { getChecklistCardDataFromTask, downloadChecklistCardImage } from "@/lib/checklist-card";
import { DocumentsEditor } from "./DocumentsEditor";
import { StepsEditor } from "./StepsEditor";
import { FeesEditor } from "./FeesEditor";
import { MistakesEditor } from "./MistakesEditor";
import { FaqEditor } from "./FaqEditor";
import { LinksEditor } from "./LinksEditor";
import { SeoFieldsEditor, type SeoFields } from "./SeoFieldsEditor";
import { GuideLivePreview } from "./GuideLivePreview";
import { PublishGateModal } from "./PublishGateModal";
import { RevisionHistoryModal } from "./RevisionHistoryModal";
import { VerifyTodayModal } from "./VerifyTodayModal";
import { runPublishGate, type PublishGateReport } from "@/lib/admin/publish-gate";

export interface GuideEditorFormProps {
  initialTask: TaskContent;
  isNew?: boolean;
}

type TabKey = "summary" | "documents" | "steps" | "fees" | "mistakes" | "faqs" | "links" | "seo";

type ViewMode = "edit" | "split" | "preview";

export function GuideEditorForm({ initialTask, isNew = false }: GuideEditorFormProps) {
  const router = useRouter();
  const [task, setTask] = useState<TaskContent>(initialTask);
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateReport, setGateReport] = useState<PublishGateReport | null>(null);
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const handleDownloadCard = async () => {
    try {
      setDownloadingCard(true);
      const cardData = getChecklistCardDataFromTask(task);
      await downloadChecklistCardImage(cardData, task.slug || "guide");
    } catch (err) {
      console.error("Error downloading card:", err);
      alert("Could not generate card image. Please try again.");
    } finally {
      setDownloadingCard(false);
    }
  };

  // SEO state
  const [seo, setSeo] = useState<SeoFields>({
    metaTitle: task.national?.title || task.name,
    metaDescription: task.national?.summary || "",
    keywords: [],
  });

  const updateNational = (updates: Partial<TaskContent["national"]>) => {
    // If attempting to set status to PUBLISHED directly, check gate first
    if (updates.status === "PUBLISHED" && task.national?.status !== "PUBLISHED") {
      const prospectiveTask = {
        ...task,
        national: { ...task.national, ...updates },
      };
      const report = runPublishGate(prospectiveTask, "PUBLISHED");
      if (!report.canPublish) {
        setGateReport(report);
        setGateModalOpen(true);
        return; // Block status change until requirements pass
      }
    }

    setTask((prev) => ({
      ...prev,
      national: {
        ...prev.national,
        ...updates,
      },
    }));
  };

  const handleOpenGateCheck = () => {
    const report = runPublishGate(task, "PUBLISHED");
    setGateReport(report);
    setGateModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    try {
      setIsPublishing(true);
      const publishedTask = {
        ...task,
        national: {
          ...task.national,
          status: "PUBLISHED" as const,
        },
      };
      setTask(publishedTask);

      const url = isNew ? "/api/admin/guides" : `/api/admin/guides/${task.slug}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishedTask),
      });

      if (res.ok) {
        setGateModalOpen(false);
        setSaveSuccess("Guide successfully published to live citizen portal!");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to publish guide");
      }
    } catch {
      alert("Network error publishing guide.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleValidate = (): boolean => {
    const parsed = TaskContentSchema.safeParse(task);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => {
        const fieldPath = i.path.join(" > ");
        return `${fieldPath}: ${i.message}`;
      });
      setValidationErrors(issues);
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  const handleSave = async () => {
    setSaveSuccess(null);
    setValidationErrors([]);

    const isValid = handleValidate();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      const url = isNew ? "/api/admin/guides" : `/api/admin/guides/${task.slug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.issues && Array.isArray(data.issues)) {
          setValidationErrors(data.issues);
        } else {
          setValidationErrors([data.error || "Save failed. Please check form."]);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setSaveSuccess(
        isNew
          ? "Guide created successfully! Redirecting..."
          : "Guide updated and revision recorded successfully."
      );

      if (isNew) {
        setTimeout(() => {
          router.push(`/admin/guides/${task.slug}`);
          router.refresh();
        }, 1200);
      } else {
        router.refresh();
      }
    } catch {
      setValidationErrors(["Network error saving guide. Please check connection."]);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "summary", label: "Summary & Info" },
    { key: "documents", label: "Documents", count: task.national?.documentRequirements?.length },
    { key: "steps", label: "Steps", count: task.national?.steps?.length },
    { key: "fees", label: "Fees", count: task.national?.fees?.length },
    { key: "mistakes", label: "Mistakes", count: task.national?.rejectionReasons?.length },
    { key: "faqs", label: "FAQs", count: task.national?.faqItems?.length },
    { key: "links", label: "Official Links", count: task.national?.officialLinks?.length },
    { key: "seo", label: "SEO & Meta" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-2xs sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-[#6B7280]">
              <Link
                href="/admin/guides"
                className="inline-flex items-center gap-1 hover:text-[#003366]"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>All Guides</span>
              </Link>
              <span>/</span>
              <span className="font-mono text-[#111827]">/{task.slug}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#111827] sm:text-2xl">
                {task.national?.title || task.name || "New Guide"}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  task.national?.status === "PUBLISHED"
                    ? "bg-[#E6F4EA] text-[#137333]"
                    : task.national?.status === "REVIEW"
                      ? "bg-[#FEF7E0] text-[#B06000]"
                      : "bg-[#F1F3F4] text-[#5F6368]"
                }`}
              >
                {task.national?.status || "DRAFT"}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "edit" ? "bg-white text-[#003366] shadow-2xs" : "text-[#6B7280]"
                }`}
                title="Form Editor Only"
              >
                <FileEdit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors lg:inline-flex ${
                  viewMode === "split" ? "bg-white text-[#003366] shadow-2xs" : "text-[#6B7280]"
                }`}
                title="Side by Side Split View"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "preview" ? "bg-white text-[#003366] shadow-2xs" : "text-[#6B7280]"
                }`}
                title="Live Component Preview"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* History & Revisions Button */}
            {!isNew && (
              <button
                type="button"
                onClick={() => setRevisionsModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#374151] shadow-2xs transition-colors hover:bg-[#F9FAFB]"
                title="View past revision history and restore snapshots"
              >
                <History className="h-3.5 w-3.5 text-[#6B7280]" />
                <span>Revisions</span>
              </button>
            )}

            {/* Quality Publish Gate Button */}
            <button
              type="button"
              onClick={handleOpenGateCheck}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#B3D4F5] bg-[#EBF3FB] px-3.5 py-2 text-xs font-semibold text-[#003366] shadow-2xs transition-colors hover:bg-[#D6E7FA]"
              title="Audit against 7 thin-content quality publishing criteria"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Publish Gate</span>
            </button>

            {/* Verify Today Button */}
            {!isNew && (
              <button
                type="button"
                onClick={() => setVerifyModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#CEEAD6] bg-[#E6F4EA] px-3.5 py-2 text-xs font-semibold text-[#137333] shadow-2xs transition-colors hover:bg-[#D4EDDA]"
                title="Mark guide as verified today with source URL attestation"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify Today</span>
              </button>
            )}

            {/* 1080x1350 Checklist Card Download Button (PROMPT 142) */}
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={downloadingCard}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E293B] shadow-2xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
              title="Download 1080x1350 checklist card for WhatsApp status, Instagram and Pinterest"
            >
              {downloadingCard ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#003366]" />
                  <span>Generating Card...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3.5 w-3.5 text-[#003366]" />
                  <span>Card (1080x1350)</span>
                  <Download className="h-3 w-3 text-[#64748B]" />
                </>
              )}
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#002244] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating & Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Guide</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[#F5C2C7] bg-[#FCE8E6] p-4 text-xs text-[#C5221F]"
          >
            <div className="mb-1 flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4" />
              <span>Please resolve {validationErrors.length} validation errors:</span>
            </div>
            <ul className="ml-1 list-inside list-disc space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl border border-[#CEEAD6] bg-[#E6F4EA] p-3 text-xs font-semibold text-[#137333]"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Section Tabs */}
        {viewMode !== "preview" && (
          <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-[#E5E7EB] pb-px">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "border-[#003366] bg-[#F7F9FC] text-[#003366]"
                      : "border-transparent text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                        active ? "bg-[#003366] text-white" : "bg-[#E5E7EB] text-[#4B5563]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area: Editor Form vs Split vs Preview */}
      <div
        className={
          viewMode === "split" ? "grid grid-cols-1 items-start gap-6 lg:grid-cols-2" : "block"
        }
      >
        {/* Editor Form */}
        {viewMode !== "preview" && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs">
            {/* 1. Summary & General Metadata */}
            {activeTab === "summary" && (
              <div className="space-y-5">
                <div className="border-b border-[#E5E7EB] pb-2">
                  <h2 className="text-sm font-bold text-[#111827]">Summary & General Metadata</h2>
                  <p className="text-xs text-[#6B7280]">
                    Core civic guide identity, category classification, and verification
                    attribution.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Guide Title *
                    </label>
                    <input
                      type="text"
                      value={task.national?.title || ""}
                      onChange={(e) => updateNational({ title: e.target.value })}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="e.g. Apply for Learner's Licence (LLR) Online"
                      required
                    />
                  </div>

                  {/* Internal Name */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Internal Service Name *
                    </label>
                    <input
                      type="text"
                      value={task.name || ""}
                      onChange={(e) => setTask((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="e.g. Learner's Licence Application"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      URL Slug * (Lowercase & Hyphens)
                    </label>
                    <input
                      type="text"
                      disabled={!isNew}
                      value={task.slug}
                      onChange={(e) =>
                        setTask((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-mono text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none disabled:opacity-60"
                      placeholder="e.g. driving-licence-learner"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Category *
                    </label>
                    <select
                      value={task.categorySlug}
                      onChange={(e) =>
                        setTask((prev) => ({ ...prev, categorySlug: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    >
                      <option value="identity">Identity (Aadhaar, Passport, Voter ID)</option>
                      <option value="vehicles">Vehicles and Driving</option>
                      <option value="money-and-tax">Money and Tax (PAN, ITR)</option>
                      <option value="certificates">Certificates (Birth, Caste, Income)</option>
                      <option value="family-and-welfare">Family and Welfare (Ration Card)</option>
                      <option value="land-and-property">Land and Property</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Workflow Status *
                    </label>
                    <select
                      value={task.national?.status || "DRAFT"}
                      onChange={(e) =>
                        updateNational({
                          status: e.target.value as "DRAFT" | "REVIEW" | "PUBLISHED",
                        })
                      }
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    >
                      <option value="DRAFT">DRAFT (Internal authoring)</option>
                      <option value="REVIEW">REVIEW (Ready for editorial check)</option>
                      <option value="PUBLISHED">PUBLISHED (Live on public portal)</option>
                    </select>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Estimated Turnaround Time
                    </label>
                    <input
                      type="text"
                      value={task.national?.estimatedTime || ""}
                      onChange={(e) => updateNational({ estimatedTime: e.target.value })}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="e.g. 15–30 days"
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Procedure Difficulty
                    </label>
                    <select
                      value={task.national?.difficulty || "medium"}
                      onChange={(e) =>
                        updateNational({
                          difficulty: e.target.value as "easy" | "medium" | "hard",
                        })
                      }
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                    >
                      <option value="easy">Easy (Single visit / quick online)</option>
                      <option value="medium">Medium (Test or biometric visit)</option>
                      <option value="hard">Hard (Multi-department verification)</option>
                    </select>
                  </div>

                  {/* Summary */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Overview Summary * (Class 8 Reading Level)
                    </label>
                    <textarea
                      rows={3}
                      value={task.national?.summary || ""}
                      onChange={(e) => updateNational({ summary: e.target.value })}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="Brief overview explaining who this guide is for and what the citizen will achieve."
                      required
                    />
                  </div>

                  {/* Primary Source URL */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-[#374151]">
                      Primary Government Gazette / Source URL
                    </label>
                    <input
                      type="url"
                      value={task.national?.sourceUrl || ""}
                      onChange={(e) => updateNational({ sourceUrl: e.target.value })}
                      className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
                      placeholder="https://morth.nic.in/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Documents Section */}
            {activeTab === "documents" && (
              <DocumentsEditor
                documents={task.national?.documentRequirements || []}
                onChange={(docs) => updateNational({ documentRequirements: docs })}
              />
            )}

            {/* 3. Steps Section */}
            {activeTab === "steps" && (
              <StepsEditor
                steps={task.national?.steps || []}
                onChange={(steps) => updateNational({ steps })}
              />
            )}

            {/* 4. Fees Section */}
            {activeTab === "fees" && (
              <FeesEditor
                fees={task.national?.fees || []}
                onChange={(fees) => updateNational({ fees })}
              />
            )}

            {/* 5. Mistakes / Rejections Section */}
            {activeTab === "mistakes" && (
              <MistakesEditor
                rejectionReasons={task.national?.rejectionReasons || []}
                onChange={(rejectionReasons) => updateNational({ rejectionReasons })}
              />
            )}

            {/* 6. FAQs Section */}
            {activeTab === "faqs" && (
              <FaqEditor
                faqItems={task.national?.faqItems || []}
                onChange={(faqItems) => updateNational({ faqItems })}
              />
            )}

            {/* 7. Official Links Section */}
            {activeTab === "links" && (
              <LinksEditor
                officialLinks={task.national?.officialLinks || []}
                onChange={(officialLinks) => updateNational({ officialLinks })}
              />
            )}

            {/* 8. SEO Fields Section */}
            {activeTab === "seo" && (
              <SeoFieldsEditor
                seo={seo}
                onChange={setSeo}
                defaultTitle={task.national?.title || task.name}
                defaultSummary={task.national?.summary || ""}
                slug={task.slug}
              />
            )}
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={viewMode === "split" ? "sticky top-20" : "block"}>
            <GuideLivePreview task={task} />
          </div>
        )}
      </div>

      {/* Quality Gate Modal */}
      <PublishGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        report={gateReport}
        onConfirmPublish={handleConfirmPublish}
        isPublishing={isPublishing}
      />

      {/* Revision History Modal */}
      <RevisionHistoryModal
        isOpen={revisionsModalOpen}
        onClose={() => setRevisionsModalOpen(false)}
        slug={task.slug}
        onRestoreSuccess={() => {
          setSaveSuccess("Revision restored successfully! Refreshing view...");
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }}
      />

      {/* Verify Today Modal */}
      <VerifyTodayModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        slug={task.slug}
        guideTitle={task.national?.title || task.name}
        initialSourceUrl={task.national?.sourceUrl || ""}
        onSuccess={(verifiedAt, verifiedBy, sourceUrl) => {
          updateNational({ lastVerifiedAt: verifiedAt, verifiedBy, sourceUrl });
          setSaveSuccess(`Guide verified today by ${verifiedBy}! Live page cache revalidated.`);
        }}
      />
    </div>
  );
}
