import * as React from "react";
import { cn } from "@/lib/utils";

export interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Friendly civic flat illustration for the hero section:
 * Indian citizen with document checklist clipboard, official seal, and checkmarks in blue & saffron palette.
 */
export function HeroIllustration({ className, ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("civic-illustration h-auto w-full max-w-md", className)}
      data-illustration="true"
      role="img"
      aria-label="Illustration of citizen paperwork checklist and verified government procedures"
      {...props}
    >
      {/* Background Soft Accent Circles */}
      <circle cx="200" cy="150" r="130" fill="#EEF3FB" />
      <circle cx="280" cy="90" r="45" fill="#FFF4DB" />
      <circle cx="110" cy="220" r="25" fill="#EAF1FF" />

      {/* Ground / Base Surface */}
      <ellipse cx="200" cy="265" rx="140" ry="12" fill="#E2E8F0" opacity="0.6" />

      {/* Main Document Clipboard (Left) */}
      <g transform="translate(90, 60)">
        {/* Board */}
        <rect
          x="0"
          y="20"
          width="130"
          height="180"
          rx="12"
          fill="#FFFFFF"
          stroke="#2563EB"
          strokeWidth="3"
        />
        {/* Clip at top */}
        <rect
          x="35"
          y="10"
          width="60"
          height="20"
          rx="6"
          fill="#F7F9FC"
          stroke="#475569"
          strokeWidth="2.5"
        />
        <circle cx="65" cy="16" r="4" fill="#F59E0B" />

        {/* Header bar on sheet */}
        <rect x="20" y="45" width="90" height="8" rx="4" fill="#2563EB" opacity="0.8" />

        {/* Checklist rows */}
        {/* Item 1 */}
        <rect
          x="20"
          y="68"
          width="16"
          height="16"
          rx="4"
          fill="#E8F7EE"
          stroke="#15803D"
          strokeWidth="2"
        />
        <path
          d="M23 76 L27 80 L33 72"
          stroke="#15803D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="44" y="72" width="65" height="8" rx="4" fill="#E2E8F0" />

        {/* Item 2 */}
        <rect
          x="20"
          y="96"
          width="16"
          height="16"
          rx="4"
          fill="#E8F7EE"
          stroke="#15803D"
          strokeWidth="2"
        />
        <path
          d="M23 104 L27 108 L33 100"
          stroke="#15803D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="44" y="100" width="55" height="8" rx="4" fill="#E2E8F0" />

        {/* Item 3 */}
        <rect
          x="20"
          y="124"
          width="16"
          height="16"
          rx="4"
          fill="#E8F7EE"
          stroke="#15803D"
          strokeWidth="2"
        />
        <path
          d="M23 132 L27 136 L33 128"
          stroke="#15803D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="44" y="128" width="60" height="8" rx="4" fill="#E2E8F0" />

        {/* Item 4 */}
        <rect
          x="20"
          y="152"
          width="16"
          height="16"
          rx="4"
          fill="#FFF4DB"
          stroke="#F59E0B"
          strokeWidth="2"
        />
        <circle cx="28" cy="160" r="3" fill="#F59E0B" />
        <rect x="44" y="156" width="45" height="8" rx="4" fill="#E2E8F0" />
      </g>

      {/* Floating Official Stamp / Badge (Right) */}
      <g transform="translate(230, 95)">
        <circle cx="50" cy="50" r="42" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="#FFF4DB"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        {/* Ashoka Chakra / Indian Civic emblem motif */}
        <circle cx="50" cy="50" r="16" stroke="#2563EB" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="4" fill="#2563EB" />
        {/* Rays */}
        <path
          d="M50 36 L50 42 M50 58 L50 64 M36 50 L42 50 M58 50 L64 50"
          stroke="#2563EB"
          strokeWidth="1.5"
        />
        {/* Verified Ribbon */}
        <rect x="15" y="78" width="70" height="20" rx="6" fill="#2563EB" />
        <text
          x="50"
          y="92"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          VERIFIED
        </text>
      </g>

      {/* Floating Decorative Elements */}
      {/* Saffron Star / Sparkle */}
      <path
        d="M320 60 Q325 70 335 75 Q325 80 320 90 Q315 80 305 75 Q315 70 320 60 Z"
        fill="#F59E0B"
      />
      {/* Blue Sparkle */}
      <path
        d="M80 130 Q83 138 91 142 Q83 146 80 154 Q77 146 69 142 Q77 138 80 130 Z"
        fill="#2563EB"
      />
    </svg>
  );
}
