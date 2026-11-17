import React from "react";
import { View, Text, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

export interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime?: string;
  isOnline?: boolean;
}

export interface StepListProps {
  steps: StepItem[];
  style?: StyleProp;
}

export function StepList({ steps, style }: StepListProps) {
  return (
    <View style={[styles.container, style]}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;

        return (
          <View key={step.stepNumber} style={styles.stepRow}>
            {/* Left Column: Number circle and connecting line */}
            <View style={styles.indicatorCol}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{step.stepNumber}</Text>
              </View>
              {!isLast ? <View style={styles.connector} /> : null}
            </View>

            {/* Right Column: Step details */}
            <View style={[styles.contentCol, isLast && styles.contentColLast]}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{step.title}</Text>
                {step.isOnline !== undefined ? (
                  <View style={step.isOnline ? styles.onlineTag : styles.offlineTag}>
                    <Text style={step.isOnline ? styles.onlineTagText : styles.offlineTagText}>
                      {step.isOnline ? "Online" : "In-Person"}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.description}>{step.description}</Text>

              {step.estimatedTime ? (
                <Text style={styles.timeEstimate}>⏱ Est. time: {step.estimatedTime}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  stepRow: {
    flexDirection: "row",
  },
  indicatorCol: {
    alignItems: "center",
    width: 32,
    marginRight: spacing.md,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    color: colors.textInverse,
    fontWeight: "bold",
    fontSize: 14,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primaryBorder,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  contentColLast: {
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  onlineTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginLeft: 8,
  },
  onlineTagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
  offlineTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginLeft: 8,
  },
  offlineTagText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  description: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 6,
  },
  timeEstimate: {
    fontSize: typography.caption.fontSize,
    color: colors.textSubtle,
    fontWeight: "500",
  },
});

