"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { DryRunResult, DryRunItem } from "../../../lib/admin/import-export.ts";

export function ImportExportManager() {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<DryRunResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [executeSuccess, setExecuteSuccess] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreviewResult(null);
    setPreviewError(null);
    setExecuteSuccess(null);
    setExecuteError(null);

    const isCsv = file.name.endsWith(".csv");
    setFormat(isCsv ? "csv" : "json");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleRunPreview = async () => {
    if (!content.trim()) {
      setPreviewError("Please paste guide content or upload a JSON/CSV file.");
      return;
    }

    setIsPreviewing(true);
    setPreviewError(null);
    setExecuteSuccess(null);
    setExecuteError(null);

    try {
      const res = await fetch("/api/admin/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, content }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPreviewError(data.error || "Failed to generate dry-run preview.");
      } else {
        setPreviewResult(data.result);
      }
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Network error during preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewResult) return;

    const validGuides = previewResult.items
      .filter((item) => item.action !== "reject" && item.guide)
      .map((item) => item.guide);

    if (validGuides.length === 0) {
      setExecuteError("No valid guides available to import.");
      return;
    }

    setIsExecuting(true);
    setExecuteError(null);
    setExecuteSuccess(null);

    try {
      const res = await fetch("/api/admin/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guides: validGuides }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setExecuteError(data.error || "Failed to execute import.");
      } else {
        const { createdCount, updatedCount } = data.result;
        setExecuteSuccess(
          `Successfully processed ${validGuides.length} guide(s): ${createdCount} created, ${updatedCount} updated.`
        );
        setPreviewResult(null);
        setContent("");
        setFileName(null);
      }
    } catch (err) {
      setExecuteError(err instanceof Error ? err.message : "Network error during import.");
    } finally {
      setIsExecuting(false);
    }
  };

  const validCount = previewResult ? previewResult.toCreate + previewResult.toUpdate : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Bulk Import & Export</h1>
        <p className="mt-1 text-sm text-[#4B5563]">
          Export complete guide data bundles or import batch guides with dry-run validation using
          the seed script quality criteria.
        </p>
      </div>

      {/* Success Notification */}
      {executeSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-[#86EFAC] bg-[#F0FDF4] p-4 text-[#166534]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[#166534]">Import Successful</h4>
            <p className="mt-0.5 text-sm text-[#15803D]">{executeSuccess}</p>
            <div className="mt-3 flex gap-3">
              <Link
                href="/admin/guides"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] hover:underline"
              >
                View Guides Directory <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Export and Import Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* EXPORT CARD */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#003366]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Export Guides</h2>
              <p className="text-xs text-[#6B7280]">
                Download all civic guides in JSON or CSV format
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* JSON Option */}
            <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="flex items-center gap-3">
                <FileJson className="h-6 w-6 text-[#2563EB]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">Complete JSON Bundle</h3>
                  <p className="text-xs text-[#6B7280]">
                    Full fidelity schema, state overrides, checklists, and FAQs
                  </p>
                </div>
              </div>
              <a
                href="/api/admin/export?format=json"
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1E40AF]"
              >
                <Download className="h-3.5 w-3.5" /> Download JSON
              </a>
            </div>

            {/* CSV Option */}
            <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-[#16A34A]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">Tabular CSV Sheet</h3>
                  <p className="text-xs text-[#6B7280]">
                    Spreadsheet view with fee summaries, verifications & keywords
                  </p>
                </div>
              </div>
              <a
                href="/api/admin/export?format=csv"
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] shadow-xs transition-colors hover:bg-[#F3F4F6]"
              >
                <Download className="h-3.5 w-3.5" /> Download CSV
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#475569]">
            💡 <strong>Backup Reminder:</strong> Regularly download the JSON bundle to maintain
            off-site backups of published citizen guides.
          </div>
        </div>

        {/* IMPORT CARD */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#003366]">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Import Guides</h2>
                <p className="text-xs text-[#6B7280]">Dry-run preview before committing changes</p>
              </div>
            </div>

            {/* Format toggle */}
            <div className="flex rounded-lg border border-[#D1D5DB] bg-[#F3F4F6] p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  format === "json"
                    ? "bg-white text-[#111827] shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  format === "csv"
                    ? "bg-white text-[#111827] shadow-xs"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          {/* File Upload or Text Paste */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] shadow-xs transition-colors hover:bg-[#F3F4F6]">
                <Upload className="h-3.5 w-3.5 text-[#6B7280]" />
                Choose File (.json / .csv)
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <span className="max-w-xs truncate text-xs font-medium text-[#003366]">
                  {fileName}
                </span>
              )}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                format === "json"
                  ? 'Paste guide JSON array [ { "slug": "new-guide", ... } ] or export bundle...'
                  : "Paste CSV text with headers: slug, name, categorySlug, description, nationalTitle..."
              }
              rows={5}
              className="w-full rounded-lg border border-[#D1D5DB] bg-[#FAFAFA] p-3 font-mono text-xs text-[#111827] focus:border-[#003366] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {previewError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
              <span>{previewError}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleRunPreview}
              disabled={isPreviewing || !content.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1E40AF] disabled:opacity-50"
            >
              {isPreviewing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Running Dry-Run...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Run Dry-Run Preview
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DRY-RUN PREVIEW RESULTS */}
      {previewResult && (
        <div className="space-y-6 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Dry-Run Validation Preview</h3>
              <p className="text-xs text-[#6B7280]">
                Analyzed using seed script validators and quality rules. No files have been modified
                yet.
              </p>
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isExecuting || validCount === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#15803D] disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm & Import ({validCount} Valid Guide{validCount !== 1 ? "s" : ""})
                </>
              )}
            </button>
          </div>

          {/* Summary Metric Pills */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
              <span className="text-xs font-medium text-[#6B7280]">Total Analyzed</span>
              <p className="mt-1 text-xl font-bold text-[#111827]">{previewResult.total}</p>
            </div>

            <div className="rounded-lg border border-[#86EFAC] bg-[#F0FDF4] p-3 text-center">
              <span className="text-xs font-medium text-[#166534]">Will Create</span>
              <p className="mt-1 text-xl font-bold text-[#166534]">{previewResult.toCreate}</p>
            </div>

            <div className="rounded-lg border border-[#FDE047] bg-[#FEFCE8] p-3 text-center">
              <span className="text-xs font-medium text-[#854D0E]">Will Update</span>
              <p className="mt-1 text-xl font-bold text-[#854D0E]">{previewResult.toUpdate}</p>
            </div>

            <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-center">
              <span className="text-xs font-medium text-[#991B1B]">Rejected</span>
              <p className="mt-1 text-xl font-bold text-[#991B1B]">{previewResult.rejected}</p>
            </div>
          </div>

          {/* Execution error */}
          {executeError && (
            <div className="flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
              <XCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
              <span>{executeError}</span>
            </div>
          )}

          {/* Detailed Items Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Guide Slug / Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                {previewResult.items.map((item: DryRunItem, idx: number) => {
                  const isCreate = item.action === "create";
                  const isUpdate = item.action === "update";
                  const isReject = item.action === "reject";

                  return (
                    <tr
                      key={`${item.slug}-${idx}`}
                      className={`hover:bg-[#F9FAFB] ${isReject ? "bg-[#FEF2F2]/40" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        <div>{item.name}</div>
                        <div className="font-mono text-[11px] text-[#6B7280]">{item.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">{item.categorySlug}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {isCreate && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#166534]">
                            <CheckCircle2 className="h-3 w-3" /> Will Create
                          </span>
                        )}
                        {isUpdate && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[11px] font-semibold text-[#854D0E]">
                            <RefreshCw className="h-3 w-3" /> Will Update
                          </span>
                        )}
                        {isReject && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-semibold text-[#991B1B]">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        {item.errors.length > 0 && (
                          <div className="space-y-1 text-[#DC2626]">
                            {item.errors.map((err: string, i: number) => (
                              <div key={i} className="flex items-start gap-1">
                                <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.warnings.length > 0 && (
                          <div className="mt-1 space-y-1 text-[#D97706]">
                            {item.warnings.map((warn: string, i: number) => (
                              <div key={i} className="flex items-start gap-1">
                                <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
                                <span>{warn}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.errors.length === 0 && item.warnings.length === 0 && (
                          <span className="flex items-center gap-1 text-[#16A34A]">
                            <CheckCircle2 className="h-3 w-3" /> Ready to import
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
