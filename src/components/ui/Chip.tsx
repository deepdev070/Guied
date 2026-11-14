import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ChipSize = "sm" | "md";

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  selected?: boolean;
  size?: ChipSize;
  icon?: React.ReactNode;
  count?: number | string;
  onRemove?: () => void;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

function SelectedCheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

/**
 * Filter Chip component with selectable state.
 * Always pairs colour with text or icon so meaning never depends on colour alone.
 */
export const Chip = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ChipProps>(
  function Chip(
    {
      selected = false,
      size = "md",
      icon,
      count,
      onRemove,
      href,
      disabled = false,
      children,
      className,
      ...props
    },
    ref
  ) {
    const sizeStyles: Record<ChipSize, string> = {
      sm: "min-h-[36px] px-3 py-1 text-xs",
      md: "min-h-[44px] px-4 py-2 text-small",
    };

    const baseClasses = cn(
      "inline-flex items-center gap-2 rounded-chip border transition-all duration-150 select-none",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 focus-visible:ring-offset-1",
      sizeStyles[size],
      selected
        ? "bg-primary text-white border-primary shadow-soft-xs font-semibold"
        : "bg-background text-text border-border hover:bg-surface-alt active:bg-surface-alt/90 font-medium",
      disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    );

    const content = (
      <>
        {selected ? (
          <SelectedCheckIcon />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}

        <span>{children}</span>

        {count !== undefined && (
          <span
            className={cn(
              "py-0.2 ml-0.5 rounded-full px-1.5 text-xs font-semibold",
              selected ? "bg-white/20 text-white" : "bg-surface-alt text-muted"
            )}
          >
            {count}
          </span>
        )}

        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Remove filter"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                onRemove();
              }
            }}
            className={cn(
              "ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors",
              selected
                ? "text-white hover:bg-white/25"
                : "hover:bg-border text-muted hover:text-text"
            )}
          >
            <RemoveIcon />
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          aria-pressed={selected}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        aria-pressed={selected}
        className={baseClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);
