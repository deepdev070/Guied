import Fuse from "fuse.js";
import { SEARCH_CATALOG, type SearchCatalogEntry } from "../data/search-catalog.ts";

export interface AutocompleteSuggestion {
  slug: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  cost: string;
  estimatedTime: string;
  matchedKeyword?: string;
  launchState?: boolean;
}

const fuseAutocomplete = new Fuse<SearchCatalogEntry>(SEARCH_CATALOG, {
  keys: [
    { name: "name", weight: 0.4 },
    { name: "keywords", weight: 0.35 },
    { name: "title", weight: 0.15 },
    { name: "categoryName", weight: 0.1 },
  ],
  threshold: 0.4, // Tolerates typos like "licens", "renewel", "adhaar", "tatkal"
  ignoreLocation: true,
  minMatchCharLength: 2,
});

/**
 * Returns instant autocomplete suggestions for query (minimum 2 characters).
 */
export function getSearchSuggestions(query: string, maxResults = 5): AutocompleteSuggestion[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const results = fuseAutocomplete.search(trimmed);
  return results.slice(0, maxResults).map((r) => {
    let matchedKeyword: string | undefined;
    if (r.matches) {
      const kwMatch = r.matches.find((m) => m.key === "keywords");
      if (kwMatch && kwMatch.value) {
        matchedKeyword = String(kwMatch.value);
      }
    }

    return {
      slug: r.item.slug,
      name: r.item.name,
      categoryName: r.item.categoryName,
      categorySlug: r.item.categorySlug,
      cost: r.item.cost,
      estimatedTime: r.item.estimatedTime,
      matchedKeyword,
      launchState: r.item.launchState,
    };
  });
}

const RECENT_SEARCHES_KEY = "recent_paperwork_searches";
const MAX_RECENT_SEARCHES = 5;

/**
 * Retrieves stored recent searches from localStorage.
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new search query to recent searches, keeping max 5 unique items.
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;

  try {
    const existing = getRecentSearches().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...existing].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Graceful fallback for private browsing quotas
  }
}

/**
 * Removes a single search query from recent searches.
 */
export function removeRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches().filter(
      (item) => item.toLowerCase() !== query.trim().toLowerCase()
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(existing));
  } catch {
    // Ignore error
  }
}

/**
 * Clears all recent searches.
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore error
  }
}
