import { STATES_SEED_DATA, type StateSeedData } from "../../prisma/data/states.ts";

export const USER_STATE_COOKIE_NAME = "user_state";
export const USER_STATE_STORAGE_KEY = "user_state";
export const DEFAULT_STATE_SLUG = "gujarat";

/**
 * Returns state metadata for a given slug or code (case-insensitive).
 */
export function getStateBySlugOrCode(slugOrCode?: string | null): StateSeedData | undefined {
  if (!slugOrCode) return undefined;
  const normalized = slugOrCode.toLowerCase().trim();
  return STATES_SEED_DATA.find((s) => s.slug === normalized || s.code.toLowerCase() === normalized);
}

/**
 * Helper to generate appropriate task URL based on selected state.
 * If a state is selected and task has that state (or generally available), points to /[task]/[state].
 */
export function getTaskUrl(
  taskSlug: string,
  stateSlug?: string | null,
  availableStates?: string[]
): string {
  if (!stateSlug) return `/${taskSlug}`;

  const normalized = stateSlug.toLowerCase().trim();
  if (normalized === "all" || normalized === "national" || normalized === "") {
    return `/${taskSlug}`;
  }

  // If availableStates is provided and non-empty, check if this state is explicitly supported
  if (availableStates && availableStates.length > 0) {
    const isSupported = availableStates.some(
      (s) => s.toLowerCase() === normalized || s.toUpperCase() === normalized.toUpperCase()
    );
    if (!isSupported) {
      // In Prompt 43, all state pairs exist; but if strictly filtered, fall back to national
      return `/${taskSlug}/${normalized}`;
    }
  }

  return `/${taskSlug}/${normalized}`;
}

/**
 * Client-side: Reads the current selected state slug from localStorage or document.cookie.
 */
export function getClientSelectedState(): string {
  if (typeof window === "undefined") return DEFAULT_STATE_SLUG;

  try {
    const fromStorage = localStorage.getItem(USER_STATE_STORAGE_KEY);
    if (fromStorage && getStateBySlugOrCode(fromStorage)) {
      return fromStorage;
    }

    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${USER_STATE_COOKIE_NAME}=`));
    if (match) {
      const val = decodeURIComponent(match.split("=")[1] || "");
      if (val && getStateBySlugOrCode(val)) {
        return val;
      }
    }
  } catch {
    // Return default on storage or cookie restrictions
  }

  return DEFAULT_STATE_SLUG;
}

/**
 * Client-side: Sets the selected state in both cookie (for server components) and localStorage.
 */
export function setClientSelectedState(slug: string): void {
  if (typeof window === "undefined") return;

  const valid = getStateBySlugOrCode(slug);
  const stateSlug = valid ? valid.slug : DEFAULT_STATE_SLUG;

  try {
    localStorage.setItem(USER_STATE_STORAGE_KEY, stateSlug);
    // 1-year persistent cookie with SameSite=Lax for SSR reading
    document.cookie = `${USER_STATE_COOKIE_NAME}=${encodeURIComponent(stateSlug)}; path=/; max-age=31536000; SameSite=Lax`;

    // Notify listeners via custom window event
    window.dispatchEvent(new CustomEvent("state-preference-changed", { detail: { stateSlug } }));
  } catch {
    // Ignore write errors in restricted sandbox
  }
}
