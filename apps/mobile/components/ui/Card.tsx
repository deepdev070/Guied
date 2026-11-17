import React from "react";
import { View, TouchableOpacity, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, spacing, layout } from "../../theme/tokens";

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp;
  accessibilityLabel?: string;
  testID?: string;
}

export function Card({ children, onPress, style, accessibilityLabel, testID }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[styles.base, styles.interactive, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View testID={testID} style={[styles.base, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  interactive: {
    minHeight: layout.minTouchTarget, // 44pt minimum touch target
  },
});

