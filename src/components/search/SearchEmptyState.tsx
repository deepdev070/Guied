import React from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { SearchableItem } from "@/lib/search";

export interface SearchEmptyStateProps {
  query?: string;
  popularTasks: SearchableItem[];
  onClear?: () => void;
}

export function SearchEmptyState({ query, popularTasks }: SearchEmptyStateProps) {
  return (
    <div className="space-y-8">
      {/* Friendly Empty Box */}
      <EmptyState
        title={query ? `No guides found for "${query}"` : "No guides match your selected filters"}
        description={
          query
            ? "We couldn't find an exact match. Check for spelling errors, try broader keywords (like 'licence', 'passport', or 'pan'), or try clearing category filters."
            : "Try resetting your category or state filter to see more government paperwork guides."
        }
        actionText="Clear All Filters"
        actionHref="/search"
        secondaryActionText="Browse Categories"
        secondaryActionHref="/#categories"
      />

      {/* Suggested Popular Tasks Section */}
      {popularTasks.length > 0 && (
        <section aria-labelledby="suggested-popular-heading">
          <div className="mb-4 flex items-center justify-between">
            <h3 id="suggested-popular-heading" className="text-h3 text-text font-bold">
              Popular Paperwork Guides
            </h3>
            <span className="text-muted text-xs">Frequently searched by citizens</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {popularTasks.map((task) => (
              <Link
                key={task.slug}
                href={`/${task.slug}`}
                className="group rounded-card border-border shadow-soft-sm hover:border-primary/40 hover:shadow-soft-md border bg-white p-4.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="neutral">{task.categoryName}</Badge>
                  <span className="text-muted text-xs">Govt Fee: {task.cost}</span>
                </div>
                <h4 className="text-text group-hover:text-primary mt-2 text-base font-semibold transition-colors">
                  {task.name}
                </h4>
                <p className="text-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                  {task.summary}
                </p>
                <div className="text-primary mt-3 flex items-center text-xs font-medium">
                  <span>View checklist & steps</span>
                  <svg
                    className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
