import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "md" | "lg";

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type ButtonAsButton = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: undefined;
  };

export type ButtonAsLink = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border border-transparent hover:bg-primary-hover active:bg-primary-hover/90 shadow-soft-sm",
  secondary:
    "bg-background text-text border border-border hover:bg-surface-alt active:bg-surface-alt/90 shadow-soft-xs",
  ghost:
    "bg-transparent text-text border border-transparent hover:bg-surface-alt active:bg-surface-alt/90",
  danger:
    "bg-danger text-white border border-transparent hover:bg-danger/90 active:bg-danger/95 shadow-soft-sm",
  link: "bg-transparent text-primary border border-transparent hover:text-primary-hover underline-offset-4 hover:underline p-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "min-h-[44px] h-[44px] px-4 py-2.5 text-base font-semibold rounded-input",
  lg: "min-h-[52px] h-[52px] px-6 py-3 text-lg font-semibold rounded-input",
};

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 shrink-0 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      ...rest
    } = props;

    const isDisabled = disabled || isLoading;

    const baseClasses = cn(
      "inline-flex items-center justify-center gap-2 select-none transition-colors",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 focus-visible:ring-offset-2",
      variantStyles[variant],
      variant !== "link" ? sizeStyles[size] : "min-h-[44px] inline-flex items-center",
      fullWidth ? "w-full" : "w-auto",
      isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    );

    const content = (
      <>
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </>
    );

    if ("href" in props && typeof props.href === "string") {
      const { href, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
      };

      if (isDisabled) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            role="link"
            aria-disabled="true"
            tabIndex={-1}
            className={baseClasses}
            {...anchorRest}
          >
            {content}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          {...anchorRest}
        >
          {content}
        </Link>
      );
    }

    const { type = "button", ...buttonRest } =
      rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        className={baseClasses}
        {...buttonRest}
      >
        {content}
      </button>
    );
  }
);
