import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

/**
 * Mobile More / Information Screen
 * Verification policies, state selection, language options, and version info.
 */
export default function MoreScreen() {
  const menuItems = [
    { title: "Selected State", value: "Gujarat (GJ)", desc: "Change your default state portal" },
    { title: "App Language", value: "English", desc: "Available: English, Hindi (हिंदी), Gujarati (ગુજરાતી)" },
    { title: "How We Verify Guides", value: "Class 8 Standard", desc: "Zero unverified content, 100% .gov.in sources" },
    { title: "App Version", value: "v0.1.0", desc: "Light theme only • Offline first" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.row,
              index < menuItems.length - 1 && styles.rowBorder,
            ]}
            accessibilityRole="button"
          >
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.rowValue}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: "#64748B",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
});
