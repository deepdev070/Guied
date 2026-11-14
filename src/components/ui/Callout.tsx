import React from "react";
import { cn } from "@/lib/utils";

export type CalloutVariant = "tip" | "important" | "warning" | "success";

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function TipIcon({ className = "h-5 w-5" }: { className?: string }) {
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
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function ImportantIcon({ className = "h-5 w-5" }: { className?: string }) {
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

function WarningIcon({ className = "h-5 w-5" }: { className?: string }) {
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
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SuccessIcon({ className = "h-5 w-5" }: { className?: string }) {
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

const variantConfig: Record<
  CalloutVariant,
  {
    container: string;
    iconColor: string;
    titleColor: string;
    defaultIcon: React.ReactNode;
    role: string;
  }
> = {
  tip: {
    container: "bg-primary-soft border-primary/30",
    iconColor: "text-primary",
    titleColor: "text-primary",
    defaultIcon: <TipIcon />,
    role: "note",
  },
  important: {
    container: "bg-accent-soft border-accent/40",
    iconColor: "text-warning",
    titleColor: "text-warning",
    defaultIcon: <ImportantIcon />,
    role: "note",
  },
  warning: {
    container: "bg-danger-soft border-danger/30",
    iconColor: "text-danger",
    titleColor: "text-danger",
    defaultIcon: <WarningIcon />,
    role: "alert",
  },
  success: {
    container: "bg-success-soft border-success/30",
    iconColor: "text-success",
    titleColor: "text-success",
    defaultIcon: <SuccessIcon />,
    role: "status",
  },
};

/**
 * Callout component for highlighting critical guidance, advice, or warnings.
 * Adheres strictly to light theme design tokens and pairs color with bold titles and icons.
 */
export function Callout({
  variant = "tip",
  title,
  icon,
  children,
  className,
  ...props
}: CalloutProps) {
  const config = variantConfig[variant];

  return (
    <aside
      role={config.role}
      className={cn(
        "rounded-card my-4 flex items-start gap-3.5 border p-4 transition-colors sm:p-5",
        config.container,
        className
      )}
      {...props}
    >
      <div className={cn("mt-0.5 shrink-0", config.iconColor)} aria-hidden="true">
        {icon ?? config.defaultIcon}
      </div>

      <div className="flex-1">
        {title && (
          <h4 className={cn("mb-1 text-base font-bold tracking-tight", config.titleColor)}>
            {title}
          </h4>
        )}
        <div className="text-body text-text text-sm leading-relaxed sm:text-base">{children}</div>
      </div>
    </aside>
  );
}
