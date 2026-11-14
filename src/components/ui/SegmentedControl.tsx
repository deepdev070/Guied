"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  className?: string;
  size?: "md" | "lg";
  fullWidth?: boolean;
  ariaLabel?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  className,
  size = "md",
  fullWidth = false,
  ariaLabel = "Option selection",
  name,
}: SegmentedControlProps<T>) {
  const [internalValue, setInternalValue] = React.useState<T>(
    () => defaultValue || (options[0]?.value as T)
  );

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = React.useCallback(
    (val: T) => {
      if (controlledValue === undefined) {
        setInternalValue(val);
      }
      onChange?.(val);
    },
    [controlledValue, onChange]
  );

  // WAI-ARIA arrow navigation for radio groups
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabled = options.filter((opt) => !opt.disabled);
    const enabledIndex = enabled.findIndex((opt) => opt.value === options[currentIndex]?.value);

    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (enabledIndex + 1) % enabled.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (enabledIndex - 1 + enabled.length) % enabled.length;
    }

    if (nextIndex >= 0) {
      const nextOption = enabled[nextIndex];
      if (nextOption) {
        handleSelect(nextOption.value);
        const nextButton = containerRef.current?.querySelector<HTMLButtonElement>(
          `[data-value="${nextOption.value}"]`
        );
        nextButton?.focus();
      }
    }
  };

  const isLg = size === "lg";

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "border-border/80 bg-surface-alt inline-flex snap-x snap-mandatory scrollbar-none items-center overflow-x-auto rounded-xl border p-1",
        fullWidth && "flex w-full",
        className
      )}
    >
      {name && <input type="hidden" name={name} value={selectedValue} />}
      {options.map((option, index) => {
        const isChecked = option.value === selectedValue;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isChecked}
            data-value={option.value}
            tabIndex={isChecked ? 0 : -1}
            disabled={option.disabled}
            onClick={() => handleSelect(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 select-none",
              "focus-visible:ring-primary/40 focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:outline-none",
              isLg ? "min-h-[48px] px-5 py-2.5 text-base" : "min-h-[40px] px-3.5 py-1.5 text-sm",
              fullWidth ? "flex-1" : "",
              option.disabled && "cursor-not-allowed opacity-40",
              isChecked
                ? "text-primary border-border/60 border bg-white font-semibold shadow-xs"
                : "text-muted hover:text-text border border-transparent hover:bg-white/40"
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge && <span className="shrink-0">{option.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
