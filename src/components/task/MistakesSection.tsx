import React from "react";
import type { RejectionReason } from "@/types/content";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlossaryText } from "@/components/glossary/GlossaryText";

export interface MistakesSectionProps {
  reasons: RejectionReason[];
}

/**
 * "Why applications get rejected" section displaying 5-8 RejectionReason cards
 * in red-soft / amber-soft civic alert styling with actionable prevention steps.
 */
export function MistakesSection({ reasons }: MistakesSectionProps) {
  if (!reasons || reasons.length === 0) return null;

  // Limit to the 5-8 most critical rejection reasons
  const displayReasons = reasons.slice(0, 8);

  return (
    <section id="mistakes" aria-labelledby="mistakes-heading" className="my-12 scroll-mt-28">
      <div className="border-border/80 mb-6 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-baseline">
        <div>
          <h2 id="mistakes-heading" className="text-h2 text-text font-bold tracking-tight">
            Why Applications Get Rejected
          </h2>
          <p className="text-small text-muted mt-1">
            Review these top {displayReasons.length} counter rejection triggers before visiting the
            office.
          </p>
        </div>

        <span className="bg-danger-soft text-danger border-danger/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          <span>Common Mistakes</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {displayReasons.map((r, idx) => {
          // Alternating red-soft and amber-soft styling for high visual clarity
          const isDanger = idx % 2 === 0;

          return (
            <div
              key={`${r.title}-${idx}`}
              className={cn(
                "rounded-card shadow-soft-xs flex flex-col justify-between border p-5 transition-all",
                isDanger
                  ? "border-danger/30 bg-danger-soft/20 hover:border-danger/50"
                  : "border-warning/30 bg-warning-soft/25 hover:border-warning/50"
              )}
            >
              <div>
                <div className="mb-2.5 flex items-start gap-2.5">
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      isDanger
                        ? "bg-danger shadow-soft-xs text-white"
                        : "bg-warning shadow-soft-xs text-white"
                    )}
                    aria-hidden="true"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-body text-text font-bold">{r.title}</h3>
                    <span className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                      Rejection Risk #{idx + 1}
                    </span>
                  </div>
                </div>

                <p className="text-small text-muted pl-10.5 leading-relaxed">
                  <GlossaryText text={r.description} />
                </p>
              </div>

              {r.solution && (
                <div className="rounded-input border-success/30 text-text mt-4 flex items-start gap-2.5 border bg-white/90 p-3 text-xs shadow-2xs">
                  <CheckCircle2
                    className="text-success mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="leading-relaxed">
                    <strong className="text-success font-semibold">How to avoid: </strong>
                    <GlossaryText text={r.solution} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
