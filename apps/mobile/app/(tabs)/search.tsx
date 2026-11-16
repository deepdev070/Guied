import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

/**
 * Mobile Search Screen
 * Allows fast lookup of Indian citizen paperwork guides.
 */
export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Type document name (e.g. driving licence, PAN)..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search input"
        />
      </View>

      <View style={styles.suggestions}>
        <Text style={styles.sectionHeader}>Common Citizen Searches</Text>
        {["driving-licence-learner", "driving-licence-new", "passport-renewal"].map((slug) => (
          <TouchableOpacity
            key={slug}
            style={styles.suggestionItem}
            onPress={() => router.push({ pathname: "/task/[slug]", params: { slug } })}
            accessibilityRole="button"
          >
            <Text style={styles.suggestionText}>
              🔍 {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
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
  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    minHeight: 48,
  },
  input: {
    fontSize: 16,
    color: "#0F172A",
  },
  suggestions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    minHeight: 44,
    justifyContent: "center",
  },
  suggestionText: {
    fontSize: 15,
    color: "#0F172A",
  },
});
