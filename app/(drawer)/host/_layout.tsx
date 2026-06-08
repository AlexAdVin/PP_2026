import React from "react";
import { Stack } from "expo-router";

export default function HostStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth-intro" />
      <Stack.Screen name="start-listing-intro" />
      <Stack.Screen name="start-listing" />
      <Stack.Screen name="create-listing-intro" />
      <Stack.Screen name="create-listing" />
      <Stack.Screen
        name="update-avl"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}