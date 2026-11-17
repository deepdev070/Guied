import React from "react";
import { Tabs } from "expo-router";

/**
 * Bottom Tabs Layout
 * 4 standard citizen portals: Home, Search, My Lists, More.
 * Strict light theme with high-contrast accessibility.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
          color: "#0F172A",
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "India Paperwork Guide",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerTitle: "Search Civic Guides",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "My Lists",
          headerTitle: "My Saved Checklists",
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          headerTitle: "More & Settings",
        }}
      />
    </Tabs>
  );
}
