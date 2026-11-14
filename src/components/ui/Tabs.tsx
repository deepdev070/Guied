"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
  ariaLabel?: string;
  variant?: "underline" | "pill";
}

export function Tabs({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  onChange,
  className,
  listClassName,
  panelClassName,
  ariaLabel = "Guide sections",
  variant = "underline",
}: TabsProps) {
  const [internalActiveId, setInternalActiveId] = React.useState<string>(
    () => defaultActiveId || (items[0]?.id ?? "")
  );

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;
  const tabListRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = React.useCallback(
    (id: string) => {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
      onChange?.(id);
    },
    [controlledActiveId, onChange]
  );

  // Keyboard navigation according to WAI-ARIA tabs pattern
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledItems = items.filter((item) => !item.disabled);
    const enabledIndex = enabledItems.findIndex((item) => item.id === items[currentIndex]?.id);

    let nextIndex = -1;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (enabledIndex + 1) % enabledItems.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (enabledIndex - 1 + enabledItems.length) % enabledItems.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = enabledItems.length - 1;
    }

    if (nextIndex >= 0) {
      const nextItem = enabledItems[nextIndex];
      if (nextItem) {
        handleSelect(nextItem.id);
        const nextButton = tabListRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-id="${nextItem.id}"]`
        );
        nextButton?.focus();
      }
    }
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div className={cn("w-full", className)}>
      {/* Scrollable Tablist with snap for mobile */}
      <div className="border-border relative border-b">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label={ariaLabel}
          className={cn(
            "flex w-full snap-x snap-mandatory scrollbar-none items-center gap-2 overflow-x-auto py-1 text-sm md:text-base",
            listClassName
          )}
        >
          {items.map((item, index) => {
            const isSelected = item.id === activeId;
            const tabId = `tab-${item.id}`;
            const panelId = `panel-${item.id}`;

            if (variant === "pill") {
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={tabId}
                  data-tab-id={item.id}
                  aria-selected={isSelected}
                  aria-controls={panelId}
                  tabIndex={isSelected ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "flex min-h-[44px] shrink-0 snap-start items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all duration-150",
                    "focus-visible:ring-primary/40 focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:outline-none",
                    item.disabled && "cursor-not-allowed opacity-40",
                    isSelected
                      ? "bg-primary shadow-soft-sm font-semibold text-white"
                      : "bg-surface text-muted hover:bg-surface-alt hover:text-text"
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                  {item.badge && <span className="shrink-0">{item.badge}</span>}
                </button>
              );
            }

            // Default: Underline variant
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={tabId}
                data-tab-id={item.id}
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                disabled={item.disabled}
                onClick={() => handleSelect(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "relative -mb-[1px] flex min-h-[44px] shrink-0 snap-start items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors duration-150",
                  "focus-visible:ring-primary/40 rounded-t-lg focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:outline-none",
                  item.disabled && "cursor-not-allowed opacity-40",
                  isSelected
                    ? "border-primary text-primary font-semibold"
                    : "text-muted hover:border-border hover:text-text border-transparent"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && <span className="shrink-0">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Panel if items provide content */}
      {activeItem && activeItem.content && (
        <div
          role="tabpanel"
          id={`panel-${activeItem.id}`}
          aria-labelledby={`tab-${activeItem.id}`}
          tabIndex={0}
          className={cn(
            "focus-visible:ring-primary/40 rounded-xl pt-6 focus-visible:ring-3 focus-visible:outline-none",
            panelClassName
          )}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
