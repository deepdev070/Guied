import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Callout, CalloutVariant } from "@/components/ui/Callout";

export interface StepItem {
  id?: string;
  stepNumber: number;
  title: string;
  description: string;
  where?: string;
  timeEstimate?: string;
  callout?: {
    variant?: CalloutVariant;
    title?: string;
    content: React.ReactNode;
  };
  link?: {
    href: string;
    label: string;
    isExternal?: boolean;
  };
  isDone?: boolean;
}

export interface StepListProps {
  steps: StepItem[];
  interactive?: boolean;
  onToggleStep?: (stepNumber: number, isDone: boolean) => void;
  className?: string;
}

function LocationPinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

/**
 * StepList component for step-by-step paperwork instructions.
 * - Big numbered circles joined by vertical line
 * - Bold title, readable body
 * - "Where" and "Time" metadata chips
 * - Optional Callout inside steps
 * - Optional official link button
 * - Interactive completion checkbox state
 */
export function StepList({ steps, interactive = false, onToggleStep, className }: StepListProps) {
  const [internalCompleted, setInternalCompleted] = useState<Record<number, boolean>>({});

  const isStepCompleted = (step: StepItem) => {
    if (step.isDone !== undefined) return step.isDone;
    return Boolean(internalCompleted[step.stepNumber]);
  };

  const handleToggle = (stepNumber: number) => {
    const nextState = !internalCompleted[stepNumber];
    setInternalCompleted((prev) => ({
      ...prev,
      [stepNumber]: nextState,
    }));
    onToggleStep?.(stepNumber, nextState);
  };

  return (
    <div className={cn("relative flex flex-col", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = isStepCompleted(step);

        return (
          <div key={step.id ?? step.stepNumber} className="group relative flex items-start">
            {/* Left Vertical Joining Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute top-[44px] bottom-0 left-[19px] w-[2px] transition-colors sm:top-[50px] sm:left-[23px]",
                  done ? "bg-success/50" : "bg-border"
                )}
                aria-hidden="true"
              />
            )}

            {/* Step Number Circle */}
            <div className="relative z-10 shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition-all duration-200 select-none sm:h-12 sm:w-12 sm:text-lg",
                  done
                    ? "bg-success shadow-soft-sm text-white"
                    : "bg-primary shadow-soft-xs text-white"
                )}
                aria-label={`Step ${step.stepNumber} ${done ? "(Completed)" : ""}`}
              >
                {done ? <CheckIcon /> : step.stepNumber}
              </div>
            </div>

            {/* Step Content */}
            <div className="ml-4 flex-1 pb-8 sm:ml-6 sm:pb-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-h3 text-text font-bold tracking-tight">{step.title}</h3>

                {interactive && (
                  <button
                    type="button"
                    onClick={() => handleToggle(step.stepNumber)}
                    className={cn(
                      "rounded-input inline-flex min-h-[44px] items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-colors",
                      "focus-visible:ring-primary/40 focus-visible:ring-[3px] focus-visible:outline-none",
                      done
                        ? "bg-success-soft text-success border-success/30 hover:bg-success-soft/80 border"
                        : "bg-background text-muted border-border hover:bg-surface-alt border"
                    )}
                    aria-pressed={done}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                        done ? "bg-success border-success text-white" : "border-muted bg-white"
                      )}
                    >
                      {done && <CheckIcon className="h-3 w-3" />}
                    </span>
                    <span>{done ? "Completed" : "Mark as done"}</span>
                  </button>
                )}
              </div>

              {/* Where and Time Chips */}
              {(step.where || step.timeEstimate) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {step.where && (
                    <span className="rounded-chip border-border bg-surface text-muted inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold">
                      <LocationPinIcon />
                      <span>{step.where}</span>
                    </span>
                  )}
                  {step.timeEstimate && (
                    <span className="rounded-chip border-accent/30 bg-accent-soft text-warning inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold">
                      <ClockIcon />
                      <span>{step.timeEstimate}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Step Description */}
              <p className="text-body text-text mt-3 leading-relaxed">{step.description}</p>

              {/* Embedded Step Callout */}
              {step.callout && (
                <Callout
                  variant={step.callout.variant ?? "tip"}
                  title={step.callout.title}
                  className="my-3"
                >
                  {step.callout.content}
                </Callout>
              )}

              {/* Official Link Button */}
              {step.link && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="md"
                    href={step.link.href}
                    target={step.link.isExternal ? "_blank" : undefined}
                    rel={step.link.isExternal ? "noopener noreferrer" : undefined}
                    rightIcon={step.link.isExternal ? <ExternalLinkIcon /> : undefined}
                  >
                    {step.link.label}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
