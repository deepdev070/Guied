/**
 * Single source of truth for cookie and privacy consent (Prompt 88).
 * DPDP Act 2023 & GDPR compliant privacy management.
 */

export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
  advertising: boolean;
  status: "accepted_all" | "rejected_non_essential" | "custom";
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = "civic_consent_preferences_v1";
export const CONSENT_COOKIE_KEY = "civic_consent";

export const DEFAULT_CONSENT: ConsentPreferences = {
  essential: true,
  analytics: false,
  advertising: false,
  status: "rejected_non_essential",
  updatedAt: new Date(0).toISOString(),
};

/**
 * Reads stored consent preferences from localStorage.
 * Returns null if the user has not yet made an explicit choice.
 */
export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;

    if (parsed && typeof parsed === "object" && parsed.status) {
      return {
        essential: true,
        analytics: Boolean(parsed.analytics),
        advertising: Boolean(parsed.advertising),
        status: parsed.status,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch {
    // LocalStorage access may fail in private mode
  }

  return null;
}

/**
 * Persists user consent preferences in localStorage and a 1-year first-party cookie.
 */
export function saveConsent(
  preferences: Omit<ConsentPreferences, "essential" | "updatedAt">
): ConsentPreferences {
  const full: ConsentPreferences = {
    essential: true,
    analytics: preferences.analytics,
    advertising: preferences.advertising,
    status: preferences.status,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
      // Set 1-year cookie for SSR awareness
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `${CONSENT_COOKIE_KEY}=${full.status}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Dispatch browser event so analytics and ads update without full reload
      window.dispatchEvent(new CustomEvent("civic_consent_updated", { detail: full }));
    } catch {
      // Ignored
    }
  }

  return full;
}

/**
 * Convenience helper: Accepts all cookies (essential, analytics, ads).
 */
export function acceptAllConsent(): ConsentPreferences {
  return saveConsent({
    analytics: true,
    advertising: true,
    status: "accepted_all",
  });
}

/**
 * Convenience helper: Rejects non-essential cookies (only essential remains active).
 */
export function rejectNonEssentialConsent(): ConsentPreferences {
  return saveConsent({
    analytics: false,
    advertising: false,
    status: "rejected_non_essential",
  });
}

/**
 * Determines whether the user has granted consent for analytics tracking.
 */
export function isAnalyticsAllowed(): boolean {
  const current = getStoredConsent();
  return current ? current.analytics : false;
}

/**
 * Determines whether the user has granted consent for network advertisements.
 */
export function isAdvertisingAllowed(): boolean {
  const current = getStoredConsent();
  return current ? current.advertising : false;
}

let cachedConsentString = "";
let cachedConsentObj: ConsentPreferences | null = null;

/**
 * Snapshot getter with referential stability for useSyncExternalStore.
 */
export function getConsentSnapshot(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY) || "";
    if (raw !== cachedConsentString) {
      cachedConsentString = raw;
      if (raw) {
        cachedConsentObj = JSON.parse(raw);
      } else {
        cachedConsentObj = null;
      }
    }
  } catch {
    cachedConsentObj = null;
  }
  return cachedConsentObj;
}

export function getConsentServerSnapshot(): ConsentPreferences | null {
  return null;
}

export function subscribeToConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("civic_consent_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("civic_consent_updated", callback);
    window.removeEventListener("storage", callback);
  };
}
