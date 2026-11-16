/**
 * Mobile Guide Offline Content Cache (Prompt 124)
 * Caches viewed guides and saved guides for offline access in airplane mode.
 * Shows "Updated X days ago" status and refreshes via /api/v1/updates?since=.
 */

import { type BundledGuide, getBundledGuide } from "./offline-datapack.ts";

export interface CachedGuideEntry {
  guide: BundledGuide;
  cachedAt: string;
  source: "bundled" | "network" | "delta-sync";
}

const CACHE_INDEX_KEY = "civic_mobile_guide_cache_index";
const CACHE_PREFIX = "civic_guide_cache_";

// Memory storage driver for universal test/runtime compatibility
const cacheMemoryStore = new Map<string, string>();

interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

let storageDriver: StorageAdapter = {
  getItem: (key: string) => {
    if (typeof globalThis !== "undefined") {
      try {
        const storage = (globalThis as unknown as { localStorage?: StorageAdapter }).localStorage;
        if (storage) return storage.getItem(key);
      } catch {
        // Fallback
      }
    }
    return cacheMemoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    if (typeof globalThis !== "undefined") {
      try {
        const storage = (globalThis as unknown as { localStorage?: StorageAdapter }).localStorage;
        if (storage) storage.setItem(key, value);
      } catch {
        // Fallback
      }
    }
    cacheMemoryStore.set(key, value);
  },
  removeItem: (key: string) => {
    if (typeof globalThis !== "undefined") {
      try {
        const storage = (globalThis as unknown as { localStorage?: StorageAdapter }).localStorage;
        if (storage) storage.removeItem(key);
      } catch {
        // Fallback
      }
    }
    cacheMemoryStore.delete(key);
  },
};

export function setCacheStorageDriver(driver: StorageAdapter) {
  storageDriver = driver;
}

function getCacheKey(slug: string, state?: string): string {
  return `${CACHE_PREFIX}${slug}_${(state || "gj").toLowerCase()}`;
}

export function cacheViewedGuide(
  guide: BundledGuide,
  source: "bundled" | "network" | "delta-sync" = "network"
): void {
  try {
    const key = getCacheKey(guide.slug, guide.stateCode);
    const entry: CachedGuideEntry = {
      guide,
      cachedAt: new Date().toISOString(),
      source,
    };

    storageDriver.setItem(key, JSON.stringify(entry));

    // Update index
    const indexRaw = storageDriver.getItem(CACHE_INDEX_KEY);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(key)) {
      index.unshift(key);
      storageDriver.setItem(CACHE_INDEX_KEY, JSON.stringify(index.slice(0, 50)));
    }
  } catch {
    // Fail silently
  }
}

export function getCachedGuide(slug: string, state?: string): CachedGuideEntry | null {
  try {
    const key = getCacheKey(slug, state);
    const raw = storageDriver.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Fail silently
  }

  // Fallback to bundled data pack
  const bundled = getBundledGuide(slug, state);
  if (bundled) {
    return {
      guide: bundled,
      cachedAt: bundled.lastVerifiedAt,
      source: "bundled",
    };
  }

  return null;
}

export function formatUpdatedAgo(
  isoDateOrCachedAt: string,
  referenceDate: Date = new Date()
): string {
  const date = new Date(isoDateOrCachedAt);
  if (isNaN(date.getTime())) return "Recently updated";

  const diffMs = referenceDate.getTime() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  if (diffDays === 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 30) return `Updated ${diffDays} days ago`;
  if (diffDays < 60) return "Updated 1 month ago";
  return `Updated ${Math.floor(diffDays / 30)} months ago`;
}

export function getAllCachedGuideKeys(): string[] {
  try {
    const raw = storageDriver.getItem(CACHE_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearGuideCache(): void {
  try {
    const keys = getAllCachedGuideKeys();
    keys.forEach((k) => storageDriver.removeItem(k));
    storageDriver.removeItem(CACHE_INDEX_KEY);
  } catch {
    // Fail silently
  }
  cacheMemoryStore.clear();
}
