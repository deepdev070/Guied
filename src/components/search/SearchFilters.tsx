"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES_SEED_DATA } from "../../../prisma/data/categories";
import { STATES_SEED_DATA } from "../../../prisma/data/states";
import { Button } from "@/components/ui/Button";

export interface SearchFiltersProps {
  initialQuery?: string;
  initialCategory?: string;
  initialState?: string;
  totalResults: number;
}

export function SearchFilters({
  initialQuery = "",
  initialCategory = "all",
  initialState = "all",
  totalResults,
}: SearchFiltersProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [state, setState] = useState(initialState);

  // Gujarat prioritized at top, followed by other states sorted alphabetically
  const sortedStates = React.useMemo(() => {
    const launch = STATES_SEED_DATA.filter((s) => s.launchState);
    const others = STATES_SEED_DATA.filter((s) => !s.launchState).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return [...launch, ...others];
  }, []);

  const hasActiveFilters =
    Boolean(query.trim()) || (category && category !== "all") || (state && state !== "all");

  const applyFilters = (newQ: string, newCat: string, newSt: string) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newCat && newCat !== "all") params.set("category", newCat);
    if (newSt && newSt !== "all") params.set("state", newSt);

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(query, category, state);
  };

  const handleClear = () => {
    setQuery("");
    setCategory("all");
    setState("all");
    router.push("/search");
  };

  return (
    <div className="rounded-card border-border shadow-soft-sm border bg-white p-4 sm:p-5">
      <form onSubmit={handleSubmit} role="search" aria-label="Search filter form">
        {/* Main Search Bar */}
        <div className="relative flex items-center">
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
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides e.g. Driving licence, Passport, PAN card..."
            aria-label="Search paperwork guides"
            className="rounded-input text-text placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-primary/40 border-border bg-surface-alt/40 h-[48px] w-full border pr-10 pl-11 text-base transition-colors focus-visible:ring-2 focus-visible:outline-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search input"
              className="rounded-chip text-muted hover:text-text absolute right-3 flex h-7 w-7 items-center justify-center transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Filter Controls Row */}
        <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12">
          {/* Category Dropdown */}
          <div className="md:col-span-5">
            <label htmlFor="search-category-select" className="sr-only">
              Filter by Category
            </label>
            <select
              id="search-category-select"
              value={category}
              onChange={(e) => {
                const nextCat = e.target.value;
                setCategory(nextCat);
                applyFilters(query, nextCat, state);
              }}
              className="rounded-input text-text bg-surface-alt/50 hover:bg-surface-alt focus-visible:border-primary focus-visible:ring-primary/40 border-border h-[44px] w-full border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES_SEED_DATA.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="md:col-span-4">
            <label htmlFor="search-state-select" className="sr-only">
              Filter by State
            </label>
            <select
              id="search-state-select"
              value={state}
              onChange={(e) => {
                const nextSt = e.target.value;
                setState(nextSt);
                applyFilters(query, category, nextSt);
              }}
              className="rounded-input text-text bg-surface-alt/50 hover:bg-surface-alt focus-visible:border-primary focus-visible:ring-primary/40 border-border h-[44px] w-full border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="all">All India / All States</option>
              {sortedStates.map((st) => (
                <option key={st.slug} value={st.slug}>
                  {st.name}
                  {st.launchState ? " ★ (Launch State)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:col-span-3">
            <Button type="submit" variant="primary" size="md" className="h-[44px] flex-1">
              Search
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleClear}
                className="text-muted hover:text-text h-[44px] shrink-0 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Results Count Strip */}
      <div className="border-border/50 text-muted mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
        <span>
          {initialQuery ? (
            <>
              Found <strong className="text-text font-semibold">{totalResults}</strong> guides for
              &ldquo;{initialQuery}&rdquo;
            </>
          ) : (
            <>
              Showing <strong className="text-text font-semibold">{totalResults}</strong> guides
            </>
          )}
        </span>
        {(category !== "all" || state !== "all") && (
          <span className="text-primary font-medium">Filters active</span>
        )}
      </div>
    </div>
  );
}
