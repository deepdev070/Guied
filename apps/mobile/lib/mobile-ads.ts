/**
 * Mobile Ads Architecture & AdMob Integration Points (Prompt 127)
 *
 * Implements:
 * - Central config flag `MOBILE_ADS_CONFIG.enabled` (default false).
 * - Standard test AdUnit IDs for Google AdMob (Android & iOS).
 * - Platform policy verification (strictly NO ads on first/home screen, legal screens, or near sticky interactive CTAs).
 * - Core Web Vitals / layout shift protection with exact reserved dimensions.
 */

export type MobileAdFormat = "banner" | "medium_rectangle";

export interface AdFormatSpec {
  format: MobileAdFormat;
  width: number;
  height: number;
  minContainerHeight: number;
  label: string;
}

export const AD_FORMAT_SPECS: Record<MobileAdFormat, AdFormatSpec> = {
  banner: {
    format: "banner",
    width: 320,
    height: 50,
    minContainerHeight: 70, // 50px ad + 20px label/padding
    label: "Advertisement",
  },
  medium_rectangle: {
    format: "medium_rectangle",
    width: 300,
    height: 250,
    minContainerHeight: 275, // 250px ad + 25px label/padding
    label: "Advertisement",
  },
};

export interface MobileAdsConfig {
  enabled: boolean;
  testMode: boolean;
  adMobAppId: {
    android: string;
    ios: string;
  };
  testAdUnitIds: {
    banner: {
      android: string;
      ios: string;
    };
    mediumRectangle: {
      android: string;
      ios: string;
    };
  };
}

// Default configuration: disabled by config flag as mandated by Prompt 127
export const MOBILE_ADS_CONFIG: MobileAdsConfig = {
  enabled: false,
  testMode: true,
  adMobAppId: {
    android: "ca-app-pub-3940256099942544~3347511713", // Google standard sample App ID
    ios: "ca-app-pub-3940256099942544~145869519",
  },
  testAdUnitIds: {
    banner: {
      android: "ca-app-pub-3940256099942544/6300978111", // Google standard sample banner
      ios: "ca-app-pub-3940256099942544/2934735716",
    },
    mediumRectangle: {
      android: "ca-app-pub-3940256099942544/6300978111",
      ios: "ca-app-pub-3940256099942544/2934735716",
    },
  },
};

/**
 * Screen Policy Validation (Google Play / Apple Store / Better Ads Standards)
 * Policy mandates:
 * 1. Zero ads on the first screen / Home screen / splash.
 * 2. Zero ads on legal, disclaimer, privacy policy, or mistake reporting screens.
 * 3. Never place ads immediately adjacent to actionable primary buttons without safety margins.
 */
export const RESTRICTED_SCREENS = new Set([
  "home",
  "first_screen",
  "splash",
  "onboarding",
  "privacy",
  "terms",
  "disclaimer",
  "report_mistake",
  "about",
  "saved",
]);

export function isAdAllowedOnScreen(screenName: string): boolean {
  if (!screenName) return false;
  const normalized = screenName.trim().toLowerCase();
  return !RESTRICTED_SCREENS.has(normalized);
}

/**
 * Validates placement safety to prevent accidental clicks
 */
export function validateAdPlacement(options: {
  screenName: string;
  isAccidentalClickRisk?: boolean;
}): { allowed: boolean; reason?: string } {
  if (!isAdAllowedOnScreen(options.screenName)) {
    return {
      allowed: false,
      reason: `Ads are strictly prohibited on restricted screen: ${options.screenName}`,
    };
  }

  if (options.isAccidentalClickRisk) {
    return {
      allowed: false,
      reason:
        "Placement violates platform policy: risk of accidental clicks near actionable controls.",
    };
  }

  return { allowed: true };
}

let runtimeConfigOverride: Partial<MobileAdsConfig> | null = null;

export function setMobileAdsConfigOverride(override: Partial<MobileAdsConfig> | null): void {
  runtimeConfigOverride = override;
}

export function getMobileAdsConfig(): MobileAdsConfig {
  if (runtimeConfigOverride) {
    return { ...MOBILE_ADS_CONFIG, ...runtimeConfigOverride };
  }
  return MOBILE_ADS_CONFIG;
}
