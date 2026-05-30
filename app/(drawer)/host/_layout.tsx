import React from "react";
import { Stack } from "expo-router";

export default function HostStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
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