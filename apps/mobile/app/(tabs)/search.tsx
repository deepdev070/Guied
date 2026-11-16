import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { SearchField, Card, Badge, Skeleton, Callout } from "../../components/ui";
import { fetchSearchGuides, type MobileSearchResult } from "../../lib/mobile-search";

const QUICK_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "vehicles", label: "Vehicles" },
  { id: "identity", label: "Identity" },
  { id: "money-and-tax", label: "Taxes" },
  { id: "health-and-welfare", label: "Welfare" },
];

const SUGGESTED_SEARCHES = [
  "Learner Licence",
  "Passport Renewal",
  "Permanent DL",
  "PAN Card Form 49A",
  "Aadhaar Update",
  "Ration Card",
];

export default function MobileSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState(params.q || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [results, setResults] = useState<MobileSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "driving licence",
    "passport renewal",
  ]);

  // AbortController ref to cancel stale requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchTerm: string, category: string) => {
    // Cancel previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      setIsOfflineMode(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      const { results: searchResults, isOffline } = await fetchSearchGuides({
        query: searchTerm,
        category,
        signal: controller.signal,
      });

      setResults(searchResults);
      setIsOfflineMode(isOffline);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Stale request cancelled; ignore
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search on input change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(trimmed, selectedCategory);
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, selectedCategory, performSearch]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setIsLoading(false);
      setIsOfflineMode(false);
    }
  };

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    performSearch(term, selectedCategory);
  };

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) =>
      [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5)
    );
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const hasSearch = Boolean(query.trim());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Accessible Search Field */}
      <SearchField
        label="Search Citizen Paperwork Guides"
        value={query}
        onChangeText={handleQueryChange}
        onClear={() => {
          setQuery("");
          setResults([]);
          setIsLoading(false);
          setIsOfflineMode(false);
        }}
        placeholder="Type guide name, form or keyword..."
        helperText="Instant search across national and state procedures"
      />

      {/* 2. Quick Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterRow}
      >
        {QUICK_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Offline Mode Indicator Banner */}
      {isOfflineMode ? (
        <Callout variant="warning" title="Offline Mode">
          Displaying downloaded offline guides. Network connection is unavailable.
        </Callout>
      ) : null}

      {/* 4. Loading State Skeleton */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 12 }} />
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} height={100} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : hasSearch ? (
        /* 5. Results List or Empty State */
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? "Result" : "Results"} Found
            </Text>
          </View>

          {results.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Matching Guides Found</Text>
              <Text style={styles.emptyText}>
                No official procedure matched &quot;{query}&quot;. Try checking for spelling or
                searching for the department name (e.g., Parivahan, UIDAI, Income Tax).
              </Text>

              <View style={styles.emptySuggestions}>
                <Text style={styles.emptySuggestionsTitle}>Try searching for:</Text>
                {SUGGESTED_SEARCHES.slice(0, 3).map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.suggestionPill}
                    onPress={() => handleSelectSuggestion(term)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.suggestionPillText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ) : (
            results.map((res) => (
              <Card
                key={res.task.slug}
                onPress={() => {
                  saveRecentSearch(query);
                  router.push({
                    pathname: "/task/[slug]",
                    params: { slug: res.task.slug },
                  });
                }}
                style={styles.resultCard}
                accessibilityLabel={`${res.task.name}, ${res.task.cost}`}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.resultCategory}>{res.task.categoryName}</Text>
                  <Badge
                    label={res.task.difficulty.toUpperCase()}
                    variant={res.task.difficulty === "easy" ? "success" : "warning"}
                  />
                </View>

                <Text style={styles.resultName}>{res.task.name}</Text>
                <Text style={styles.resultSummary} numberOfLines={2}>
                  {res.task.summary}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.metaText}>💰 {res.task.cost}</Text>
                  <Text style={styles.metaText}>⏱ {res.task.estimatedTime}</Text>
                  <Text style={styles.arrowIcon}>➔</Text>
                </View>
              </Card>
            ))
          )}
        </View>
      ) : (
        /* 6. Recent Searches and Suggestions (When search input is empty) */
        <View style={styles.defaultContent}>
          {recentSearches.length > 0 ? (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Recent Searches</Text>
                <TouchableOpacity
                  onPress={clearRecentSearches}
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent searches"
                >
                  <Text style={styles.clearRecentText}>Clear</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentList}>
                {recentSearches.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.recentItem}
                    onPress={() => handleSelectSuggestion(term)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.recentIcon}>🕒</Text>
                    <Text style={styles.recentText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionHeader}>Common Citizen Searches</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTED_SEARCHES.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.suggestionTag}
                  onPress={() => handleSelectSuggestion(term)}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionTagText}>🔍 {term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  filterScrollView: {
    marginVertical: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDark,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  loadingBox: {
    marginTop: spacing.md,
  },
  resultsContainer: {
    marginTop: spacing.sm,
  },
  resultsHeader: {
    marginBottom: spacing.md,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  resultCategory: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
  },
  resultName: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  resultSummary: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  arrowIcon: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  emptySuggestions: {
    width: "100%",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  emptySuggestionsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 8,
  },
  suggestionPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginVertical: 4,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  suggestionPillText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  defaultContent: {
    marginTop: spacing.md,
  },
  recentSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  clearRecentText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "600",
  },
  recentList: {
    gap: 4,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    minHeight: layout.minTouchTarget,
  },
  recentIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  recentText: {
    fontSize: 15,
    color: colors.text,
  },
  suggestionsSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  suggestionTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  suggestionTagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
  },
});
