import type { Metadata } from "next";
import { executeSearch, getPopularSearchSuggestions } from "@/lib/search";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { LeaderboardAd } from "@/components/ads/LeaderboardAd";
import { AD_PLACEMENTS } from "@/components/ads/placements";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    state?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const q = resolved.q?.trim();

  const title = q
    ? `Search: "${q}" — Guides & Checklists | ${siteConfig.name}`
    : `Search Government Paperwork Guides | ${siteConfig.name}`;

  return {
    title,
    description: `Find verified government document checklists, statutory fees, and step-by-step procedures across India and Gujarat.`,
    robots: {
      index: !q, // Only index the main directory search page, avoid indexing infinite query permutations
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const query = resolved.q?.trim() || "";
  const category = resolved.category?.trim() || "all";
  const state = resolved.state?.trim() || "all";

  const results = executeSearch({
    query,
    category,
    state,
  });

  const popularSuggestions = getPopularSearchSuggestions();

  return (
    <div className="bg-surface min-h-screen py-6 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Search", href: "/search" },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">Search Paperwork Guides</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
            Verified official procedures, document requirements, and statutory fees for Indian
            citizens.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8">
          <SearchFilters
            initialQuery={query}
            initialCategory={category}
            initialState={state}
            totalResults={results.length}
          />
        </div>

        {/* Results List or Empty State */}
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="space-y-4" role="feed" aria-label="Search results">
              {results.map((result) => (
                <SearchResultCard
                  key={result.item.slug}
                  result={result}
                  searchQuery={query}
                  selectedState={state}
                />
              ))}
            </div>
          ) : (
            <SearchEmptyState query={query} popularTasks={popularSuggestions} />
          )}
        </div>

        {/* Reserved Ad Slot with zero CLS (Prompt 86: SEARCH_RESULTS) */}
        <div className="mt-12 flex justify-center">
          <LeaderboardAd slotId={AD_PLACEMENTS.SEARCH_RESULTS.slotId} />
        </div>
      </div>
    </div>
  );
}
