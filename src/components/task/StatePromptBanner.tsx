"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { useUserState } from "@/context/StatePreferenceContext";
import { StateSelectModal } from "@/components/layout/StateSelectModal";

export interface StatePromptBannerProps {
  taskSlug: string;
  hasStateOverride?: boolean;
}

export function StatePromptBanner({
  taskSlug,
  hasStateOverride: _hasStateOverride = true,
}: StatePromptBannerProps) {
  const { selectedState, stateData } = useUserState();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-card border-accent/40 bg-accent-soft/30 my-6 flex flex-col items-start justify-between gap-3 border p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="bg-accent-soft text-warning mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-body text-text font-bold">Viewing national baseline procedure</h3>
            <p className="text-small text-muted mt-0.5">
              Fees, local RTO/office counter forms, and online portals vary by state.
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          {selectedState && selectedState !== "national" ? (
            <Link
              href={`/${taskSlug}/${selectedState}`}
              className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex h-10 w-full items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white transition-colors sm:w-auto"
            >
              <span>See {stateData?.name || selectedState} rules</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex h-10 w-full items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white transition-colors sm:w-auto"
            >
              <span>Select your state</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-input border-border text-text hover:bg-surface-alt flex h-10 items-center justify-center border bg-white px-3 text-xs font-medium transition-colors"
            title="Change state"
          >
            Change
          </button>
        </div>
      </div>

      <StateSelectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
