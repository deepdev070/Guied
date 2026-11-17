import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Root Application Layout
 * Enforces strict Light Theme across all screens and navigators.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#2563EB",
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#0F172A",
          },
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="task/[slug]"
          options={{
            title: "Civic Guide",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{
            title: "Category",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

