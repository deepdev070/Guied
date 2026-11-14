import * as React from "react";
import { cn } from "@/lib/utils";
import type { IllustrationProps } from "./HeroIllustration";

/**
 * Friendly civic flat illustration for empty states / not found:
 * Paperwork folder with magnifying glass and search sparkles in blue & saffron palette.
 */
export function EmptyIllustration({ className, ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full max-w-xs", className)}
      role="img"
      aria-label="Illustration indicating no search results found"
      {...props}
    >
      {/* Background Soft Accent Circles */}
      <circle cx="140" cy="100" r="85" fill="#EEF3FB" />
      <circle cx="210" cy="55" r="30" fill="#FFF4DB" />
      <circle cx="65" cy="140" r="18" fill="#EAF1FF" />

      {/* Shadow Base */}
      <ellipse cx="140" cy="175" rx="90" ry="8" fill="#E2E8F0" opacity="0.6" />

      {/* Paperwork Document / Folder */}
      <g transform="translate(60, 45)">
        {/* Back page */}
        <rect
          x="25"
          y="0"
          width="90"
          height="110"
          rx="8"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="2"
        />
        <rect x="35" y="15" width="45" height="6" rx="3" fill="#E2E8F0" />
        <rect x="35" y="28" width="65" height="4" rx="2" fill="#EEF3FB" />
        <rect x="35" y="38" width="55" height="4" rx="2" fill="#EEF3FB" />

        {/* Front Folder Tab */}
        <path
          d="M10 30 L45 30 L55 42 L130 42 C135 42 138 46 138 50 L138 120 C138 125 135 128 130 128 L10 128 C5 128 2 125 2 120 L2 38 C2 34 5 30 10 30 Z"
          fill="#FFFFFF"
          stroke="#2563EB"
          strokeWidth="2.5"
        />
        <rect x="18" y="55" width="60" height="6" rx="3" fill="#EEF3FB" />
        <rect x="18" y="68" width="80" height="4" rx="2" fill="#E2E8F0" />
        <rect x="18" y="78" width="50" height="4" rx="2" fill="#E2E8F0" />
      </g>

      {/* Prominent Magnifying Glass in Saffron / Blue */}
      <g transform="translate(130, 75)">
        {/* Glass Lens Rim */}
        <circle cx="45" cy="45" r="32" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
        {/* Glass Interior Soft Tint */}
        <circle cx="45" cy="45" r="28" fill="#FFF4DB" fillOpacity="0.4" />
        {/* Sparkle Reflection on Glass */}
        <path
          d="M30 30 A18 18 0 0 1 55 25"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Handle */}
        <rect
          x="68"
          y="68"
          width="14"
          height="38"
          rx="5"
          transform="rotate(-45 68 68)"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="2"
        />
      </g>

      {/* Decorative Sparkle */}
      <path d="M60 40 Q63 48 70 51 Q63 54 60 62 Q57 54 50 51 Q57 48 60 40 Z" fill="#F59E0B" />
    </svg>
  );
}
