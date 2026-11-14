"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SuccessIllustration } from "@/components/illustrations";
import { cn } from "@/lib/utils";

const ISSUE_OPTIONS = [
  { value: "outdated_fee", label: "Fee amount or payment mode is incorrect / changed" },
  { value: "wrong_document", label: "Document requirement is incorrect or missing" },
  { value: "broken_link", label: "Official government link is broken or wrong" },
  { value: "procedure_changed", label: "Procedure step has changed or is outdated" },
  { value: "other", label: "Other suggestion or correction" },
];

export function ReportMistakeStandaloneForm() {
  const [issueType, setIssueType] = useState("outdated_fee");
  const [description, setDescription] = useState("");
  const [proposedCorrection, setProposedCorrection] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  if (isSuccess) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 max-w-[160px]">
          <SuccessIllustration />
        </div>
        <h2 className="text-h3 text-text font-bold">Thank You for Your Feedback!</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          Your report has been received by our editorial team. We will review the official
          government gazette and update our paperwork guide accordingly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/" variant="primary" size="md">
            Return Home
          </Button>
          <Button href="/guides" variant="secondary" size="md">
            Browse All Guides
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="border-danger/30 bg-danger-soft text-danger rounded-lg border p-3 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Issue Type Select */}
      <div>
        <label
          htmlFor="standalone-issue-type"
          className="text-text mb-1.5 block text-xs font-semibold"
        >
          What is wrong? <span className="text-danger">*</span>
        </label>
        <select
          id="standalone-issue-type"
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
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="standalone-description" className="text-text block text-xs font-semibold">
            Describe what is wrong <span className="text-danger">*</span>
          </label>
          <span className="text-muted text-[11px]">{description.length}/1000</span>
        </div>
        <textarea
          id="standalone-description"
          rows={4}
          maxLength={1000}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., The learner licence test fee in Gujarat was revised from ₹150 to ₹200 on Sarathi portal..."
          className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/30 w-full border p-3 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      {/* Proposed Correction / Official Source Link (Optional) */}
      <div>
        <label
          htmlFor="standalone-correction"
          className="text-text mb-1.5 block text-xs font-semibold"
        >
          Official source link or correct info{" "}
          <span className="text-muted font-normal">(Optional)</span>
        </label>
        <input
          id="standalone-correction"
          type="text"
          value={proposedCorrection}
          onChange={(e) => setProposedCorrection(e.target.value)}
          placeholder="E.g., https://parivahan.gov.in/ or circular date"
          className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/30 h-[42px] w-full border px-3 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      {/* Reporter Email (Optional) */}
      <div>
        <label htmlFor="standalone-email" className="text-text mb-1.5 block text-xs font-semibold">
          Your Email{" "}
          <span className="text-muted font-normal">(Optional, only if you want an update)</span>
        </label>
        <input
          id="standalone-email"
          type="email"
          value={reporterEmail}
          onChange={(e) => setReporterEmail(e.target.value)}
          placeholder="name@example.com"
          className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/30 h-[42px] w-full border px-3 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      {/* Honeypot Spam Field (Hidden from real users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="standalone-website-field">Leave this empty</label>
        <input
          id="standalone-website-field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="border-border/70 flex items-center justify-end gap-3 border-t pt-4">
        <Link href="/" className="text-muted hover:text-text text-xs">
          Cancel
        </Link>
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
  );
}
