import React, { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { SpecCard } from "@/components/ui/SpecCard";
import { GlossaryText } from "@/components/glossary/GlossaryText";
import type { DocumentSpec } from "@/types/content";

export type DocumentRequirementType = "required" | "optional" | "conditional";

export interface ChecklistItemProps {
  id?: string;
  name: string;
  description?: string;
  requirementType?: DocumentRequirementType;
  copiesHint?: string;
  specs?: DocumentSpec;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * ChecklistItem for citizen document preparation.
 * Features:
 * - 28px custom accessible checkbox (toggleable via Click or Space key)
 * - Document title and collapsible "What is this?" helper text
 * - Requirement badge (Required vs If applicable)
 * - "Original + 1 copy" hint chip
 * - Checked state with soft green background and strike-free readable styling
 */
export function ChecklistItem({
  id,
  name,
  description,
  requirementType = "required",
  copiesHint = "Original + 1 copy",
  specs,
  defaultChecked = false,
  checked: controlledChecked,
  onChange,
  className,
}: ChecklistItemProps) {
  const generatedId = useId();
  const itemId = id || generatedId;
  const helpId = `${itemId}-help`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const toggleChecked = () => {
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleChecked();
    }
  };

  const requirementBadges: Record<DocumentRequirementType, { label: string; className: string }> = {
    required: {
      label: "Mandatory",
      className: "border-danger/30 bg-danger-soft text-danger",
    },
    optional: {
      label: "Optional",
      className: "border-border bg-surface-alt text-muted",
    },
    conditional: {
      label: "If applicable",
      className: "border-accent/40 bg-accent-soft text-warning",
    },
  };

  const badge = requirementBadges[requirementType];

  return (
    <article
      className={cn(
        "rounded-card border p-4 transition-all duration-200 select-none sm:p-5",
        isChecked
          ? "border-success/40 bg-success-soft/30 shadow-soft-xs"
          : "border-border bg-background shadow-soft-xs hover:border-muted/40",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Large 28px Checkbox */}
        <div
          role="checkbox"
          id={itemId}
          tabIndex={0}
          aria-checked={isChecked}
          aria-label={`Mark ${name} as ready`}
          onClick={toggleChecked}
          onKeyDown={handleKeyDown}
          className={cn(
            "mt-0.5 flex h-7 min-h-[28px] w-7 min-w-[28px] shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-150",
            "focus-visible:ring-primary/40 focus-visible:ring-[3px] focus-visible:ring-offset-1 focus-visible:outline-none",
            isChecked
              ? "border-success bg-success shadow-soft-xs text-white"
              : "border-border hover:border-primary/60 bg-white"
          )}
        >
          {isChecked && <CheckIcon />}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              onClick={toggleChecked}
              className="text-text hover:text-primary cursor-pointer text-base leading-snug font-semibold transition-colors sm:text-lg"
            >
              <GlossaryText text={name} />
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {/* Requirement Badge */}
              <span
                className={cn(
                  "rounded-chip inline-flex items-center border px-2.5 py-0.5 text-xs font-bold",
                  badge.className
                )}
              >
                {badge.label}
              </span>

              {/* Original + Copy Hint Chip */}
              {copiesHint && (
                <span className="rounded-chip border-primary/20 bg-primary-soft text-primary inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold">
                  {copiesHint}
                </span>
              )}
            </div>
          </div>

          {/* Collapsible Help Details & Technical SpecCard */}
          {(description || specs) && (
            <div className="mt-2">
              <button
                type="button"
                aria-expanded={isHelpOpen}
                aria-controls={helpId}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHelpOpen(!isHelpOpen);
                }}
                className="text-primary hover:text-primary-hover inline-flex cursor-pointer items-center gap-1 text-xs font-semibold focus-visible:underline focus-visible:outline-none"
              >
                <span>
                  {isHelpOpen
                    ? "Hide details"
                    : specs
                      ? "View Photo / Technical Specifications"
                      : "What is this?"}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isHelpOpen && "rotate-180"
                  )}
                />
              </button>

              {isHelpOpen && (
                <div id={helpId} className="mt-2 space-y-3">
                  {description && (
                    <div className="rounded-input border-border bg-surface text-small text-muted border p-3 leading-relaxed">
                      <GlossaryText text={description} />
                    </div>
                  )}

                  {specs && <SpecCard spec={specs} documentName={name} />}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
