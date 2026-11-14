"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { STATES_SEED_DATA, type StateSeedData } from "../../../prisma/data/states";
import { useUserState } from "@/context/StatePreferenceContext";
import { cn } from "@/lib/utils";

export interface StateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectState?: (stateSlug: string) => void;
}

export function StateSelectModal({ isOpen, onClose, onSelectState }: StateSelectModalProps) {
  const { selectedState, setSelectedState } = useUserState();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Search filter
  const filteredStates = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return STATES_SEED_DATA;

    return STATES_SEED_DATA.filter((s) => {
      const matchName = s.name.toLowerCase().includes(term);
      const matchNative = s.nativeName ? s.nativeName.toLowerCase().includes(term) : false;
      const matchCode = s.code.toLowerCase().includes(term);
      return matchName || matchNative || matchCode;
    });
  }, [searchTerm]);

  // Gujarat prioritized first, then other states
  const { featuredState, otherStates } = useMemo(() => {
    const featured = filteredStates.find((s) => s.launchState);
    const others = filteredStates
      .filter((s) => !s.launchState)
      .sort((a, b) => a.name.localeCompare(b.name));
    return { featuredState: featured, otherStates: others };
  }, [filteredStates]);

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSelect = (state: StateSeedData) => {
    setSelectedState(state.slug);
    setSearchTerm("");
    onSelectState?.(state.slug);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="state-select-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="rounded-card border-border bg-background shadow-soft-xl relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden border">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 id="state-select-title" className="text-h3 text-text font-bold">
              Select your state
            </h2>
            <p className="text-small text-muted mt-0.5">
              Government paperwork and fees vary by state and union territory.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close state selector dialog"
            className="rounded-input text-muted hover:text-text hover:bg-surface-alt focus-visible:ring-primary -mr-1 flex h-9 w-9 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search as you type input */}
        <div className="border-border border-b p-4">
          <div className="relative flex items-center">
            <div className="text-muted pointer-events-none absolute left-3.5 flex items-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type state or UT name, e.g. Gujarat, Delhi, GJ..."
              aria-label="Search Indian states and union territories"
              className="rounded-input bg-surface-alt/50 text-text placeholder:text-muted/70 border-border focus-visible:border-primary focus-visible:bg-background focus-visible:ring-primary/40 h-[44px] w-full border pr-9 pl-10 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search input"
                className="text-muted hover:text-text absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-full"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>

        {/* State list */}
        <div
          className="flex-1 overflow-y-auto p-4"
          role="listbox"
          aria-label="States and union territories"
        >
          {/* Featured / Launch State (Gujarat Auto-suggest) */}
          {featuredState && (
            <div className="mb-4">
              <div className="text-muted mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
                Launch State (Full Checklist Support)
              </div>
              <button
                type="button"
                role="option"
                aria-selected={selectedState === featuredState.slug}
                onClick={() => handleSelect(featuredState)}
                className={cn(
                  "rounded-card flex w-full items-center justify-between border p-3.5 text-left transition-all",
                  selectedState === featuredState.slug
                    ? "border-primary bg-primary-soft/50 ring-primary ring-1"
                    : "border-accent/40 bg-accent-soft/30 hover:border-accent hover:bg-accent-soft/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-text text-sm font-bold">{featuredState.name}</span>
                      <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                        LAUNCH STATE
                      </span>
                    </div>
                    {featuredState.nativeName && (
                      <span className="text-muted text-xs font-normal">
                        {featuredState.nativeName} ({featuredState.code})
                      </span>
                    )}
                  </div>
                </div>
                {selectedState === featuredState.slug && (
                  <span className="text-primary text-xs font-bold">Selected ✓</span>
                )}
              </button>
            </div>
          )}

          {/* Other States and UTs */}
          <div>
            <div className="text-muted mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
              All States & Union Territories ({otherStates.length})
            </div>
            {otherStates.length === 0 && !featuredState ? (
              <div className="text-muted py-8 text-center text-sm">
                No state found matching &ldquo;{searchTerm}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {otherStates.map((state) => {
                  const isSelected = selectedState === state.slug;
                  return (
                    <button
                      key={state.slug}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(state)}
                      className={cn(
                        "rounded-input flex items-center justify-between border px-3 py-2.5 text-left text-xs transition-colors",
                        isSelected
                          ? "border-primary bg-primary-soft/60 text-primary font-semibold"
                          : "border-border/60 bg-background text-text hover:border-border hover:bg-surface-alt"
                      )}
                    >
                      <div className="flex flex-col truncate">
                        <span className="truncate font-medium">{state.name}</span>
                        {state.nativeName && (
                          <span className="text-muted truncate text-[11px] font-normal">
                            {state.nativeName} ({state.code})
                          </span>
                        )}
                      </div>
                      {isSelected && <span className="text-primary shrink-0 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-border bg-surface-alt/50 text-muted flex items-center justify-between border-t px-5 py-3 text-xs">
          <span>Remembers your selection across guides</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-text hover:text-primary font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
