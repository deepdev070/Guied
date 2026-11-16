import React from "react";
import { TouchableOpacity, Text, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, typography, layout } from "../../theme/tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: StyleProp;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const isTextString = typeof children === "string";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (isTextString ? children : undefined)}
      accessibilityState={{ disabled }}
      testID={testID}
      style={[
        styles.base,
        size === "lg" ? styles.sizeLg : styles.sizeMd,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      {isTextString ? (
        <Text
          style={[
            styles.textBase,
            size === "lg" ? styles.textLg : styles.textMd,
            styles[`${variant}Text` as keyof typeof styles],
            disabled && styles.disabledText,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    minHeight: layout.minTouchTarget, // 44pt minimum
  },
  sizeMd: {
    minHeight: layout.buttonHeightMd, // 44pt
    paddingVertical: 10,
  },
  sizeLg: {
    minHeight: layout.buttonHeightLg, // 48pt
    paddingVertical: 12,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.textInverse,
  },

  secondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  secondaryText: {
    color: colors.primary,
  },

  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  outlineText: {
    color: colors.text,
  },

  ghost: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: colors.primary,
  },

  danger: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: colors.textInverse,
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textSubtle,
  },

  // Text typography
  textBase: {
    fontWeight: "600",
    textAlign: "center",
  },
  textMd: {
    fontSize: typography.body.fontSize,
  },
  textLg: {
    fontSize: typography.h4.fontSize,
  },
});
