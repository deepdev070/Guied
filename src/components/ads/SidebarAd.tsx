"use client";

import React from "react";
import { AdSlot } from "./AdSlot";
import { cn } from "@/lib/utils";

export interface SidebarAdProps {
  slotId?: string;
  className?: string;
}

/**
 * Standard Medium Rectangle Sidebar Advertisement Slot (300x250).
 * Fixed h-[250px] min-h-[250px] ensures zero Cumulative Layout Shift (CLS). Hidden in print mode via print:hidden.
 */
export function SidebarAd({ slotId = "sidebar-rect", className }: SidebarAdProps) {
  return (
    <AdSlot
      name="Sidebar Medium Rectangle"
      format="rectangle"
      placementId={slotId}
      className={cn("h-[250px] min-h-[250px] print:hidden", className)}
    />
  );
}
