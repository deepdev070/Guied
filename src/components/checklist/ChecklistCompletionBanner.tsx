import React from "react";
import { cn } from "@/lib/utils";

export interface ChecklistCompletionBannerProps {
  totalCount: number;
  taskTitle: string;
  onReset?: () => void;
  className?: string;
}

export function ChecklistCompletionBanner({
  totalCount,
  taskTitle,
  onReset,
  className,
}: ChecklistCompletionBannerProps) {
  return (
    <aside
      aria-label="Checklist Completed Notification"
      className={cn(
        "animate-completion-subtle rounded-card border-success/30 bg-success-soft text-text shadow-soft-sm border p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Success Icon */}
        <div className="bg-success flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-xs">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Message Content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-success rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
              Folder Ready
            </span>
            <span className="text-success text-xs font-semibold">
              All {totalCount} of {totalCount} documents gathered
            </span>
          </div>

          <h3 className="text-text mt-1.5 text-base font-bold sm:text-lg">
            You&apos;re completely ready for your application!
          </h3>

          <p className="text-muted mt-1 text-xs leading-relaxed sm:text-sm">
            You have gathered every original document, self-attested photocopy, and form needed for{" "}
            <strong>{taskTitle}</strong>. Remember to keep originals in one transparent sleeve and
            photocopies in an outer folder before heading to the office.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="#steps"
              className="rounded-button bg-success hover:bg-success/90 inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <span>See Next Steps at Office &rarr;</span>
            </a>

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-muted hover:text-danger text-xs font-medium transition-colors hover:underline"
              >
                Reset Checklist
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
