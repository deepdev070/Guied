/**
 * Checklist Storage Service
 * Manages per-task and per-state document checklist progress in browser localStorage.
 */

export interface ChecklistIndexEntry {
  taskSlug: string;
  stateSlug: string;
  taskTitle: string;
  totalCount: number;
  completedCount: number;
  lastUpdated: string;
}

const CHECKLIST_INDEX_KEY = "my_checklists_index";

function getStorage(): Storage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    // Ignore error
  }
  return null;
}

export function getChecklistStorageKey(taskSlug: string, stateSlug?: string): string {
  return `checklist_${taskSlug}_${stateSlug || "national"}`;
}

export function getStoredCompletedDocs(taskSlug: string, stateSlug?: string): string[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const key = getChecklistStorageKey(taskSlug, stateSlug);
    const raw = storage.getItem(key);
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
  const storage = getStorage();
  if (!storage) return;
  const key = getChecklistStorageKey(taskSlug, stateSlug);

  try {
    storage.setItem(key, JSON.stringify(docIds));

    // Update global checklist index for "My Checklists" page
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("civic-checklist-saved", {
          detail: {
            taskSlug,
            stateSlug: stateSlug || "national",
            completedCount: docIds.length,
            totalCount: meta?.totalCount,
          },
        })
      );
    }
  } catch {
    // Graceful fallback for storage limits
  }
}

export function clearStoredCompletedDocs(taskSlug: string, stateSlug?: string): void {
  const storage = getStorage();
  if (!storage) return;
  const key = getChecklistStorageKey(taskSlug, stateSlug);

  try {
    storage.removeItem(key);

    // Update global index
    const index = getAllChecklistsIndex();
    const filtered = index.filter(
      (item) => !(item.taskSlug === taskSlug && item.stateSlug === (stateSlug || "national"))
    );
    storage.setItem(CHECKLIST_INDEX_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore error
  }
}

export function getAllChecklistsIndex(): ChecklistIndexEntry[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(CHECKLIST_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Exports all user checklist progress from localStorage as a portable JSON string.
 */
export function exportChecklistsData(): string {
  const storage = getStorage();
  if (!storage)
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      index: [],
      items: {},
    });

  const index = getAllChecklistsIndex();
  const items: Record<string, string[]> = {};

  for (const entry of index) {
    const key = getChecklistStorageKey(entry.taskSlug, entry.stateSlug);
    try {
      const raw = storage.getItem(key);
      if (raw) {
        items[key] = JSON.parse(raw);
      }
    } catch {
      // Ignore single item read failure
    }
  }

  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      index,
      items,
    },
    null,
    2
  );
}

/**
 * Imports and merges checklist data from a JSON backup string into localStorage.
 */
export function importChecklistsData(jsonString: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  const storage = getStorage();
  if (!storage) {
    return {
      success: false,
      count: 0,
      error: "Local storage is not available in this environment.",
    };
  }

  try {
    const parsed = JSON.parse(jsonString.trim());
    if (!parsed || typeof parsed !== "object") {
      return { success: false, count: 0, error: "Invalid backup format: root must be an object." };
    }

    const newIndex: ChecklistIndexEntry[] = Array.isArray(parsed.index) ? parsed.index : [];
    const items: Record<string, string[]> =
      parsed.items && typeof parsed.items === "object" ? parsed.items : {};

    // Restore individual checklist items
    let restoredCount = 0;
    for (const [key, docIds] of Object.entries(items)) {
      if (key.startsWith("checklist_") && Array.isArray(docIds)) {
        storage.setItem(key, JSON.stringify(docIds));
        restoredCount++;
      }
    }

    // Merge new index entries with existing index
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
    storage.setItem(CHECKLIST_INDEX_KEY, JSON.stringify(mergedList.slice(0, 50)));

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

function updateChecklistIndex(entry: ChecklistIndexEntry): void {
  const storage = getStorage();
  if (!storage) return;
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

    storage.setItem(CHECKLIST_INDEX_KEY, JSON.stringify(index.slice(0, 50)));
  } catch {
    // Ignore error
  }
}
