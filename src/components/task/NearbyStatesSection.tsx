import React from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { getNearbyStates } from "@/data/nearby-states";

export interface NearbyStatesSectionProps {
  taskSlug: string;
  taskName: string;
  currentStateSlug?: string;
  currentStateName?: string;
}

/**
 * Prompt 79: Cross-state internal linking mesh.
 * Renders nearby state links for the same task so citizens and search crawlers
 * can navigate between adjacent state transport/civic portals seamlessly.
 */
export function NearbyStatesSection({
  taskSlug,
  taskName,
  currentStateSlug,
  currentStateName,
}: NearbyStatesSectionProps) {
  const nearbyStates = getNearbyStates(currentStateSlug);

  if (!nearbyStates || nearbyStates.length === 0) return null;

  return (
    <section aria-labelledby="nearby-states-heading" className="border-border my-12 border-t pt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-primary mb-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>State Portal Network</span>
          </div>
          <h2 id="nearby-states-heading" className="text-h3 text-text font-bold tracking-tight">
            {currentStateName
              ? `${taskName} in Neighboring States`
              : `${taskName} Across Major States`}
          </h2>
          <p className="text-small text-muted mt-0.5">
            Compare statutory state fees, regional transport portals & local counter rules:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {nearbyStates.map((state) => {
          const isCurrent = state.slug === currentStateSlug;

          if (isCurrent) return null;

          return (
            <Link
              key={state.code}
              href={`/${taskSlug}/${state.slug}`}
              className="rounded-input border-border bg-background hover:bg-surface-alt hover:border-primary/50 group focus-visible:ring-primary/40 flex items-center justify-between border p-3 transition-all focus-visible:ring-3 focus-visible:outline-none"
            >
              <div className="flex flex-col truncate pr-1">
                <span className="text-body text-text group-hover:text-primary truncate text-sm font-semibold transition-colors">
                  {state.name}
                </span>
                <span className="text-muted text-[11px]">Official Portal</span>
              </div>
              <ChevronRight
                className="text-muted group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
