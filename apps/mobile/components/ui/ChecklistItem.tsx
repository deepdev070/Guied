import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";

export interface ChecklistItemProps {
  id: string;
  name: string;
  description?: string;
  isMandatory?: boolean;
  isChecked?: boolean;
  onToggle: (id: string, nextChecked: boolean) => void;
  instructions?: string[];
  style?: StyleProp;
}

export function ChecklistItem({
  id,
  name,
  description,
  isMandatory = true,
  isChecked = false,
  onToggle,
  instructions,
  style,
}: ChecklistItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onToggle(id, !isChecked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      accessibilityLabel={`${name}, ${isMandatory ? "Mandatory" : "Optional"}`}
      style={[styles.container, isChecked && styles.containerChecked, style]}
    >
      <View style={styles.headerRow}>
        {/* Checkbox box (minimum 28px square, touch area 44pt) */}
        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
          {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>

        <View style={styles.titleCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, isChecked && styles.nameChecked]}>{name}</Text>
            <View style={isMandatory ? styles.mandatoryBadge : styles.optionalBadge}>
              <Text style={isMandatory ? styles.mandatoryText : styles.optionalText}>
                {isMandatory ? "Required" : "Optional"}
              </Text>
            </View>
          </View>

          {description ? (
            <Text style={[styles.description, isChecked && styles.descriptionChecked]}>
              {description}
            </Text>
          ) : null}

          {instructions && instructions.length > 0 ? (
            <View style={styles.instructionsBox}>
              {instructions.map((inst, i) => (
                <Text key={i} style={styles.instructionText}>
                  • {inst}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.xs,
    minHeight: layout.minTouchTarget, // 44pt minimum touch target
  },
  containerChecked: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderDark,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.borderDark,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 16,
  },
  titleCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  nameChecked: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  mandatoryBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  mandatoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.errorText,
    textTransform: "uppercase",
  },
  optionalBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  description: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  descriptionChecked: {
    color: colors.textSubtle,
  },
  instructionsBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  instructionText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    lineHeight: 16,
    marginVertical: 1,
  },
});
