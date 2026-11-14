import * as React from "react";
import { cn } from "@/lib/utils";
import type { IllustrationProps } from "./HeroIllustration";

/**
 * Friendly civic flat illustration for success states / verified completed tasks:
 * Document approved with green & saffron celebratory checkmark shield.
 */
export function SuccessIllustration({ className, ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full max-w-xs", className)}
      role="img"
      aria-label="Illustration indicating paperwork completion and verification"
      {...props}
    >
      {/* Background Soft Accent Circles */}
      <circle cx="140" cy="100" r="85" fill="#E8F7EE" />
      <circle cx="210" cy="50" r="28" fill="#FFF4DB" />
      <circle cx="70" cy="65" r="22" fill="#EAF1FF" />

      {/* Shadow Base */}
      <ellipse cx="140" cy="175" rx="85" ry="8" fill="#E2E8F0" opacity="0.6" />

      {/* Verified Document */}
      <g transform="translate(85, 30)">
        {/* Certificate / Permit paper */}
        <rect
          x="0"
          y="0"
          width="110"
          height="140"
          rx="10"
          fill="#FFFFFF"
          stroke="#15803D"
          strokeWidth="2.5"
        />

        {/* Header Ribbon / Border */}
        <rect x="12" y="16" width="86" height="8" rx="4" fill="#2563EB" opacity="0.85" />
        <rect x="25" y="32" width="60" height="4" rx="2" fill="#E2E8F0" />
        <rect x="20" y="44" width="70" height="4" rx="2" fill="#E2E8F0" />
        <rect x="20" y="54" width="50" height="4" rx="2" fill="#E2E8F0" />

        {/* Circular Stamp */}
        <circle
          cx="55"
          cy="95"
          r="24"
          fill="#FFF4DB"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="2 2"
        />
        <circle cx="55" cy="95" r="18" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
        <path
          d="M48 95 L53 100 L63 90"
          stroke="#15803D"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Prominent Success Badge / Shield in Foreground */}
      <g transform="translate(145, 95)">
        <circle cx="36" cy="36" r="32" fill="#15803D" />
        <circle cx="36" cy="36" r="26" fill="#FFFFFF" />
        <path
          d="M26 36 L33 43 L47 28"
          stroke="#15803D"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Celebratory Saffron & Blue Confetti dots */}
      <circle cx="65" cy="40" r="3" fill="#F59E0B" />
      <circle cx="215" cy="40" r="4" fill="#2563EB" />
      <circle cx="50" cy="115" r="3" fill="#2563EB" />
      <circle cx="225" cy="110" r="3" fill="#F59E0B" />
      <circle cx="85" cy="155" r="2.5" fill="#15803D" />
      <circle cx="195" cy="150" r="3" fill="#F59E0B" />
    </svg>
  );
}
