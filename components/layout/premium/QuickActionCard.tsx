import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type QuickActionCardProps = {
  icon: any;
  label: string;
  subtitle: string;
  onPress?: () => void;
  accent?: string;
};

export default function QuickActionCard({
  icon,
  label,
  subtitle,
  onPress,
  accent = "rgba(255,255,255,0.65)",
}: QuickActionCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.outer}>
      <BlurView intensity={42} tint="light" style={styles.card}>
        <LinearGradient
          colors={[accent, "rgba(255,255,255,0.18)"]}
          style={styles.glow}
        />

        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color="#0F172A" />
        </View>

        <Text style={styles.label}>{label}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 172,
    marginRight: 14,
  },
  card: {
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.72)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 6,
  },
});