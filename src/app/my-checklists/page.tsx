"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ListChecks,
  ArrowRight,
  Trash2,
  Download,
  Upload,
  Check,
  Copy,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import {
  getAllChecklistsIndex,
  clearStoredCompletedDocs,
  exportChecklistsData,
  importChecklistsData,
  type ChecklistIndexEntry,
} from "@/lib/checklist-storage";
import { ProgressRing } from "@/components/checklist/ProgressRing";
import { InstallAppCard } from "@/components/pwa/InstallAppCard";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export default function MyChecklistsPage() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [checklists, setChecklists] = useState<ChecklistIndexEntry[]>(() =>
    getAllChecklistsIndex()
  );

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(
    null
  );
  const [copiedExport, setCopiedExport] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ChecklistIndexEntry | null>(null);

  const refreshChecklists = () => {
    setChecklists(getAllChecklistsIndex());
  };

  const handleRemove = (entry: ChecklistIndexEntry) => {
    clearStoredCompletedDocs(entry.taskSlug, entry.stateSlug);
    setRemoveTarget(null);
    refreshChecklists();
  };

  const handleExportCopy = async () => {
    try {
      const data = exportChecklistsData();
      await navigator.clipboard.writeText(data);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleExportDownload = () => {
    const data = exportChecklistsData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `india-paperwork-checklists-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus(null);
    if (!importInput.trim()) {
      setImportStatus({ success: false, message: "Please paste your backup JSON code above." });
      return;
    }

    const result = importChecklistsData(importInput);
    if (result.success) {
      setImportStatus({
        success: true,
        message: `Successfully imported ${result.count} checklist${result.count === 1 ? "" : "s"}!`,
      });
      refreshChecklists();
      setTimeout(() => {
        setImportModalOpen(false);
        setImportInput("");
        setImportStatus(null);
      }, 1500);
    } else {
      setImportStatus({ success: false, message: result.error || "Failed to import JSON data." });
    }
  };

  const completedCount = checklists.filter(
    (c) => c.completedCount >= c.totalCount && c.totalCount > 0
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* 1. Header Banner */}
      <div className="border-border mb-8 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-muted text-xs font-bold tracking-wider uppercase">
              Private Citizen Dashboard
            </span>
          </div>
          <h1 className="text-h1 text-text mt-2 font-bold tracking-tight">My Active Checklists</h1>
          <p className="text-body text-muted mt-1 max-w-2xl">
            Track your progress across multiple government paperwork applications. Stored strictly
            on your device with <strong>zero account or login required</strong>.
          </p>
        </div>

        {/* Action Controls: Export & Import */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setExportModalOpen(true);
              setCopiedExport(false);
            }}
            aria-label="Export checklists backup"
            className="rounded-input border-border/80 bg-background hover:bg-surface-alt hover:border-primary/40 text-text flex h-10 cursor-pointer items-center gap-1.5 border px-3 text-xs font-semibold transition-colors"
          >
            <Download className="text-primary h-4 w-4" aria-hidden="true" />
            <span>Export Backup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportModalOpen(true);
              setImportInput("");
              setImportStatus(null);
            }}
            aria-label="Import checklists backup"
            className="rounded-input border-border/80 bg-background hover:bg-surface-alt hover:border-primary/40 text-text flex h-10 cursor-pointer items-center gap-1.5 border px-3 text-xs font-semibold transition-colors"
          >
            <Upload className="text-primary h-4 w-4" aria-hidden="true" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* 2. Privacy Trust Callout */}
      <div className="rounded-card border-border bg-surface-alt/70 mb-8 flex items-start gap-3 border p-4 text-xs text-slate-700">
        <ShieldCheck className="text-success mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong>100% Private & Device-Local:</strong> Your ticked documents are saved locally in
          your browser&apos;s storage. We do not store personal details or documents on external
          servers. Use the <strong>Export Backup</strong> feature to move your checklists to your
          family member&apos;s phone or a new computer.
        </p>
      </div>

      {/* 3. Checklists Listing */}
      {!isMounted ? (
        // Loading Skeleton
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-card border-border bg-background animate-pulse border p-6"
            >
              <div className="bg-surface-alt mb-3 h-5 w-48 rounded" />
              <div className="bg-surface-alt h-3 w-72 rounded" />
            </div>
          ))}
        </div>
      ) : checklists.length === 0 ? (
        // Empty State
        <div className="rounded-card border-border bg-background border px-6 py-16 text-center">
          <div className="bg-primary-soft text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <ListChecks className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="text-h2 text-text font-bold">No active checklists yet</h2>
          <p className="text-muted text-body mx-auto mt-2 max-w-md">
            When you check off documents for any service, your progress will automatically appear
            here so you can pick up right where you left off.
          </p>

          <div className="mt-8">
            <h3 className="text-text mb-3 text-xs font-bold tracking-wider uppercase">
              Popular Guides to Start
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/driving-licence-learner"
                className="rounded-input border-border/80 bg-surface-alt/70 hover:bg-surface-alt hover:border-primary/40 text-text border px-4 py-2 text-xs font-semibold transition-colors"
              >
                Learner&apos;s Licence (LLR) →
              </Link>
              <Link
                href="/driving-licence-new"
                className="rounded-input border-border/80 bg-surface-alt/70 hover:bg-surface-alt hover:border-primary/40 text-text border px-4 py-2 text-xs font-semibold transition-colors"
              >
                Permanent Driving Licence →
              </Link>
              <Link
                href="/passport-renewal"
                className="rounded-input border-border/80 bg-surface-alt/70 hover:bg-surface-alt hover:border-primary/40 text-text border px-4 py-2 text-xs font-semibold transition-colors"
              >
                Passport Renewal →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Populated Checklists List
        <div className="space-y-4">
          <div className="text-muted mb-2 flex items-center justify-between text-xs font-semibold">
            <span>
              {checklists.length} active checklist{checklists.length === 1 ? "" : "s"} (
              {completedCount} completed)
            </span>
          </div>

          {checklists.map((item) => {
            const isFinished = item.completedCount >= item.totalCount && item.totalCount > 0;
            const percentage =
              item.totalCount > 0 ? Math.round((item.completedCount / item.totalCount) * 100) : 0;
            const targetUrl =
              item.stateSlug && item.stateSlug !== "national"
                ? `/${item.taskSlug}/${item.stateSlug}`
                : `/${item.taskSlug}`;

            return (
              <div
                key={`${item.taskSlug}_${item.stateSlug}`}
                className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/30 border p-5 transition-all"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Info & Progress Ring */}
                  <div className="flex items-center gap-4">
                    <ProgressRing
                      value={item.completedCount}
                      max={item.totalCount}
                      size={54}
                      strokeWidth={4.5}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={targetUrl}
                          className="text-body text-text hover:text-primary font-bold tracking-tight"
                        >
                          {item.taskTitle}
                        </Link>
                        <span className="bg-surface-alt text-muted border-border rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase">
                          {item.stateSlug === "national" ? "All India" : item.stateSlug}
                        </span>
                      </div>

                      <div className="text-muted mt-1 flex items-center gap-2 text-xs">
                        <span
                          className={cn("font-semibold", isFinished ? "text-success" : "text-text")}
                        >
                          {isFinished
                            ? "100% Ready (All papers gathered)"
                            : `${item.completedCount} of ${item.totalCount} documents ready (${percentage}%)`}
                        </span>
                        <span>•</span>
                        <span>
                          Updated {new Date(item.lastUpdated).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      {/* Progress Bar Line */}
                      <div className="bg-surface-alt mt-2 h-1.5 w-48 overflow-hidden rounded-full">
                        <div
                          className={cn(
                            "h-full transition-all duration-300",
                            isFinished ? "bg-success" : "bg-primary"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={targetUrl}
                      className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex h-10 items-center gap-1.5 px-4 text-xs font-bold text-white transition-all active:scale-98"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setRemoveTarget(item)}
                      aria-label={`Remove checklist for ${item.taskTitle}`}
                      title="Remove checklist"
                      className="rounded-input border-border/80 hover:border-danger/40 hover:bg-danger-soft hover:text-danger text-muted flex h-10 w-10 cursor-pointer items-center justify-center border transition-colors"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Export Modal */}
      {exportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="rounded-card border-border bg-background shadow-soft-xl w-full max-w-lg border p-6">
            <h3 id="export-modal-title" className="text-h3 text-text font-bold">
              Export Checklists Backup
            </h3>
            <p className="text-muted mt-1 text-xs">
              Copy this backup code or download it as a file to transfer your saved progress to
              another phone or browser.
            </p>

            <div className="mt-4">
              <textarea
                readOnly
                rows={6}
                value={exportChecklistsData()}
                className="rounded-input border-border bg-surface w-full border p-3 font-mono text-[11px] text-slate-800 select-all focus:outline-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleExportDownload}
                className="rounded-input border-border hover:bg-surface-alt text-text flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-xs font-semibold"
              >
                <Download className="text-primary h-3.5 w-3.5" aria-hidden="true" />
                <span>Download .json file</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="rounded-input border-border text-muted hover:bg-surface-alt cursor-pointer border px-3 py-2 text-xs font-semibold"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleExportCopy}
                  className="rounded-input bg-primary hover:bg-primary-hover flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-bold text-white"
                >
                  {copiedExport ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Import Modal */}
      {importModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="rounded-card border-border bg-background shadow-soft-xl w-full max-w-lg border p-6">
            <h3 id="import-modal-title" className="text-h3 text-text font-bold">
              Import Checklists Backup
            </h3>
            <p className="text-muted mt-1 text-xs">
              Paste your exported JSON backup code below to restore your checklists on this device.
            </p>

            <form onSubmit={handleImportSubmit} className="mt-4 space-y-4">
              <textarea
                rows={6}
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder='Paste your backup JSON code here (e.g. { "version": 1, ... })'
                className="rounded-input border-border bg-surface focus:border-primary w-full border p-3 font-mono text-[11px] text-slate-800 focus:outline-none"
              />

              {importStatus && (
                <div
                  className={cn(
                    "rounded-input flex items-center gap-2 p-3 text-xs",
                    importStatus.success
                      ? "bg-success-soft text-success border-success/30 border"
                      : "bg-danger-soft text-danger border-danger/30 border"
                  )}
                >
                  {importStatus.success ? (
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="rounded-input border-border text-muted hover:bg-surface-alt cursor-pointer border px-3 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-input bg-primary hover:bg-primary-hover flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-bold text-white"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Restore Checklists</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Remove Confirmation Dialog */}
      {removeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="rounded-card border-border bg-background shadow-soft-xl w-full max-w-sm border p-6">
            <h3 id="remove-modal-title" className="text-h3 text-text font-bold">
              Remove Checklist?
            </h3>
            <p className="text-muted mt-2 text-xs">
              Are you sure you want to remove your saved checklist for{" "}
              <strong>{removeTarget.taskTitle}</strong>? All ticked progress will be cleared from
              this device.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className="rounded-input border-border text-muted hover:bg-surface-alt cursor-pointer border px-3 py-2 text-xs font-semibold"
              >
                Keep Checklist
              </button>
              <button
                type="button"
                onClick={() => handleRemove(removeTarget)}
                className="rounded-input bg-danger hover:bg-danger/90 cursor-pointer px-4 py-2 text-xs font-bold text-white"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
