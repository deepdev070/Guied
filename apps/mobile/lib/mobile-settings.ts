/**
 * Mobile App Settings & User Preferences Manager (Prompt 129)
 *
 * Manages:
 * - Language selection (en / hi / gu)
 * - Text size scale (100% / 115% / 130%)
 * - Default state (gujarat / national)
 * - Lite mode (low-bandwidth toggle)
 * - Privacy choices (analytics, diagnostics, data wipe)
 * - App version & build information
 */

export type AppLanguage = "en" | "hi" | "gu";
export type TextSizeScale = "100" | "115" | "130";

export interface MobileUserSettings {
  language: AppLanguage;
  textSize: TextSizeScale;
  defaultState: string;
  liteMode: boolean;
  analyticsAllowed: boolean;
  crashReportsAllowed: boolean;
}

export const APP_VERSION_INFO = {
  version: "0.1.0",
  buildNumber: "129",
  edition: "Gujarat Launch Edition",
  theme: "Strict Light Theme",
  verificationStandard: "Class 8 Reading Level • 100% .gov.in sources",
};

export const LANGUAGE_OPTIONS: Array<{ code: AppLanguage; label: string; nativeLabel: string }> = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
];

export const TEXT_SIZE_OPTIONS: Array<{ scale: TextSizeScale; label: string; percentage: string }> =
  [
    { scale: "100", label: "Normal", percentage: "100%" },
    { scale: "115", label: "Large", percentage: "115%" },
    { scale: "130", label: "Extra Large", percentage: "130%" },
  ];

export const DEFAULT_SETTINGS: MobileUserSettings = {
  language: "en",
  textSize: "100",
  defaultState: "gujarat",
  liteMode: false,
  analyticsAllowed: true,
  crashReportsAllowed: true,
};

const STORAGE_KEY = "civic_mobile_user_settings";

interface LocalStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

function getStorage(): LocalStorageLike | null {
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as unknown as { localStorage?: LocalStorageLike }).localStorage
  ) {
    return (globalThis as unknown as { localStorage: LocalStorageLike }).localStorage;
  }
  return null;
}

export function getMobileUserSettings(): MobileUserSettings {
  try {
    const storage = getStorage();
    if (!storage) return DEFAULT_SETTINGS;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveMobileUserSettings(settings: Partial<MobileUserSettings>): MobileUserSettings {
  try {
    const current = getMobileUserSettings();
    const updated = { ...current, ...settings };
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return { ...DEFAULT_SETTINGS, ...settings };
  }
}

export function clearAllLocalUserData(): boolean {
  try {
    const storage = getStorage();
    if (storage) {
      storage.clear();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
