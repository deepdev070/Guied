import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type StyleProp } from "react-native";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";

export interface SearchFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  onSubmitEditing?: () => void;
  style?: StyleProp;
  testID?: string;
}

export function SearchField({
  label,
  value,
  onChangeText,
  onClear,
  placeholder = "Search guides...",
  helperText,
  errorText,
  onSubmitEditing,
  style,
  testID,
}: SearchFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label above field (never placeholder-only) */}
      <Text style={styles.label}>{label}</Text>

      {/* Input container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(errorText) && styles.inputError,
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          testID={testID}
          style={styles.input}
        />

        {value.length > 0 ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Helper text or Error text with icon */}
      {errorText ? (
        <Text style={styles.errorText}>⚠ {errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  label: {
    fontSize: typography.bodySm.fontSize,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    height: layout.searchFieldHeight, // 48px height
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: layout.searchFieldHeight,
    fontSize: typography.body.fontSize,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "bold",
  },
  helperText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.errorText,
    marginTop: 4,
    fontWeight: "500",
  },
});
