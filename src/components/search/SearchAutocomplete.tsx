"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import {
  getSearchSuggestions,
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  type AutocompleteSuggestion,
} from "@/lib/autocomplete";
import { Badge } from "@/components/ui/Badge";
import { Highlight } from "./Highlight";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export interface SearchAutocompleteProps {
  id?: string;
  placeholder?: string;
  initialQuery?: string;
  selectedState?: string;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  onSelect?: (query: string) => void;
  variant?: "header" | "hero";
}

export function SearchAutocomplete({
  id: propId,
  placeholder = "Search paperwork (e.g. Passport, Driving Licence, PAN)...",
  initialQuery = "",
  selectedState,
  autoFocus = false,
  className,
  inputClassName,
  onSelect,
  variant = "header",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const generatedId = useId();
  const id = propId || `search-autocomplete-${generatedId}`;
  const listboxId = `${id}-listbox`;

  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());

  // Derive suggestions synchronously using useMemo (no cascading renders)
  const suggestions = React.useMemo(() => {
    return query.trim().length >= 2 ? getSearchSuggestions(query) : [];
  }, [query]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showRecent = query.trim().length < 2 && recentSearches.length > 0;
  const showSuggestions = query.trim().length >= 2 && suggestions.length > 0;
  const isDropdownVisible = isOpen && (showRecent || showSuggestions);

  const totalOptions = showRecent
    ? recentSearches.length
    : showSuggestions
      ? suggestions.length
      : 0;

  const navigateToTask = (suggestion: AutocompleteSuggestion) => {
    saveRecentSearch(suggestion.name);
    setRecentSearches(getRecentSearches());
    setIsOpen(false);

    if (onSelect) {
      onSelect(suggestion.name);
    }

    const stateParam =
      selectedState && selectedState !== "all" && selectedState !== "national"
        ? `/${selectedState}`
        : "";
    router.push(`/${suggestion.slug}${stateParam}`);
  };

  const executeTextSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    saveRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
    setIsOpen(false);

    // Track search query event (Prompt 82)
    analytics.searchQuery(trimmed, suggestions.length, selectedState);

    if (onSelect) {
      onSelect(trimmed);
    }

    const params = new URLSearchParams();
    params.set("q", trimmed);
    if (selectedState && selectedState !== "all" && selectedState !== "national") {
      params.set("state", selectedState);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible && e.key === "ArrowDown") {
      setIsOpen(true);
      return;
    }

    if (!isDropdownVisible) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1 < totalOptions ? prev + 1 : 0));
        break;

      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0) {
          if (showSuggestions && suggestions[focusedIndex]) {
            navigateToTask(suggestions[focusedIndex]);
          } else if (showRecent && recentSearches[focusedIndex]) {
            const selectedRecent = recentSearches[focusedIndex];
            setQuery(selectedRecent);
            executeTextSearch(selectedRecent);
          }
        } else {
          executeTextSearch(query);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (focusedIndex >= 0 && showSuggestions && suggestions[focusedIndex]) {
      navigateToTask(suggestions[focusedIndex]);
    } else {
      executeTextSearch(query);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleFormSubmit} role="search" className="relative w-full">
        <label htmlFor={id} className="sr-only">
          Search government guides and paperwork
        </label>

        {/* Search Icon */}
        <div className="text-muted pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input with Combobox ARIA Pattern */}
        <input
          ref={inputRef}
          id={id}
          type="search"
          role="combobox"
          aria-expanded={isDropdownVisible}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={focusedIndex >= 0 ? `${id}-opt-${focusedIndex}` : undefined}
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocusedIndex(-1);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "rounded-input border-border bg-surface text-text hover:border-muted/50 focus-visible:border-primary focus-visible:ring-primary/40 h-[44px] w-full border pr-10 pl-10 text-sm transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-none",
            variant === "hero" && "h-[48px] border-0 bg-transparent pr-10 pl-11 text-base",
            inputClassName
          )}
        />

        {/* Clear (x) button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClearQuery}
            aria-label="Clear search input"
            className="rounded-chip text-muted hover:text-text absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center transition-colors"
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
      </form>

      {/* Autocomplete Dropdown Listbox */}
      {isDropdownVisible && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="rounded-card border-border shadow-soft-lg absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden border bg-white py-1 text-left"
        >
          {/* 1. Recent Searches View */}
          {showRecent && (
            <div>
              <div className="text-muted flex items-center justify-between px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                <span>Recent Searches</span>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>

              {recentSearches.map((item, idx) => (
                <div
                  key={item}
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={focusedIndex === idx}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3.5 py-2 text-sm transition-colors",
                    focusedIndex === idx
                      ? "bg-primary-soft text-primary font-medium"
                      : "text-text hover:bg-surface"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(item);
                    executeTextSearch(item);
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="text-muted h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(item);
                      setRecentSearches(getRecentSearches());
                    }}
                    aria-label={`Remove ${item} from recent searches`}
                    className="text-muted hover:text-danger rounded p-1"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2. Live Task Suggestions View */}
          {showSuggestions && (
            <div>
              <div className="text-muted px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                Guides & Checklists ({suggestions.length})
              </div>

              {suggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.slug}
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={focusedIndex === idx}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 px-3.5 py-2.5 text-left transition-colors",
                    focusedIndex === idx
                      ? "bg-primary-soft/70 border-primary border-l-3"
                      : "hover:bg-surface border-l-3 border-transparent"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    navigateToTask(suggestion);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text text-sm font-semibold">
                      <Highlight text={suggestion.name} query={query} />
                    </span>
                    <Badge variant="neutral">{suggestion.categoryName}</Badge>
                  </div>

                  <div className="text-muted flex items-center gap-3 text-xs">
                    <span>Govt fee: {suggestion.cost}</span>
                    <span>•</span>
                    <span>Time: {suggestion.estimatedTime}</span>
                    {suggestion.launchState && (
                      <>
                        <span>•</span>
                        <span className="text-accent font-medium">★ Gujarat verified</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* View all results footer */}
              <div
                className="border-border/70 bg-surface/40 text-primary hover:bg-primary-soft cursor-pointer border-t px-3.5 py-2 text-center text-xs font-medium transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeTextSearch(query);
                }}
              >
                Press Enter to view all results for &ldquo;{query}&rdquo; →
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
