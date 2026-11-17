import React from "react";
import { View, StyleSheet, type StyleProp } from "react-native";
import { colors, radius } from "../../theme/tokens";

export interface SkeletonProps {
  width?: number | `${number}%` | "auto";
  height?: number;
  borderRadius?: number;
  style?: StyleProp;
  testID?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = radius.sm,
  style,
  testID,
}: SkeletonProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.skeleton,
        {
          width: width as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.8,
  },
});

