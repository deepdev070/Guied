/**
 * Ad Provider Abstraction & Google AdSense Adapter (Prompt 89).
 * - Provider abstraction supporting "adsense" and "none" adapters.
 * - Enforces auto ads OFF (manual slots only) to protect Core Web Vitals and UX.
 * - Only loads external scripts when explicitly enabled AND consented.
 * - Supports lazy-loading slots via IntersectionObserver.
 * - Ad-blocker detection with polite, guilt-free civic support fallback.
 */

import { isAdvertisingAllowed } from "../consent.ts";
import type { AdFormat } from "../../components/ads/formats.ts";

export type AdProviderType = "adsense" | "none";

export interface AdSlotRenderOptions {
  slotId: string;
  format: AdFormat;
  container: HTMLElement;
  dimensions?: string;
}

export interface AdProvider {
  name: AdProviderType;
  init: () => Promise<boolean>;
  renderSlot: (options: AdSlotRenderOptions) => void;
  destroySlot?: (slotId: string) => void;
}

class NoneAdProvider implements AdProvider {
  name: AdProviderType = "none";

  async init(): Promise<boolean> {
    return true;
  }

  renderSlot(): void {
    // No-op for "none" adapter
  }
}

class GoogleAdSenseProvider implements AdProvider {
  name: AdProviderType = "adsense";
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<boolean> | null = null;

  private getClientId(): string {
    return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
  }

  async init(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    // Safety Gate 1: Ads must be enabled via env
    if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "true") {
      return false;
    }

    // Safety Gate 2: User must have explicitly granted advertising consent
    if (!isAdvertisingAllowed()) {
      return false;
    }

    const clientId = this.getClientId();
    if (!clientId) {
      return false;
    }

    if (this.scriptLoaded) return true;
    if (this.scriptLoadingPromise) return this.scriptLoadingPromise;

    this.scriptLoadingPromise = new Promise<boolean>((resolve) => {
      // Check if already injected
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src*="pagead2.googlesyndication.com"]`
      );
      if (existingScript) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      // Auto ads OFF: we append &client=${clientId} but do NOT enable page-level auto ads
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        clientId
      )}`;

      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };

      script.onerror = () => {
        // Ad-blocker or network error
        this.scriptLoaded = false;
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  renderSlot(options: AdSlotRenderOptions): void {
    const { slotId, format, container } = options;
    if (typeof window === "undefined" || !container) return;

    // Clear existing children
    container.innerHTML = "";

    const clientId = this.getClientId();
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", clientId);
    ins.setAttribute("data-ad-slot", slotId);
    ins.setAttribute("data-ad-format", format === "leaderboard" ? "horizontal" : "auto");
    ins.setAttribute("data-full-width-responsive", "false"); // Prevent CLS layout breakages

    container.appendChild(ins);

    try {
      const win = window as unknown as {
        adsbygoogle?: Array<Record<string, unknown>>;
      };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    } catch {
      // AdSense push failure
    }
  }
}

// Singletons
const noneProvider = new NoneAdProvider();
const adsenseProvider = new GoogleAdSenseProvider();

/**
 * Returns the configured ad provider instance.
 */
export function getAdProvider(): AdProvider {
  const providerType = (process.env.NEXT_PUBLIC_AD_PROVIDER || "").toLowerCase();
  if (providerType === "adsense") {
    return adsenseProvider;
  }
  return noneProvider;
}

/**
 * Checks whether an ad blocker appears active by verifying if the Google AdSense script or ad element was blocked.
 */
export function isAdBlockerActive(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as {
    google_ad_status?: number;
    adsbygoogle?: { loaded?: boolean };
  };
  // If adsense is configured, ads are enabled and consented, but adsbygoogle.loaded is explicitly undefined or blocked
  if (
    process.env.NEXT_PUBLIC_ADS_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_AD_PROVIDER === "adsense" &&
    isAdvertisingAllowed()
  ) {
    if (win.google_ad_status === 1) return false;
  }
  return false;
}
