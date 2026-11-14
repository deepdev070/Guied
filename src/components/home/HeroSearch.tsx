"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { STATES_SEED_DATA } from "../../../prisma/data/states";
import { useUserState } from "@/context/StatePreferenceContext";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

export function HeroSearch() {
  const router = useRouter();
  const { selectedState, setSelectedState } = useUserState();

  // Gujarat prioritized at top, followed by the rest sorted alphabetically
  const sortedStates = React.useMemo(() => {
    const launch = STATES_SEED_DATA.filter((s) => s.launchState);
    const others = STATES_SEED_DATA.filter((s) => !s.launchState).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return [...launch, ...others];
  }, []);

  const handleChipClick = (suggestion: string) => {
    const params = new URLSearchParams();
    params.set("q", suggestion);
    if (selectedState && selectedState !== "all" && selectedState !== "national") {
      params.set("state", selectedState);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="rounded-card border-border bg-background shadow-soft-md flex flex-col gap-2.5 border p-2.5 sm:flex-row sm:items-center sm:gap-2">
        {/* Search Autocomplete Field */}
        <div className="flex-1">
          <SearchAutocomplete
            id="hero-search-input"
            variant="hero"
            selectedState={selectedState}
            placeholder="Search service e.g. Passport, Driving Licence, PAN..."
          />
        </div>

        {/* Divider on Desktop */}
        <div className="border-border hidden h-8 w-px border-l sm:block" aria-hidden="true" />

        {/* State Selector Dropdown */}
        <div className="relative min-w-[160px] sm:w-48">
          <label htmlFor="hero-state-select" className="sr-only">
            Select State or Union Territory
          </label>
          <div className="relative flex items-center">
            <div className="text-muted pointer-events-none absolute left-3 flex items-center">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <select
              id="hero-state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="rounded-input text-text bg-surface-alt/50 hover:bg-surface-alt focus-visible:border-primary focus-visible:ring-primary/40 h-[48px] w-full appearance-none border-0 pr-8 pl-9 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {sortedStates.map((state) => (
                <option key={state.slug} value={state.slug}>
                  {state.name}
                  {state.launchState ? " ★ (Launch State)" : ""}
                </option>
              ))}
            </select>
            <div className="text-muted pointer-events-none absolute right-2.5 flex items-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Search Button */}
        <Button
          type="button"
          onClick={() => {
            const inputEl = document.getElementById("hero-search-input") as HTMLInputElement | null;
            const queryVal = inputEl?.value?.trim() || "";
            const params = new URLSearchParams();
            if (queryVal) params.set("q", queryVal);
            if (selectedState && selectedState !== "all" && selectedState !== "national") {
              params.set("state", selectedState);
            }
            router.push(params.toString() ? `/search?${params.toString()}` : "/search");
          }}
          variant="primary"
          size="md"
          className="h-[48px] shrink-0 sm:w-auto"
          aria-label="Submit search"
        >
          <span>Find Guide</span>
        </Button>
      </div>

      {/* Example Chips */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="text-muted text-xs font-medium">Popular:</span>
        <Chip
          size="sm"
          onClick={() => handleChipClick("Passport renewal")}
          className="hover:border-primary hover:text-primary cursor-pointer transition-colors"
        >
          Passport renewal
        </Chip>
        <Chip
          size="sm"
          onClick={() => handleChipClick("Driving licence")}
          className="hover:border-primary hover:text-primary cursor-pointer transition-colors"
        >
          Driving licence
        </Chip>
        <Chip
          size="sm"
          onClick={() => handleChipClick("PAN card")}
          className="hover:border-primary hover:text-primary cursor-pointer transition-colors"
        >
          PAN card
        </Chip>
      </div>
    </div>
  );
}
