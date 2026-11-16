/**
 * PWA Install Prompt State & Dismissal Manager
 * Manages 30-day dismissal window and install state in local storage.
 */

export const INSTALL_DISMISSAL_KEY = "civic_install_dismissed_until";
export const DISMISSAL_PERIOD_DAYS = 30;
export const THIRTY_DAYS_MS = DISMISSAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export function isInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(INSTALL_DISMISSAL_KEY);
    if (!raw) return false;
    const expiresAt = parseInt(raw, 10);
    return !isNaN(expiresAt) && Date.now() < expiresAt;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    const expiresAt = Date.now() + THIRTY_DAYS_MS;
    window.localStorage.setItem(INSTALL_DISMISSAL_KEY, expiresAt.toString());
  } catch {
    // Ignore storage errors
  }
}

export function resetInstallPromptDismissal(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(INSTALL_DISMISSAL_KEY);
  } catch {
    // Ignore storage errors
  }
}
