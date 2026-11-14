import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export function ProgressRing({
  value,
  max,
  size = 56,
  strokeWidth = 5,
  className,
  showText = true,
}: ProgressRingProps) {
  const safeMax = max > 0 ? max : 1;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((safeValue / safeMax) * 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isComplete = safeValue === safeMax && max > 0;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`Checklist progress: ${safeValue} of ${max} documents ready (${percentage}%)`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform transition-transform duration-300"
        aria-hidden="true"
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/80"
          fill="none"
        />

        {/* Foreground Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500 ease-out",
            isComplete ? "text-success" : "text-primary"
          )}
          fill="none"
        />
      </svg>

      {/* Center Text (e.g. "4/9" or "100%") */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isComplete ? (
            <svg
              className="text-success animate-in fade-in zoom-in-75 h-5 w-5 duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-text text-[11px] leading-none font-bold tabular-nums">
              {safeValue}/{max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
