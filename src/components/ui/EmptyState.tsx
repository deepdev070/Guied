import * as React from "react";
import { Button } from "@/components/ui/Button";
import { EmptyIllustration } from "@/components/illustrations";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  icon?: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  illustration,
  icon,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  secondaryActionHref,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border-border shadow-soft-sm flex flex-col items-center justify-center border bg-white px-6 py-12 text-center sm:px-12 sm:py-16",
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6 max-w-[200px]">{illustration}</div>
      ) : icon ? (
        <div className="bg-surface-alt text-primary mb-5 flex h-16 w-16 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : (
        <div className="mb-6 max-w-[200px]">
          <EmptyIllustration />
        </div>
      )}

      {/* Title & Description */}
      <h3 className="text-h3 text-text mb-2 max-w-md font-bold">{title}</h3>
      <p className="text-body text-muted mb-6 max-w-md leading-relaxed">{description}</p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText &&
          (actionHref ? (
            <Button href={actionHref} variant="primary" size="md">
              {actionText}
            </Button>
          ) : (
            <Button onClick={onAction} variant="primary" size="md">
              {actionText}
            </Button>
          ))}

        {secondaryActionText &&
          (secondaryActionHref ? (
            <Button href={secondaryActionHref} variant="secondary" size="md">
              {secondaryActionText}
            </Button>
          ) : (
            <Button onClick={onSecondaryAction} variant="secondary" size="md">
              {secondaryActionText}
            </Button>
          ))}
      </div>
    </div>
  );
}
