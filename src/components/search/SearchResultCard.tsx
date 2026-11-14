import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Highlight } from "./Highlight";
import type { SearchResult } from "@/lib/search";

export interface SearchResultCardProps {
  result: SearchResult;
  searchQuery?: string;
  selectedState?: string;
}

export function SearchResultCard({ result, searchQuery, selectedState }: SearchResultCardProps) {
  const { item, matchedField, matchedSnippet } = result;

  // Build target link based on state selection
  const targetHref =
    selectedState && selectedState !== "all" && selectedState !== "national"
      ? `/${item.slug}/${selectedState}`
      : `/${item.slug}`;

  return (
    <article className="group rounded-card border-border shadow-soft-sm hover:border-primary/40 hover:shadow-soft-md border bg-white p-5 transition-all duration-200">
      {/* Top Meta: Category & State */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{item.categoryName}</Badge>
          {item.launchState && <Badge variant="new">★ Gujarat verified</Badge>}
        </div>
        <Badge variant="difficulty" difficulty={item.difficulty} />
      </div>

      {/* Title */}
      <h2 className="text-h3 text-text group-hover:text-primary font-bold transition-colors">
        <Link href={targetHref} className="focus-visible:underline focus-visible:outline-none">
          <Highlight text={item.name} query={searchQuery} />
        </Link>
      </h2>

      {/* Summary */}
      <p className="text-muted mt-2 text-sm leading-relaxed">
        <Highlight text={item.summary} query={searchQuery} />
      </p>

      {/* Matched Document or Keyword snippet */}
      {matchedField === "documentNames" && matchedSnippet && (
        <div className="border-primary/20 bg-primary-soft/40 text-primary mt-3 rounded-lg border px-3 py-2 text-xs">
          <span className="font-semibold">Matching document required: </span>
          <Highlight text={matchedSnippet} query={searchQuery} />
        </div>
      )}

      {/* Bottom Metrics Bar */}
      <div className="border-border/60 text-muted mt-4 flex flex-wrap items-center justify-between border-t pt-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg
              className="text-muted/80 h-4 w-4"
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
            <span>{item.estimatedTime}</span>
          </div>
          <div className="text-text flex items-center gap-1.5 font-medium">
            <span>Govt Fee: {item.cost}</span>
          </div>
        </div>

        <Link
          href={targetHref}
          className="text-primary hover:text-primary-hover inline-flex items-center font-medium focus-visible:underline focus-visible:outline-none"
        >
          <span>View checklist</span>
          <svg
            className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
