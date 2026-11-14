import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  hideLabel?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error,
    options,
    placeholder,
    containerClassName,
    hideLabel = false,
    id,
    required,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const hasError = Boolean(error);
  const describedBy = cn(hasError && errorId, helperText && !hasError && helperId);

  return (
    <div className={cn("flex w-full flex-col", containerClassName)}>
      <label
        htmlFor={selectId}
        className={cn(
          "text-small text-text mb-1.5 font-medium select-none",
          hideLabel && "sr-only"
        )}
      >
        {label}
        {required && (
          <span className="text-danger ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          required={required}
          disabled={disabled}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            "rounded-input bg-background text-text h-[48px] min-h-[48px] w-full appearance-none border pr-10 pl-3.5 text-base transition-colors",
            "focus-visible:ring-[3px] focus-visible:ring-offset-1 focus-visible:outline-none",
            hasError
              ? "border-danger focus-visible:border-danger focus-visible:ring-danger/40"
              : "border-border hover:border-muted/50 focus-visible:border-primary focus-visible:ring-primary/40",
            disabled && "bg-surface cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* Chevron Dropdown Icon */}
        <div className="text-muted pointer-events-none absolute right-3.5 flex items-center">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
});
