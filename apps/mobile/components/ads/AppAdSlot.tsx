import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  AD_FORMAT_SPECS,
  type MobileAdFormat,
  getMobileAdsConfig,
  isAdAllowedOnScreen,
} from "../../lib/mobile-ads";
import { colors, typography, spacing, radius } from "../../theme";

export interface AppAdSlotProps {
  format: MobileAdFormat;
  placementId: string;
  screenName: string;
  testID?: string;
  forceEnabled?: boolean;
}

/**
 * Mobile In-App Advertisement Slot Placeholder (Prompt 127)
 *
 * Conforms to:
 * - Google Play Policy & Better Ads Standards (no ads on first screen, no deceptive/accidental-click placements)
 * - Exact reserved min-heights to eliminate layout shift (CLS = 0)
 * - Visible, respectful "Advertisement" badge in Class 8 accessible typography
 * - Disabled by default via `MOBILE_ADS_CONFIG.enabled`
 * - Clean AdMob integration points prepared for production activation
 */
export function AppAdSlot({
  format,
  placementId,
  screenName,
  testID,
  forceEnabled = false,
}: AppAdSlotProps) {
  // 1. Platform Policy Check: Zero ads on restricted screens (Home, onboarding, legal, privacy)
  if (!isAdAllowedOnScreen(screenName)) {
    return null;
  }

  const config = getMobileAdsConfig();
  const isEnabled = forceEnabled || config.enabled;
  const spec = AD_FORMAT_SPECS[format] || AD_FORMAT_SPECS.banner;

  // 2. If ads are completely disabled by config flag, do not render intrusive elements
  if (!isEnabled) {
    // When disabled, return null or a zero-footprint comment container to prevent unwanted empty gap
    return null;
  }

  // 3. When enabled or in preview mode, render slot with strictly reserved container dimensions
  return (
    <View
      testID={testID || `app-ad-slot-${placementId}`}
      style={[
        styles.container,
        {
          minHeight: spec.minContainerHeight,
        },
      ]}
      accessibilityRole="none"
      accessibilityLabel={`Advertisement slot, ${format}`}
    >
      {/* Policy-mandated "Advertisement" tag */}
      <View style={styles.labelRow}>
        <Text style={styles.adLabel}>{spec.label.toUpperCase()}</Text>
      </View>

      {/* Ad Box Placeholder / AdMob Surface */}
      <View
        style={[
          styles.adSurface,
          {
            width: spec.width,
            height: spec.height,
          },
        ]}
      >
        <Text style={styles.placeholderTitle}>
          Sponsored ({spec.width}x{spec.height})
        </Text>
        <Text style={styles.placeholderSubtitle}>
          Civic-compliant public notice & verified services
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  labelRow: {
    marginBottom: spacing.xs,
    alignItems: "center",
  },
  adLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  adSurface: {
    maxWidth: "100%",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  placeholderTitle: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
    textAlign: "center",
  },
  placeholderSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
});
