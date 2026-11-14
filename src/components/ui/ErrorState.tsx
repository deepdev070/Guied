"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error & { digest?: string };
  reset?: () => void;
  homeHref?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong loading this paperwork guide",
  description = "We could not display the procedure at this moment. You can try refreshing the page, or return to the home page to browse other services.",
  error,
  reset,
  homeHref = "/",
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      role="alert"
      className={cn(
        "rounded-card border-danger/30 bg-danger-soft/40 flex flex-col items-center justify-center border px-6 py-12 text-center sm:px-12 sm:py-16",
        className
      )}
    >
      {/* Warning Circle Icon */}
      <div className="bg-danger-soft text-danger mb-5 flex h-16 w-16 items-center justify-center rounded-full">
        <svg
          className="text-danger h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="text-h2 text-text mb-2 max-w-lg font-bold">{title}</h2>
      <p className="text-body text-muted mb-6 max-w-md leading-relaxed">{description}</p>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button onClick={reset} variant="primary" size="md">
            Try again
          </Button>
        )}
        <Button href={homeHref} variant="secondary" size="md">
          Return to Home
        </Button>
      </div>

      {/* Optional Debug Details in Development */}
      {error && (
        <div className="mt-8 w-full max-w-md text-left">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-muted hover:text-text text-xs underline focus-visible:outline-none"
          >
            {showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
          </button>
          {showDetails && (
            <pre className="border-border text-danger mt-2 overflow-x-auto rounded-lg border bg-white p-3 font-mono text-xs">
              {error.message || "Unknown client error"}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
