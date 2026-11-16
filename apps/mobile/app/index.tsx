import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { TaskContent } from "@civic/types";
import { isFresh } from "@civic/utils";

export default function MobileHomeScreen() {
  const sampleVerificationDate = "2026-11-01T00:00:00Z";
  const verifiedFresh = isFresh(sampleVerificationDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>India Paperwork Guide</Text>
      <Text style={styles.subtitle}>Mobile App (Expo / React Native)</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          Light Theme Only • {verifiedFresh ? "Verified Fresh" : "Needs Update"}
        </Text>
      </View>
    </View>
  );
}

export type { TaskContent };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  badgeText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "600",
  },
});
