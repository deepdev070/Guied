/**
 * Mobile Checklist Storage Service (Prompt 123)
 * Offline-first key-value storage engine for citizen document checklists.
 * 100% interoperable with the Web portal's JSON backup/restore schema.
 */

export interface ChecklistIndexEntry {
  taskSlug: string;
  stateSlug: string;
  taskTitle: string;
  totalCount: number;
  completedCount: number;
  lastUpdated: string;
}

export interface ChecklistExportPayload {
  version: 1;
  exportedAt: string;
  index: ChecklistIndexEntry[];
  items: Record<string, string[]>;
}

const CHECKLIST_INDEX_KEY = "my_checklists_index";

// Universal key-value in-memory fallback for React Native / SSR / Node testing
const memoryStore = new Map<string, string>();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors
    }
  });
}

export function subscribeToChecklistUpdates(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

interface KeyValueDriver {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

function getGlobalStorage(): KeyValueDriver | null {
  try {
    if (
      typeof globalThis !== "undefined" &&
      (globalThis as unknown as Record<string, unknown>).localStorage
    ) {
      return (globalThis as unknown as { localStorage: KeyValueDriver }).localStorage;
    }
  } catch {
    // Ignore
  }
  return null;
}

let activeDriver: KeyValueDriver = {
  getItem: (key: string) => {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        return storage.getItem(key);
      } catch {
        // Fallback
      }
    }
    return memoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        storage.setItem(key, value);
      } catch {
        // Fallback
      }
    }
    memoryStore.set(key, value);
    notifyListeners();
  },
  removeItem: (key: string) => {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        storage.removeItem(key);
      } catch {
        // Fallback
      }
    }
    memoryStore.delete(key);
    notifyListeners();
  },
  clear: () => {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        storage.clear();
      } catch {
        // Fallback
      }
    }
    memoryStore.clear();
    notifyListeners();
  },
};

/**
 * Configure a custom key-value driver (e.g. MMKV or SQLite adapter)
 */
export function setStorageDriver(driver: KeyValueDriver) {
  activeDriver = driver;
}

export function getChecklistStorageKey(taskSlug: string, stateSlug?: string): string {
  return `checklist_${taskSlug}_${stateSlug || "national"}`;
}

export function getAllChecklistsIndex(): ChecklistIndexEntry[] {
  try {
    const raw = activeDriver.getItem(CHECKLIST_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoredCompletedDocs(taskSlug: string, stateSlug?: string): string[] {
  try {
    const key = getChecklistStorageKey(taskSlug, stateSlug);
    const raw = activeDriver.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCompletedDocs(
  taskSlug: string,
  stateSlug: string | undefined,
  docIds: string[],
  meta?: { taskTitle?: string; totalCount?: number }
): void {
  const key = getChecklistStorageKey(taskSlug, stateSlug);

  try {
    activeDriver.setItem(key, JSON.stringify(docIds));

    // Update global checklist index
    if (meta?.taskTitle && meta.totalCount !== undefined) {
      updateChecklistIndex({
        taskSlug,
        stateSlug: stateSlug || "national",
        taskTitle: meta.taskTitle,
        totalCount: meta.totalCount,
        completedCount: docIds.length,
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch {
    // Graceful fallback
  }
}

export function toggleStoredDoc(
  taskSlug: string,
  stateSlug: string | undefined,
  docId: string,
  meta?: { taskTitle?: string; totalCount?: number }
): string[] {
  const current = getStoredCompletedDocs(taskSlug, stateSlug);
  const next = current.includes(docId) ? current.filter((id) => id !== docId) : [...current, docId];

  saveStoredCompletedDocs(taskSlug, stateSlug, next, meta);
  return next;
}

export function clearStoredCompletedDocs(taskSlug: string, stateSlug?: string): void {
  const key = getChecklistStorageKey(taskSlug, stateSlug);

  try {
    activeDriver.removeItem(key);

    const index = getAllChecklistsIndex();
    const filtered = index.filter(
      (item) => !(item.taskSlug === taskSlug && item.stateSlug === (stateSlug || "national"))
    );
    activeDriver.setItem(CHECKLIST_INDEX_KEY, JSON.stringify(filtered));
  } catch {
    // Graceful fallback
  }
}

function updateChecklistIndex(entry: ChecklistIndexEntry): void {
  try {
    const index = getAllChecklistsIndex();
    const existingIdx = index.findIndex(
      (item) => item.taskSlug === entry.taskSlug && item.stateSlug === entry.stateSlug
    );

    if (existingIdx >= 0) {
      index[existingIdx] = entry;
    } else {
      index.unshift(entry);
    }

    activeDriver.setItem(CHECKLIST_INDEX_KEY, JSON.stringify(index.slice(0, 50)));
  } catch {
    // Ignore error
  }
}

/**
 * Exports all user checklist progress as a portable JSON backup string (identical to Web).
 */
export function exportChecklistsData(): string {
  const index = getAllChecklistsIndex();
  const items: Record<string, string[]> = {};

  for (const entry of index) {
    const key = getChecklistStorageKey(entry.taskSlug, entry.stateSlug);
    try {
      const raw = activeDriver.getItem(key);
      if (raw) {
        items[key] = JSON.parse(raw);
      }
    } catch {
      // Ignore single item read failure
    }
  }

  const payload: ChecklistExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    index,
    items,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Imports and merges checklist data from a JSON backup string into local storage.
 * Compatible with web backup format.
 */
export function importChecklistsData(jsonString: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString.trim());
    if (!parsed || typeof parsed !== "object") {
      return { success: false, count: 0, error: "Invalid backup format: root must be an object." };
    }

    const newIndex: ChecklistIndexEntry[] = Array.isArray(parsed.index) ? parsed.index : [];
    const items: Record<string, string[]> =
      parsed.items && typeof parsed.items === "object" ? parsed.items : {};

    let restoredCount = 0;
    for (const [key, docIds] of Object.entries(items)) {
      if (key.startsWith("checklist_") && Array.isArray(docIds)) {
        activeDriver.setItem(key, JSON.stringify(docIds));
        restoredCount++;
      }
    }

    // Merge index entries
    const currentIndex = getAllChecklistsIndex();
    const mergedMap = new Map<string, ChecklistIndexEntry>();

    for (const entry of currentIndex) {
      mergedMap.set(`${entry.taskSlug}_${entry.stateSlug}`, entry);
    }

    for (const entry of newIndex) {
      if (entry.taskSlug && entry.stateSlug) {
        mergedMap.set(`${entry.taskSlug}_${entry.stateSlug}`, entry);
      }
    }

    const mergedList = Array.from(mergedMap.values());
    activeDriver.setItem(CHECKLIST_INDEX_KEY, JSON.stringify(mergedList.slice(0, 50)));

    return {
      success: true,
      count: Math.max(restoredCount, newIndex.length),
    };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: `Failed to parse JSON backup: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
