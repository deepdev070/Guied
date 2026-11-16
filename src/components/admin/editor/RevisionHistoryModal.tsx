"use client";

import React, { useState, useEffect } from "react";
import { History, RotateCcw, X, Loader2, Calendar, User } from "lucide-react";
import type { StoredRevision } from "@/lib/admin/revisions";

export interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  onRestoreSuccess: () => void;
}

export function RevisionHistoryModal({
  isOpen,
  onClose,
  slug,
  onRestoreSuccess,
}: RevisionHistoryModalProps) {
  const [revisions, setRevisions] = useState<Omit<StoredRevision, "payload">[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadRevisions() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/guides/${slug}/revisions`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.revisions) {
            setRevisions(data.revisions);
          }
        } else {
          setError("Failed to load revisions history.");
        }
      } catch {
        setError("Network error loading revisions.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRevisions();
    return () => {
      isMounted = false;
    };
  }, [isOpen, slug]);

  const handleRestore = async (revisionId: string, revisionNumber: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore Revision #${revisionNumber}? This will replace the active guide content.`
    );
    if (!confirmed) return;

    try {
      setRestoringId(revisionId);
      const res = await fetch(`/api/admin/guides/${slug}/revisions/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to restore revision");
        return;
      }

      onRestoreSuccess();
      onClose();
    } catch {
      alert("Network error restoring revision.");
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF3FB] text-[#003366]">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 id="revision-modal-title" className="text-lg font-bold text-[#111827]">
                Content Revision History
              </h2>
              <p className="text-xs text-[#6B7280]">
                Every save creates an auditable snapshot that can be restored at any time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 overflow-y-auto p-6">
          {loading && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#003366]" />
              <p className="mt-2 text-xs text-[#6B7280]">Loading snapshots...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-[#FCE8E6] p-4 text-xs text-[#C5221F]">{error}</div>
          )}

          {!loading && revisions.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-[#D1D5DB] py-8 text-center text-xs text-[#6B7280]">
              No past revisions found for this guide yet. Revisions are created each time you save.
            </div>
          )}

          {!loading &&
            revisions.map((rev) => {
              const formattedDate = new Date(rev.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={rev.id}
                  className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 transition-colors hover:border-[#CBD5E1] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111827]">
                        Revision #{rev.revisionNumber}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          rev.status === "PUBLISHED"
                            ? "bg-[#E6F4EA] text-[#137333]"
                            : rev.status === "REVIEW"
                              ? "bg-[#FEF7E0] text-[#B06000]"
                              : "bg-[#F1F3F4] text-[#5F6368]"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#374151]">
                      {rev.summaryOfChanges || "General content update"}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{rev.author}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestore(rev.id, rev.revisionNumber)}
                    disabled={restoringId === rev.id}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#EBF3FB] disabled:opacity-50"
                  >
                    {restoringId === rev.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    <span>Restore this Version</span>
                  </button>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-[#4B5563] transition-colors hover:bg-[#F3F4F6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
