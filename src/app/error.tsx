"use client";

import * as React from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to console (or telemetry in future phases)
    console.error("Civic Portal App Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ErrorState
        title="We encountered a problem loading this paperwork guide"
        description="We could not display the official procedure right now. Please try again or return to the main directory to select another citizen service."
        error={error}
        reset={reset}
        homeHref="/"
      />
    </div>
  );
}
