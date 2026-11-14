"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SuccessIllustration } from "@/components/illustrations";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

export interface ReportMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskSlug?: string;
  stateCode?: string;
}

const ISSUE_OPTIONS = [
  { value: "outdated_fee", label: "Fee amount or payment mode is incorrect / changed" },
  { value: "wrong_document", label: "Document requirement is incorrect or missing" },
  { value: "broken_link", label: "Official government link is broken or wrong" },
  { value: "procedure_changed", label: "Procedure step has changed or is outdated" },
  { value: "other", label: "Other suggestion or correction" },
];

export function ReportMistakeModal({
  isOpen,
  onClose,
  taskSlug,
  stateCode,
}: ReportMistakeModalProps) {
  const [issueType, setIssueType] = useState("outdated_fee");
  const [description, setDescription] = useState("");
  const [proposedCorrection, setProposedCorrection] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal closes
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setDescription("");
      setProposedCorrection("");
      setReporterEmail("");
      setHoneypot("");
      setErrorMessage(null);
      setIsSuccess(false);
    }, 200);
  };

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
    returnFocus: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setErrorMessage("Please describe the issue in at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/report-mistake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskSlug: taskSlug || null,
          stateCode: stateCode || null,
          issueType,
          description: description.trim(),
          proposedCorrection: proposedCorrection.trim() || null,
          reporterEmail: reporterEmail.trim() || undefined,
          honeypot: honeypot.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit correction report.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-mistake-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="bg-text/40 fixed inset-0 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="rounded-card border-border shadow-soft-xl relative w-full max-w-lg border bg-white p-6 transition-all sm:p-7">
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="rounded-chip text-muted hover:text-text absolute top-4 right-4 flex h-8 w-8 items-center justify-center transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {isSuccess ? (
          /* Thank You State */
          <div role="status" aria-live="polite" className="py-6 text-center">
            <div className="mx-auto mb-4 max-w-[140px]">
              <SuccessIllustration />
            </div>
            <h2 id="report-mistake-title" className="text-h3 text-text font-bold">
              Thank You for Helping!
            </h2>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              Your report has been logged in our editorial queue. Our research team will verify the
              information against official government gazettes and update the guide for everyone.
            </p>
            <div className="mt-6">
              <Button onClick={handleClose} variant="primary" size="md">
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* Report Form State */
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <span className="text-primary text-xs font-bold tracking-wider uppercase">
                Citizen Feedback
              </span>
              <h2 id="report-mistake-title" className="text-h3 text-text mt-1 font-bold">
                Report a Mistake or Outdated Info
              </h2>
              <p className="text-muted mt-1 text-xs">
                No account or login required. Help us keep Indian paperwork guides 100% accurate.
              </p>
            </div>

            {errorMessage && (
              <div
                id="report-mistake-error"
                role="alert"
                aria-live="assertive"
                className="border-danger/30 bg-danger-soft text-danger mb-4 rounded-lg border p-3 text-xs font-medium"
              >
                {errorMessage}
              </div>
            )}

            {/* Issue Type Select */}
            <div className="mb-4">
              <label
                htmlFor="report-issue-type"
                className="text-text mb-1.5 block text-xs font-semibold"
              >
                What is wrong? <span className="text-danger">*</span>
              </label>
              <select
                id="report-issue-type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="rounded-input text-text bg-surface-alt/50 hover:bg-surface-alt focus-visible:border-primary focus-visible:ring-primary/40 border-border h-[44px] w-full border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {ISSUE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="report-description"
                  className="text-text block text-xs font-semibold"
                >
                  Describe what is wrong <span className="text-danger">*</span>
                </label>
                <span className="text-muted text-[11px]">{description.length}/1000</span>
              </div>
              <textarea
                id="report-description"
                rows={3}
                maxLength={1000}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? "report-mistake-error" : undefined}
                placeholder="E.g., The learner licence test fee in Gujarat was revised from ₹150 to ₹200 on Sarathi portal..."
                className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/30 w-full border p-3 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>

            {/* Proposed Correction / Official Source Link (Optional) */}
            <div className="mb-4">
              <label
                htmlFor="report-correction"
                className="text-text mb-1.5 block text-xs font-semibold"
              >
                Official source link or correct info{" "}
                <span className="text-muted font-normal">(Optional)</span>
              </label>
              <input
                id="report-correction"
                type="text"
                value={proposedCorrection}
                onChange={(e) => setProposedCorrection(e.target.value)}
                placeholder="E.g., https://parivahan.gov.in/ or circular date"
                className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/30 h-[42px] w-full border px-3 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>

            {/* Reporter Email (Optional) */}
            <div className="mb-5">
              <label
                htmlFor="report-email"
                className="text-text mb-1.5 block text-xs font-semibold"
              >
                Your Email{" "}
                <span className="text-muted font-normal">
                  (Optional, only if you want an update)
                </span>
              </label>
              <input
                id="report-email"
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="name@example.com"
                className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/30 h-[42px] w-full border px-3 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>

            {/* Honeypot Spam Field (Hidden from real users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="report-website-field">Leave this empty</label>
              <input
                id="report-website-field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="border-border/70 flex items-center justify-end gap-3 border-t pt-4">
              <Button type="button" onClick={handleClose} variant="ghost" size="md">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || description.trim().length < 5}
                className={cn(isSubmitting && "opacity-80")}
              >
                {isSubmitting ? "Submitting..." : "Submit Correction"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
