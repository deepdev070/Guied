# Mobile Local Storage Architecture & Justification (Prompt 123)

## 1. Context & Requirements

The India Paperwork Guide mobile application requires offline-first, client-side persistence for citizen document checklists ("My Lists").
Key requirements:

1. **Zero-Account Access**: Users can bookmark guides and tick off required documents without creating an account or logging in.
2. **Instant Performance**: Checking an item must feel instantaneous (<16ms) without frame drops or asynchronous UI hitching.
3. **Export/Import Compatibility**: Data must be 100% compatible with the web portal's JSON backup/restore schema (`version: 1`, `index: ChecklistIndexEntry[]`, `items: Record<string, string[]>`).
4. **Resilience**: Zero network dependency; checklists must survive app restarts and airplane mode.

---

## 2. Technical Evaluation: MMKV vs. SQLite vs. AsyncStorage

| Evaluation Dimension     | MMKV (`react-native-mmkv`)                         | SQLite (`expo-sqlite`)                                 | AsyncStorage (`@react-native-async-storage`) |
| :----------------------- | :------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------- |
| **Data Model**           | Key-Value (mmap C++)                               | Relational Tables & Rows (ACID)                        | Key-Value (Serialized JSON on disk)          |
| **Speed / Latency**      | ~30x faster than AsyncStorage, synchronous         | Medium (SQL query compilation & execution)             | Asynchronous promise bridging                |
| **Schema Complexity**    | No schema, pure string/object keys                 | Requires SQL DDL, tables, migrations                   | No schema, simple string keys                |
| **Best Used For**        | Fast UI state, checklists, user flags, cached JSON | Complex relational datasets, full-text offline indices | Small preferences, fallback stores           |
| **Expo Compatibility**   | Fast JSI, requires native dev client               | Built-in Expo support                                  | Built-in Expo / fallback support             |
| **Web Interoperability** | Maps 1:1 to browser `localStorage`                 | Requires table-to-JSON serialization adapter           | Maps 1:1 to browser `localStorage`           |

---

## 3. Architecture Decision & Justification

### Selected Pattern: Fast Key-Value Storage (MMKV Semantics with Resilient Fallback)

For "My Lists" checklist tracking, **MMKV / Key-Value storage is the superior choice** over SQLite for the following architectural reasons:

1. **Direct Web Interoperability**:
   - The web app persists checklists using key-value storage (`localStorage` keys: `my_checklists_index` and `checklist_${taskSlug}_${stateSlug}`).
   - An MMKV / Key-Value store uses identical key names and JSON payloads. Export and import between the website and mobile app require zero relational schema conversion, eliminating data loss during migrations.
2. **Sub-millisecond Checkbox Toggling**:
   - Document checkboxes must toggle instantaneously on mobile touch interactions. MMKV operates synchronously via JSI direct memory access (mmap), whereas SQLite requires creating transactions, executing parameter bindings, and asynchronous callbacks.
3. **No Over-Engineering**:
   - Checklists are bounded, small data structures (typically 5 to 15 document IDs per task). Storing this in relational SQL tables with foreign keys adds unnecessary table maintenance, migration scripts, and overhead for simple toggle arrays.
4. **Universal Driver Adapter**:
   - Our `checklist-storage.ts` module implements an adapter pattern: if MMKV is present, it uses MMKV; otherwise it provides safe fallback to in-memory/AsyncStorage, ensuring automated test suites, SSR, and web previews run with 100% test reliability.

---

## 4. Data Format Specification (Interoperable with Web)

```typescript
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
```
