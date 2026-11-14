import React from "react";
import { Building2, ExternalLink, MapPin } from "lucide-react";
import type { StateSeedData } from "../../../prisma/data/states";

export interface StatePortalHeaderProps {
  state: StateSeedData;
  isStateOverride: boolean;
  taskName: string;
}

/**
 * State official office/portal block displayed at the top of /[task]/[state] pages.
 */
export function StatePortalHeader({ state, isStateOverride, taskName }: StatePortalHeaderProps) {
  return (
    <div className="rounded-card border-border from-surface to-surface-alt mb-6 border bg-gradient-to-r p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="bg-primary-soft text-primary mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-text text-sm font-bold sm:text-base">
                {state.name} Department & Office Guidelines
              </span>
              {state.nativeName && (
                <span className="text-muted text-xs font-normal">({state.nativeName})</span>
              )}
              {state.launchState && (
                <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                  LAUNCH STATE
                </span>
              )}
            </div>

            <p className="text-small text-muted mt-1 leading-snug">
              Official paperwork rules and local counter procedures for {taskName} in {state.name}.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {state.portalUrl ? (
            <a
              href={state.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs inline-flex h-10 items-center gap-1.5 px-4 text-xs font-semibold text-white transition-colors"
            >
              <span>{state.portalName || "State Portal"}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <div className="rounded-input border-border text-muted inline-flex h-10 items-center gap-1.5 border bg-white px-3 text-xs font-medium">
              <MapPin className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>{state.portalName || "Local District Office / Kendra"}</span>
            </div>
          )}

          {isStateOverride ? (
            <span className="bg-success-soft text-success border-success/30 hidden rounded-full border px-2.5 py-1 text-xs font-bold sm:inline-block">
              State Verified ✓
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
