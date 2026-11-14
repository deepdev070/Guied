"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: (id: string) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  /**
   * If true, renders a native <details>/<summary> element for pure HTML/no-JS environments.
   */
  useDetails?: boolean;
}

export function AccordionIcon({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "text-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-200",
        isOpen && "text-primary rotate-45",
        className
      )}
      aria-hidden="true"
    >
      {/* 24px SVG with Plus/Minus geometry */}
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </span>
  );
}

export function AccordionItem({
  id,
  title,
  children,
  isOpen = false,
  onToggle,
  className,
  headerClassName,
  contentClassName,
  useDetails = false,
}: AccordionItemProps) {
  const contentId = `${id}-content`;
  const headerId = `${id}-header`;

  if (useDetails) {
    return (
      <details
        id={id}
        open={isOpen}
        className={cn(
          "group border-border open:border-primary/40 open:bg-surface/50 rounded-xl border bg-white transition-colors duration-150",
          className
        )}
      >
        <summary
          className={cn(
            "text-text flex w-full cursor-pointer list-none items-center justify-between gap-4 p-4 text-left font-semibold md:p-5",
            "focus-visible:ring-primary/40 rounded-xl focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:outline-none",
            "[&::-webkit-details-marker]:hidden",
            headerClassName
          )}
        >
          <span className="text-text text-base font-semibold md:text-lg">{title}</span>
          <span className="text-muted group-open:text-primary flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-200 group-open:rotate-45">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
        </summary>
        <div
          id={contentId}
          className={cn(
            "border-border/60 text-muted border-t px-4 pt-3 pb-4 text-sm leading-relaxed md:px-5 md:pb-5 md:text-base",
            contentClassName
          )}
        >
          {children}
        </div>
      </details>
    );
  }

  return (
    <div
      id={id}
      className={cn(
        "border-border rounded-xl border bg-white transition-colors duration-150",
        isOpen && "border-primary/40 bg-surface/40 shadow-xs",
        className
      )}
    >
      <h3>
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => onToggle?.(id)}
          className={cn(
            "text-text flex w-full items-center justify-between gap-4 p-4 text-left font-semibold transition-colors md:p-5",
            "hover:text-primary focus-visible:ring-primary/40 rounded-xl focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:outline-none",
            headerClassName
          )}
        >
          <span className="text-text text-base font-semibold md:text-lg">{title}</span>
          <AccordionIcon isOpen={isOpen} />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "border-border/60 text-muted border-t px-4 pt-3 pb-4 text-sm leading-relaxed md:px-5 md:pb-5 md:text-base",
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AccordionProps {
  children?: React.ReactNode;
  onlyOneOpen?: boolean;
  defaultOpenId?: string;
  className?: string;
  useDetails?: boolean;
}

export function Accordion({
  children,
  onlyOneOpen = true,
  defaultOpenId,
  className,
  useDetails = false,
}: AccordionProps) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => {
    return defaultOpenId ? new Set([defaultOpenId]) : new Set();
  });

  const handleToggle = React.useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(prev);
        const isCurrentlyOpen = next.has(id);

        if (onlyOneOpen) {
          next.clear();
          if (!isCurrentlyOpen) {
            next.add(id);
          }
        } else {
          if (isCurrentlyOpen) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }
        return next;
      });
    },
    [onlyOneOpen]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<AccordionItemProps>(child)) {
          return child;
        }

        const childId = child.props.id;
        const isOpen = child.props.isOpen ?? openIds.has(childId);

        return React.cloneElement(child, {
          isOpen,
          onToggle: handleToggle,
          useDetails: child.props.useDetails ?? useDetails,
        });
      })}
    </div>
  );
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: React.ReactNode;
  defaultOpen?: boolean;
}

export interface FaqListProps {
  items: FaqItem[];
  onlyOneOpen?: boolean;
  className?: string;
  itemClassName?: string;
  useDetails?: boolean;
}

export function FaqList({
  items,
  onlyOneOpen = true,
  className,
  itemClassName,
  useDetails = false,
}: FaqListProps) {
  const initialOpenId = items.find((i) => i.defaultOpen)?.id ?? undefined;

  return (
    <Accordion
      onlyOneOpen={onlyOneOpen}
      defaultOpenId={initialOpenId}
      className={className}
      useDetails={useDetails}
    >
      {items.map((item, index) => {
        const itemId = item.id || `faq-${index}`;
        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            title={item.question}
            className={itemClassName}
            useDetails={useDetails}
          >
            {typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
