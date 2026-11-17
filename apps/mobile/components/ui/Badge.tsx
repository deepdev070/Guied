import React from "react";
import { View, Text, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, typography } from "../../theme/tokens";

export type BadgeVariant = "info" | "success" | "warning" | "error" | "neutral";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp;
}

export function Badge({ label, variant = "info", style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
  },

  info: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  infoText: {
    color: colors.primary,
  },

  success: {
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
  },
  successText: {
    color: colors.successText,
  },

  warning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningBorder,
  },
  warningText: {
    color: colors.warningText,
  },

  error: {
    backgroundColor: colors.errorLight,
    borderColor: colors.errorBorder,
  },
  errorText: {
    color: colors.errorText,
  },

  neutral: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  neutralText: {
    color: colors.textMuted,
  },
});

