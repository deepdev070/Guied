import React from "react";
import { View, Text, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

export type CalloutVariant = "info" | "warning" | "success" | "error";

export interface CalloutProps {
  title?: string;
  children: React.ReactNode;
  variant?: CalloutVariant;
  style?: StyleProp;
}

export function Callout({ title, children, variant = "info", style }: CalloutProps) {
  const isStringContent = typeof children === "string";

  return (
    <View style={[styles.base, styles[variant], style]}>
      {title ? (
        <Text style={[styles.title, styles[`${variant}Title` as keyof typeof styles]]}>
          {title}
        </Text>
      ) : null}
      {isStringContent ? (
        <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderRightColor: colors.border,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: typography.body.fontSize,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 18,
    color: colors.text,
  },

  info: {
    backgroundColor: colors.primaryLight,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    color: colors.primary,
  },
  infoText: {
    color: colors.text,
  },

  warning: {
    backgroundColor: colors.warningLight,
    borderLeftColor: colors.warning,
  },
  warningTitle: {
    color: colors.warningText,
  },
  warningText: {
    color: colors.text,
  },

  success: {
    backgroundColor: colors.successLight,
    borderLeftColor: colors.success,
  },
  successTitle: {
    color: colors.successText,
  },
  successText: {
    color: colors.text,
  },

  error: {
    backgroundColor: colors.errorLight,
    borderLeftColor: colors.error,
  },
  errorTitle: {
    color: colors.errorText,
  },
  errorText: {
    color: colors.text,
  },
});
