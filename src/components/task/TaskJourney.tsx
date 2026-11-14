"use client";

import React from "react";
import Link from "next/link";
import { getTaskJourney } from "@/data/task-journeys";
import { useUserState } from "@/context/StatePreferenceContext";
import { Clock, IndianRupee, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskJourneyProps {
  currentTaskSlug: string;
}

/**
 * "What people usually do next" section rendering horizontal journey cards
 * showing regulatory sequence between related citizen paperwork tasks.
 */
export function TaskJourney({ currentTaskSlug }: TaskJourneyProps) {
  const { getTaskLink } = useUserState();
  const { journey, currentStepIndex } = getTaskJourney(currentTaskSlug);

  if (!journey || currentStepIndex === -1) return null;

  return (
    <section aria-labelledby="journey-heading" className="border-border my-14 border-t pt-10">
      <div className="mb-6 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
        <div>
          <div className="rounded-chip bg-primary-soft text-primary mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold">
            <span>Citizen Paperwork Roadmap</span>
          </div>
          <h2 id="journey-heading" className="text-h2 text-text font-bold tracking-tight">
            What People Usually Do Next
          </h2>
          <p className="text-small text-muted mt-1 leading-relaxed">{journey.description}</p>
        </div>
      </div>

      {/* Horizontal Cards Sequence */}
      <div className="relative">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
          {journey.steps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const isImmediateNext = idx === currentStepIndex + 1;
            const stepUrl = getTaskLink(step.taskSlug);

            return (
              <div
                key={step.taskSlug}
                className={cn(
                  "rounded-card shadow-soft-xs flex max-w-[320px] min-w-[280px] flex-1 flex-col justify-between border p-5 transition-all",
                  isCurrent
                    ? "border-primary bg-primary-soft/30 ring-primary/30 ring-2"
                    : isImmediateNext
                      ? "border-accent bg-accent-soft/20 hover:border-accent hover:shadow-soft-md"
                      : "border-border bg-background hover:border-border/80"
                )}
              >
                <div>
                  {/* Step status badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-muted text-xs font-bold tracking-wider uppercase">
                      Step {idx + 1} of {journey.steps.length}
                    </span>

                    {isCurrent ? (
                      <span className="bg-primary rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                        CURRENT GUIDE
                      </span>
                    ) : isCompleted ? (
                      <span className="bg-success-soft text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>Prerequisite</span>
                      </span>
                    ) : isImmediateNext ? (
                      <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                        RECOMMENDED NEXT
                      </span>
                    ) : (
                      <span className="text-muted text-[10px] font-medium">Subsequent</span>
                    )}
                  </div>

                  {/* Step Name */}
                  <h3 className="text-body text-text leading-snug font-bold">{step.name}</h3>

                  <p className="text-small text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div>
                  {/* Meta: Time and Fee */}
                  <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                    <span className="text-muted flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{step.timeEstimate}</span>
                    </span>
                    <span className="text-text flex items-center gap-1 font-bold">
                      <IndianRupee className="text-success h-3.5 w-3.5" aria-hidden="true" />
                      <span>{step.cost}</span>
                    </span>
                  </div>

                  {/* Navigation Button */}
                  <div className="mt-4">
                    {isCurrent ? (
                      <div className="rounded-input border-primary/30 text-primary flex h-10 w-full items-center justify-center bg-white/80 text-xs font-bold">
                        Currently Reading
                      </div>
                    ) : (
                      <Link
                        href={stepUrl}
                        className={cn(
                          "rounded-input flex h-10 w-full items-center justify-center gap-1.5 text-xs font-bold transition-all",
                          isImmediateNext
                            ? "bg-primary hover:bg-primary-hover shadow-soft-xs text-white"
                            : "border-border bg-surface-alt/70 text-text hover:bg-surface-alt hover:border-primary/40 border"
                        )}
                      >
                        <span>
                          {isCompleted
                            ? "View Prerequisite"
                            : isImmediateNext
                              ? "Start Next Step"
                              : "View Guide"}
                        </span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
