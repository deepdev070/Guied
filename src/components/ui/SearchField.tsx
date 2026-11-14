"use client";

import React, { useId, useState, useRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface SearchFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  label: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  hideLabel?: boolean;
  onClear?: () => void;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      label,
      helperText,
      error,
      containerClassName,
      hideLabel = false,
      onClear,
      id,
      value,
      defaultValue,
      onChange,
      disabled,
      className,
      placeholder = "Search services, documents, or states...",
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const internalInputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

    const [internalValue, setInternalValue] = useState<string>(
      (value !== undefined ? value : (defaultValue ?? "")) as string
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value as string) : internalValue;
    const hasValue = Boolean(currentValue && currentValue.length > 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
      }

      if (internalInputRef.current) {
        internalInputRef.current.value = "";
        internalInputRef.current.focus();

        // Dispatch synthetic input event for form libraries & handlers
        const event = new Event("input", { bubbles: true });
        internalInputRef.current.dispatchEvent(event);
      }

      onClear?.();
    };

    const hasError = Boolean(error);
    const describedBy = cn(hasError && errorId, helperText && !hasError && helperId);

    return (
      <div className={cn("flex w-full flex-col", containerClassName)}>
        <label
          htmlFor={inputId}
          className={cn(
            "text-small text-text mb-1.5 font-medium select-none",
            hideLabel && "sr-only"
          )}
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {/* Leading Search Icon */}
          <div className="text-muted pointer-events-none absolute left-3.5 flex items-center">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={internalInputRef}
            id={inputId}
            type="search"
            role="searchbox"
            value={isControlled ? value : internalValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={describedBy || undefined}
            className={cn(
              "rounded-input bg-background text-text h-[48px] min-h-[48px] w-full border pl-11 text-base transition-colors",
              hasValue ? "pr-12" : "pr-4",
              "placeholder:text-muted/60",
              "focus-visible:ring-[3px] focus-visible:ring-offset-1 focus-visible:outline-none",
              hasError
                ? "border-danger focus-visible:border-danger focus-visible:ring-danger/40"
                : "border-border hover:border-muted/50 focus-visible:border-primary focus-visible:ring-primary/40",
              disabled && "bg-surface cursor-not-allowed opacity-60",
              className
            )}
            {...props}
          />

          {/* Clear Button (min 44px tap target for accessibility) */}
          {hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search text"
              className={cn(
                "rounded-input text-muted absolute right-1 flex h-[44px] w-[44px] items-center justify-center transition-colors",
                "hover:text-text focus-visible:ring-primary focus-visible:text-text focus-visible:ring-2 focus-visible:outline-none"
              )}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {hasError ? (
          <p
            id={errorId}
            role="alert"
            className="text-small text-danger mt-1.5 flex items-center gap-1.5 font-medium"
          >
            <svg
              className="h-4 w-4 shrink-0"
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
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-small text-muted mt-1.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
