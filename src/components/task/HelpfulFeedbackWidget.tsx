"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, Send } from "lucide-react";

export interface HelpfulFeedbackWidgetProps {
  taskSlug: string;
  stateSlug?: string;
  className?: string;
}

type FeedbackState = "initial" | "helpful_submitted" | "unhelpful_flow" | "details_submitted";

const REASON_CHIPS: Array<{ id: string; label: string }> = [
  { id: "missing_document", label: "Missing document" },
  { id: "fee_mismatch", label: "Fee amount was different" },
  { id: "broken_link", label: "Official link broken" },
  { id: "outdated_steps", label: "Steps out of date" },
  { id: "hard_to_understand", label: "Hard to understand" },
  { id: "other", label: "Other issue" },
];

export function HelpfulFeedbackWidget({
  taskSlug,
  stateSlug,
  className = "",
}: HelpfulFeedbackWidgetProps) {
  const [state, setState] = useState<FeedbackState>("initial");
  const [selectedReason, setSelectedReason] = useState<string>("missing_document");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/page-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskSlug,
          stateSlug: stateSlug || null,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : null,
          isHelpful,
        }),
      });

      if (isHelpful) {
        setState("helpful_submitted");
      } else {
        setState("unhelpful_flow");
      }
    } catch {
      // If offline, still advance UI gracefully
      if (isHelpful) {
        setState("helpful_submitted");
      } else {
        setState("unhelpful_flow");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/page-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskSlug,
          stateSlug: stateSlug || null,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : null,
          isHelpful: false,
          missingReason: selectedReason,
          details: details.trim() || null,
        }),
      });
      setState("details_submitted");
    } catch {
      setState("details_submitted");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      aria-label="Was this page helpful?"
      className={`rounded-card border-border bg-surface-alt/50 border p-5 sm:p-6 print:hidden ${className}`}
    >
      {/* 1. Initial State: Yes / No */}
      {state === "initial" && (
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-primary-soft text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-body text-text font-bold">Was this page helpful?</h3>
              <p className="text-muted text-xs">
                Your feedback directly helps us improve civic guidance for citizens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVote(true)}
              className="rounded-input border-border/80 bg-background hover:border-success hover:bg-success-soft hover:text-success text-text flex h-11 min-w-[90px] cursor-pointer items-center justify-center gap-2 border px-4 text-xs font-bold transition-all active:scale-98 disabled:opacity-50"
            >
              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
              <span>Yes</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVote(false)}
              className="rounded-input border-border/80 bg-background hover:border-danger hover:bg-danger-soft hover:text-danger text-text flex h-11 min-w-[90px] cursor-pointer items-center justify-center gap-2 border px-4 text-xs font-bold transition-all active:scale-98 disabled:opacity-50"
            >
              <ThumbsDown className="h-4 w-4" aria-hidden="true" />
              <span>No</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Positive Feedback Thank-You */}
      {state === "helpful_submitted" && (
        <div className="flex items-center gap-3 text-left">
          <CheckCircle2 className="text-success h-6 w-6 shrink-0" aria-hidden="true" />
          <div>
            <h4 className="text-text text-sm font-bold">Thank you for your feedback!</h4>
            <p className="text-muted text-xs">
              We verify and audit our checklists every week against official gazettes.
            </p>
          </div>
        </div>
      )}

      {/* 3. Unhelpful Flow: "What was missing?" with chips and text field */}
      {state === "unhelpful_flow" && (
        <form onSubmit={handleDetailedSubmit} className="space-y-4">
          <div>
            <h4 className="text-body text-text font-bold">What was missing?</h4>
            <p className="text-muted text-xs">
              Select the main issue so our research team can correct it:
            </p>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {REASON_CHIPS.map((chip) => {
              const isSelected = selectedReason === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedReason(chip.id)}
                  className={`rounded-chip cursor-pointer border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-primary bg-primary shadow-soft-xs text-white"
                      : "border-border bg-background text-text hover:border-primary/50 hover:bg-surface-alt"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Optional Text Field */}
          <div>
            <label htmlFor="feedback-details" className="sr-only">
              Additional Details
            </label>
            <textarea
              id="feedback-details"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us what could be improved (e.g. missing document or different fee)..."
              className="rounded-input border-border bg-background text-text placeholder:text-muted/60 focus:border-primary focus:ring-primary/20 w-full border p-3 text-xs focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex h-9 cursor-pointer items-center gap-1.5 px-4 text-xs font-bold text-white transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Detailed Feedback Thank-You */}
      {state === "details_submitted" && (
        <div className="flex items-center gap-3 text-left">
          <CheckCircle2 className="text-success h-6 w-6 shrink-0" aria-hidden="true" />
          <div>
            <h4 className="text-text text-sm font-bold">Thank you for helping us improve!</h4>
            <p className="text-muted text-xs">
              Our civic editorial team will review your feedback and verify against the official
              portal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
