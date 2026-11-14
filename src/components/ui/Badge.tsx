import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  "verified" | "needs-update" | "new" | "official" | "difficulty" | "neutral";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  date?: string;
  difficulty?: DifficultyLevel;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function SparkleIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5L12 0z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function DifficultyDots({ level }: { level: DifficultyLevel }) {
  const activeCount = level === "easy" ? 1 : level === "medium" ? 2 : 3;
  const dotColor =
    level === "easy" ? "bg-success" : level === "medium" ? "bg-warning" : "bg-danger";

  return (
    <span className="inline-flex shrink-0 items-center gap-1" aria-hidden="true">
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            dot <= activeCount ? dotColor : "bg-border"
          )}
        />
      ))}
    </span>
  );
}

/**
 * Reusable Badge component for metadata, verification statuses, and official stamps.
 * Always pairs colour with text or an icon to ensure WCAG AA compliance (meaning never depends on color alone).
 */
export function Badge({
  variant = "neutral",
  date,
  difficulty = "easy",
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  switch (variant) {
    case "verified":
      return (
        <span
          className={cn(
            "rounded-chip border-success/30 bg-success-soft text-success inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold select-none",
            className
          )}
          {...props}
        >
          {icon ?? <CheckIcon />}
          <span>{children ?? (date ? `Verified on ${date}` : "Verified")}</span>
        </span>
      );

    case "needs-update":
      return (
        <span
          className={cn(
            "rounded-chip border-warning/30 bg-warning-soft text-warning inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold select-none",
            className
          )}
          {...props}
        >
          {icon ?? <AlertTriangleIcon />}
          <span>{children ?? (date ? `Needs verification (${date})` : "Needs update")}</span>
        </span>
      );

    case "new":
      return (
        <span
          className={cn(
            "rounded-chip border-accent/40 bg-accent-soft text-warning inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold select-none",
            className
          )}
          {...props}
        >
          {icon ?? <SparkleIcon className="h-3 w-3" />}
          <span>{children ?? "New"}</span>
        </span>
      );

    case "official":
      return (
        <span
          className={cn(
            "rounded-chip border-primary/30 bg-primary-soft text-primary inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold select-none",
            className
          )}
          {...props}
        >
          {icon ?? <ShieldCheckIcon />}
          <span>{children ?? "Official source"}</span>
        </span>
      );

    case "difficulty": {
      const difficultyLabels: Record<DifficultyLevel, string> = {
        easy: "Easy",
        medium: "Medium",
        hard: "Complex",
      };

      const difficultyStyles: Record<DifficultyLevel, string> = {
        easy: "border-success/30 bg-success-soft text-success",
        medium: "border-warning/30 bg-warning-soft text-warning",
        hard: "border-danger/30 bg-danger-soft text-danger",
      };

      return (
        <span
          className={cn(
            "rounded-chip inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold select-none",
            difficultyStyles[difficulty],
            className
          )}
          {...props}
        >
          <DifficultyDots level={difficulty} />
          <span>{children ?? difficultyLabels[difficulty]}</span>
        </span>
      );
    }

    case "neutral":
    default:
      return (
        <span
          className={cn(
            "rounded-chip border-border bg-surface-alt text-muted inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-medium select-none",
            className
          )}
          {...props}
        >
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      );
  }
}
