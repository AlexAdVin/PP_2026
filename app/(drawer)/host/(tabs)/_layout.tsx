import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Tabs, useNavigation, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

function HeaderLeft() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
      <Ionicons name="menu" size={24} color="rgba(255,255,255,0.85)" />
    </TouchableOpacity>
  );
}

function HeaderRight() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push("/profile")} style={styles.headerButton}>
      <Ionicons name="person-outline" size={22} color="rgba(255,255,255,0.85)" />
    </TouchableOpacity>
  );
}

export default function HostTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { position: "absolute" },
        tabBarBackground: () => (
          <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarLabelStyle: { fontSize: 16 },
        headerTransparent: true,
        headerBackground: () => (
          <BlurView tint="dark" intensity={18} style={StyleSheet.absoluteFill} />
        ),
        headerTitleStyle: {
          fontSize: 18,
          color: "rgba(255,255,255,0.85)",
        },
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hosting Hub",
          tabBarLabel: "My Places",
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Host Calendar",
          tabBarLabel: "Calendar",
          tabBarIcon: ({ color, size }) => <FontAwesome name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Reservations",
          tabBarLabel: "Reservations",
          tabBarIcon: ({ color, size }) => <FontAwesome name="calendar" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});