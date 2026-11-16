import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { isFresh } from "@civic/utils";

/**
 * Mobile Home Screen
 * Displays search bar, state chip, category grid, and popular civic guides.
 */
export default function HomeScreen() {
  const router = useRouter();
  const sampleVerificationDate = "2026-11-15T00:00:00Z";
  const verifiedFresh = isFresh(sampleVerificationDate);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.heading}>Official Citizen Paperwork Guide</Text>
        <Text style={styles.subheading}>
          Step-by-step government document checklists, statutory fees & official portals.
        </Text>
        <View style={styles.freshnessBadge}>
          <Text style={styles.freshnessText}>
            ✓ {verifiedFresh ? "Verified Fresh" : "Reviewed"} • Gujarat & National
          </Text>
        </View>
      </View>

      {/* State Selector Chip */}
      <TouchableOpacity
        style={styles.stateChip}
        onPress={() => router.push("/(tabs)/search")}
        accessibilityRole="button"
        accessibilityLabel="Select state, currently Gujarat"
      >
        <Text style={styles.stateChipLabel}>Selected State:</Text>
        <Text style={styles.stateChipValue}>Gujarat (GJ) ▾</Text>
      </TouchableOpacity>

      {/* Quick Search Card */}
      <TouchableOpacity
        style={styles.searchCard}
        onPress={() => router.push("/(tabs)/search")}
        accessibilityRole="button"
        accessibilityLabel="Open search for citizen guides"
      >
        <Text style={styles.searchPlaceholder}>Search "Driving Licence", "Passport"...</Text>
      </TouchableOpacity>

      {/* Popular Guides Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Civic Guides</Text>
        <View style={styles.cardList}>
          <TouchableOpacity
            style={styles.guideCard}
            onPress={() => router.push({ pathname: "/task/[slug]", params: { slug: "driving-licence-learner" } })}
            accessibilityRole="button"
            accessibilityLabel="Learner Driving Licence guide"
          >
            <Text style={styles.guideName}>Learner Driving Licence (LLR)</Text>
            <Text style={styles.guideMeta}>Vehicles • Form 2 • ₹150 – ₹200</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guideCard}
            onPress={() => router.push({ pathname: "/task/[slug]", params: { slug: "driving-licence-new" } })}
            accessibilityRole="button"
            accessibilityLabel="Permanent Driving Licence guide"
          >
            <Text style={styles.guideName}>Permanent Driving Licence (DL)</Text>
            <Text style={styles.guideMeta}>Vehicles • Form 4 • ₹200 – ₹1,000</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guideCard}
            onPress={() => router.push({ pathname: "/task/[slug]", params: { slug: "passport-renewal" } })}
            accessibilityRole="button"
            accessibilityLabel="Passport Renewal guide"
          >
            <Text style={styles.guideName}>Passport Re-issue & Renewal</Text>
            <Text style={styles.guideMeta}>Travel • Normal / Tatkaal • ₹1,500 – ₹3,500</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "#DBEAFE",
    lineHeight: 20,
    marginBottom: 12,
  },
  freshnessBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  freshnessText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    minHeight: 44,
  },
  stateChipLabel: {
    fontSize: 13,
    color: "#64748B",
    marginRight: 6,
  },
  stateChipValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 24,
    minHeight: 48,
    justifyContent: "center",
  },
  searchPlaceholder: {
    fontSize: 15,
    color: "#94A3B8",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
  },
  cardList: {
    gap: 12,
  },
  guideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 56,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  guideMeta: {
    fontSize: 13,
    color: "#64748B",
  },
});
