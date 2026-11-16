/**
 * Mobile Background Sync Service (Prompt 125)
 * Incremental delta synchronization via /api/v1/updates?since=
 * Fetches revised fees, rules, and procedures in background without blocking UI.
 */

import { registerGuideUpdate, type BundledGuide } from "./offline-datapack.ts";

export interface SyncUpdateTask {
  slug: string;
  name: string;
  categorySlug: string;
  lastVerifiedAt?: string;
  action: "UPDATED" | "VERIFIED" | "UNCHANGED";
}

export interface SyncResponsePayload {
  since: string;
  serverTime: string;
  count: number;
  tasks: SyncUpdateTask[];
}

export interface SyncResult {
  success: boolean;
  updatedCount: number;
  since: string;
  serverTime?: string;
  error?: string;
}

const SYNC_META_KEY = "civic_sync_last_timestamp";

// In-memory sync timestamp fallback
let inMemoryLastSync: string | null = null;
let isCurrentlySyncing = false;

export function getLastSyncTimestamp(): string | null {
  if (typeof globalThis !== "undefined") {
    try {
      const storage = (
        globalThis as unknown as { localStorage?: { getItem: (k: string) => string | null } }
      ).localStorage;
      if (storage) {
        return storage.getItem(SYNC_META_KEY) || inMemoryLastSync;
      }
    } catch {
      // Fallback
    }
  }
  return inMemoryLastSync;
}

export function setLastSyncTimestamp(ts: string): void {
  inMemoryLastSync = ts;
  if (typeof globalThis !== "undefined") {
    try {
      const storage = (
        globalThis as unknown as { localStorage?: { setItem: (k: string, v: string) => void } }
      ).localStorage;
      if (storage) {
        storage.setItem(SYNC_META_KEY, ts);
      }
    } catch {
      // Fallback
    }
  }
}

export function isSyncing(): boolean {
  return isCurrentlySyncing;
}

export interface SyncOptions {
  force?: boolean;
  baseUrl?: string;
  since?: string;
  fetchFn?: typeof fetch;
}

/**
 * Executes delta synchronization with the civic guide API.
 */
export async function syncDeltaUpdates(options: SyncOptions = {}): Promise<SyncResult> {
  if (isCurrentlySyncing) {
    return {
      success: false,
      updatedCount: 0,
      since: getLastSyncTimestamp() || new Date(0).toISOString(),
      error: "Sync already in progress.",
    };
  }

  isCurrentlySyncing = true;
  const fetchClient = options.fetchFn || (typeof fetch !== "undefined" ? fetch : null);

  if (!fetchClient) {
    isCurrentlySyncing = false;
    return {
      success: false,
      updatedCount: 0,
      since: getLastSyncTimestamp() || new Date(0).toISOString(),
      error: "No fetch client available in current runtime.",
    };
  }

  const baseUrl = options.baseUrl || "https://paperwork.gov.in";
  const since =
    options.since ||
    (options.force ? new Date(0).toISOString() : getLastSyncTimestamp() || "2026-11-01T00:00:00Z");

  try {
    const url = `${baseUrl}/api/v1/updates?since=${encodeURIComponent(since)}`;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeout = setTimeout(() => controller?.abort(), 10000);

    const res = await fetchClient(url, {
      signal: controller?.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "IndiaPaperworkGuideMobile/1.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      isCurrentlySyncing = false;
      return {
        success: false,
        updatedCount: 0,
        since,
        error: `Server responded with HTTP ${res.status}`,
      };
    }

    const payload = (await res.json()) as { success?: boolean; data?: SyncResponsePayload };
    const syncData = payload.data || (payload as unknown as SyncResponsePayload);

    if (!syncData || !Array.isArray(syncData.tasks)) {
      isCurrentlySyncing = false;
      return {
        success: false,
        updatedCount: 0,
        since,
        error: "Malformed sync response from server.",
      };
    }

    // For any task with action UPDATED or VERIFIED, fetch full variant
    let updatedCount = 0;
    for (const task of syncData.tasks) {
      if (task.action === "UPDATED" || task.action === "VERIFIED") {
        try {
          const detailUrl = `${baseUrl}/api/v1/tasks/${task.slug}/gj`;
          const detailRes = await fetchClient(detailUrl, {
            headers: { Accept: "application/json" },
          });

          if (detailRes.ok) {
            const detailPayload = (await detailRes.json()) as {
              success?: boolean;
              data?: BundledGuide;
            };
            const guide = detailPayload.data || (detailPayload as unknown as BundledGuide);
            if (guide && guide.slug) {
              registerGuideUpdate(guide);
              updatedCount++;
            }
          }
        } catch {
          // Individual guide fetch failure shouldn't abort entire sync
        }
      }
    }

    const serverTime = syncData.serverTime || new Date().toISOString();
    setLastSyncTimestamp(serverTime);
    isCurrentlySyncing = false;

    return {
      success: true,
      updatedCount,
      since,
      serverTime,
    };
  } catch (err) {
    isCurrentlySyncing = false;
    return {
      success: false,
      updatedCount: 0,
      since,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
