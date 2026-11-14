"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Scale, Smartphone, ShieldCheck, Share2, ArrowRight } from "lucide-react";
import { type HouseAdCard, type AdFormat, getHouseAdForFormat } from "./house-ads";

export interface HouseAdProps {
  card?: HouseAdCard;
  format?: AdFormat;
  slotId?: string;
  className?: string;
}

const ICONS = {
  notary: Scale,
  app: Smartphone,
  verify: ShieldCheck,
  share: Share2,
};

export function HouseAd({ card, format = "rectangle", slotId, className }: HouseAdProps) {
  const activeCard = card || getHouseAdForFormat(format, slotId);
  const IconComponent = ICONS[activeCard.iconName] || ShieldCheck;
  const isPartner = activeCard.type === "partner";
  const isHorizontal = format === "leaderboard";
  const isAnchor = format === "anchor";

  if (isAnchor) {
    return (
      <div
        className={cn(
          "flex h-[50px] w-[320px] items-center justify-between gap-2 px-3 py-1 text-left",
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <IconComponent className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="truncate text-xs">
            <span className="text-text font-bold">{activeCard.title}</span>
          </div>
        </div>
        <Link
          href={activeCard.ctaHref}
          className="rounded-input bg-primary hover:bg-primary-hover shrink-0 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
        >
          {activeCard.ctaText}
        </Link>
      </div>
    );
  }

  if (isHorizontal) {
    return (
      <div
        className={cn(
          "rounded-card border-border from-surface-alt/90 to-surface-alt/70 shadow-soft-xs flex h-full min-h-[90px] w-full max-w-[728px] items-center justify-between border border-dashed bg-gradient-to-r via-white p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary-soft text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <IconComponent className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "py-0.2 rounded-full px-2 text-[10px] font-bold tracking-wider uppercase",
                  isPartner
                    ? "bg-accent-soft text-warning border-warning/30 border"
                    : "bg-primary-soft text-primary"
                )}
              >
                {isPartner ? "Sponsored" : activeCard.badgeText || "Civic Resource"}
              </span>
            </div>
            <h4 className="text-body text-text mt-0.5 font-bold">{activeCard.title}</h4>
            <p className="text-small text-muted hidden max-w-lg truncate sm:block">
              {activeCard.description}
            </p>
          </div>
        </div>

        <Link
          href={activeCard.ctaHref}
          className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex shrink-0 items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
        >
          <span>{activeCard.ctaText}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // Vertical card (Rectangle 300x250, Large Rectangle 336x280, In-article)
  return (
    <div
      className={cn(
        "rounded-card border-border to-surface-alt/60 shadow-soft-xs flex h-full min-h-[220px] w-full max-w-[336px] flex-col justify-between border border-dashed bg-gradient-to-b from-white p-5 text-center",
        className
      )}
    >
      <div>
        <div className="mb-2 flex items-center justify-center">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
              isPartner
                ? "bg-accent-soft text-warning border-warning/30 border"
                : "bg-primary-soft text-primary"
            )}
          >
            {isPartner ? "Sponsored" : activeCard.badgeText || "Civic Resource"}
          </span>
        </div>

        <div className="bg-primary-soft text-primary mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl">
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>

        <h4 className="text-body text-text font-bold">{activeCard.title}</h4>
        <p className="text-small text-muted mt-1.5 line-clamp-3 text-xs leading-relaxed">
          {activeCard.description}
        </p>
      </div>

      <div className="mt-4">
        <Link
          href={activeCard.ctaHref}
          className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white transition-colors"
        >
          <span>{activeCard.ctaText}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
