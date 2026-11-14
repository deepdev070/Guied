"use client";

import React from "react";
import { AdSlot } from "./AdSlot";
import { cn } from "@/lib/utils";

export interface LeaderboardAdProps {
  slotId?: string;
  className?: string;
}

/**
 * Standard Leaderboard Advertisement Slot (728x90 desktop / 320x50 mobile).
 * Fixed min-h-[90px] ensures zero Cumulative Layout Shift (CLS). Hidden in print mode via print:hidden.
 */
export function LeaderboardAd({ slotId = "leaderboard-top", className }: LeaderboardAdProps) {
  return (
    <AdSlot
      name="Leaderboard Banner"
      format="leaderboard"
      placementId={slotId}
      className={cn("min-h-[90px] print:hidden", className)}
    />
  );
}
