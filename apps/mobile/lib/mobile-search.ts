/**
 * Mobile Search Service
 * Connects to Public API v1 /api/v1/search with AbortController cancellation,
 * input debouncing support, and seamless offline catalog fallback.
 */

export interface MobileSearchResultItem {
  slug: string;
  name: string;
  title: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  cost: string;
}

export interface MobileSearchResult {
  task: MobileSearchResultItem;
  score?: number;
  matchedField?: string;
  matchedSnippet?: string;
}

// Built-in offline fallback catalog
const OFFLINE_CATALOG: MobileSearchResultItem[] = [
  {
    slug: "driving-licence-learner",
    name: "Learner Driving Licence (LLR)",
    title: "Application for Learner Driving Permit (Form 2)",
    summary:
      "Step-by-step procedure to apply for an Indian learner driving licence online via Sarathi Parivahan.",
    categorySlug: "vehicles",
    categoryName: "Vehicles & Driving",
    difficulty: "easy",
    estimatedTime: "1–3 days",
    cost: "₹150 – ₹200",
  },
  {
    slug: "driving-licence-new",
    name: "Permanent Driving Licence (DL)",
    title: "Application for Permanent Driving Licence & RTO Test (Form 4)",
    summary:
      "Complete guide for slot booking, biometric appointment, and automated driving test at RTO.",
    categorySlug: "vehicles",
    categoryName: "Vehicles & Driving",
    difficulty: "medium",
    estimatedTime: "15–30 days",
    cost: "₹200 – ₹1,000",
  },
  {
    slug: "passport-renewal",
    name: "Passport Re-issue & Renewal",
    title: "Passport Renewal & Re-issue Guide (Normal & Tatkaal)",
    summary:
      "Official process to renew an expired Indian passport with Police Verification and PSK appointment.",
    categorySlug: "identity",
    categoryName: "Identity & Passports",
    difficulty: "medium",
    estimatedTime: "7–21 days",
    cost: "₹1,500 – ₹3,500",
  },
  {
    slug: "pan-card-new",
    name: "New PAN Card (Form 49A)",
    title: "Application for Permanent Account Number (PAN)",
    summary: "Instant e-PAN via Aadhaar or physical card application through NSDL/UTIITSL.",
    categorySlug: "identity",
    categoryName: "Identity & Passports",
    difficulty: "easy",
    estimatedTime: "10–15 days",
    cost: "₹107 – ₹1,017",
  },
  {
    slug: "aadhaar-update",
    name: "Aadhaar Card Demographic & Mobile Update",
    title: "Update Name, Address or Mobile on Aadhaar",
    summary:
      "Online address change on myAadhaar portal and biometric updates at enrolment centres.",
    categorySlug: "identity",
    categoryName: "Identity & Passports",
    difficulty: "easy",
    estimatedTime: "5–15 days",
    cost: "₹50",
  },
  {
    slug: "ration-card-new",
    name: "New Ration Card Application",
    title: "NFSA / State Food & Civil Supplies Ration Card",
    summary:
      "Application for BPL/APL ration card through state ePDS portal and Talati verification.",
    categorySlug: "health-and-welfare",
    categoryName: "Health & Welfare",
    difficulty: "medium",
    estimatedTime: "15–30 days",
    cost: "₹20 – ₹50",
  },
];

/**
 * Searches the offline catalog using simple token matching
 */
export function searchOfflineCatalog(query: string, category?: string): MobileSearchResult[] {
  const q = query.trim().toLowerCase();
  let items = OFFLINE_CATALOG;

  if (category && category !== "all") {
    items = items.filter((i) => i.categorySlug === category);
  }

  if (!q) {
    return items.map((task) => ({ task }));
  }

  const tokens = q.split(/\s+/).filter(Boolean);

  const matched = items.filter((item) => {
    const haystack =
      `${item.name} ${item.title} ${item.summary} ${item.categoryName} ${item.slug}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });

  return matched.map((task) => ({
    task,
    matchedField: "name",
  }));
}

export interface FetchSearchOptions {
  query: string;
  category?: string;
  state?: string;
  baseUrl?: string;
  signal?: AbortSignal;
}

/**
 * Executes API search with cancellation support and graceful offline fallback
 */
export async function fetchSearchGuides({
  query,
  category,
  state,
  baseUrl = "http://localhost:3000",
  signal,
}: FetchSearchOptions): Promise<{
  results: MobileSearchResult[];
  isOffline: boolean;
}> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      results: searchOfflineCatalog("", category),
      isOffline: false,
    };
  }

  const params = new URLSearchParams({ q: trimmed });
  if (category && category !== "all") params.set("category", category);
  if (state && state !== "all") params.set("state", state);

  try {
    const url = `${baseUrl}/api/v1/search?${params.toString()}`;
    const res = await fetch(url, { signal });

    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }

    const json = (await res.json()) as { success?: boolean; data?: MobileSearchResult[] };
    if (json.success && Array.isArray(json.data)) {
      return {
        results: json.data,
        isOffline: false,
      };
    }

    // Fallback to offline catalog if response format is unexpected
    return {
      results: searchOfflineCatalog(trimmed, category),
      isOffline: true,
    };
  } catch (err: unknown) {
    // If request was explicitly aborted, re-throw to allow component to ignore
    if (err instanceof Error && err.name === "AbortError") {
      throw err;
    }

    // Network error or server unavailable -> graceful offline fallback
    return {
      results: searchOfflineCatalog(trimmed, category),
      isOffline: true,
    };
  }
}
