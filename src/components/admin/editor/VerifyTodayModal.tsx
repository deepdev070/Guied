"use client";

import React, { useState } from "react";
import { ShieldCheck, X, AlertCircle, Loader2, Globe } from "lucide-react";

export interface VerifyTodayModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  guideTitle: string;
  initialSourceUrl?: string;
  onSuccess: (verifiedAt: string, verifiedBy: string, sourceUrl: string) => void;
}

export function VerifyTodayModal({
  isOpen,
  onClose,
  slug,
  guideTitle,
  initialSourceUrl = "",
  onSuccess,
}: VerifyTodayModalProps) {
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || "https://");
  const [checkedOfficialSite, setCheckedOfficialSite] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sourceUrl.trim() || sourceUrl.trim() === "https://" || sourceUrl.trim() === "http://") {
      setError("Please paste the official government source URL you verified against.");
      return;
    }

    if (!checkedOfficialSite) {
      setError("You must confirm that you checked this information on the official website.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/guides/${slug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: sourceUrl.trim(),
          checkedOfficialSite: true,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.issues && Array.isArray(data.issues)) {
          setError(data.issues.join(". "));
        } else {
          setError(data.error || "Failed to mark as verified.");
        }
        return;
      }

      onSuccess(data.lastVerifiedAt, data.verifiedBy, data.sourceUrl);
      onClose();
    } catch {
      setError("Network error submitting verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#137333] shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="verify-modal-title" className="text-base font-bold text-[#111827]">
                Mark as Verified Today
              </h2>
              <p className="max-w-xs truncate text-xs text-[#6B7280] sm:max-w-sm">
                {guideTitle} (/{slug})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-[#F5C2C7] bg-[#FCE8E6] p-3.5 text-xs text-[#C5221F]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Source URL */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">
              Official Government Source URL *
            </label>
            <div className="relative">
              <Globe className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="url"
                required
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://parivahan.gov.in/..."
                className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] py-2 pr-3 pl-8 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Paste the exact .gov.in, .nic.in, or official gazette URL where fees and rules were
              confirmed.
            </p>
          </div>

          {/* Verification Notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">
              Verification Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed CMVR Rule 32 fees remain unchanged for 2026."
              className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#111827] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
            />
          </div>

          {/* Statutory Attestation Checkbox */}
          <div className="rounded-xl border border-[#B3D4F5] bg-[#F0F7FF] p-3.5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                required
                checked={checkedOfficialSite}
                onChange={(e) => setCheckedOfficialSite(e.target.checked)}
                className="mt-0.5 rounded border-[#D1D5DB] text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-xs leading-tight font-semibold text-[#003366] select-none">
                I checked this on the official site
              </span>
            </label>
            <p className="mt-1.5 ml-6 text-[11px] leading-relaxed text-[#4B5563]">
              By confirming, you attest that all fees, documents, and procedure steps match current
              official government regulations. This will update the public &quot;Verified&quot;
              badge, revalidate the page cache, and log an audit record.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-[#4B5563] transition-colors hover:bg-[#F3F4F6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#137333] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#0E5826] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Recording Verification...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Confirm Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
