import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  onPress?: () => void;
};

export default function DiscoveryCard({
  title,
  subtitle,
  icon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <BlurView intensity={30} tint="light" style={styles.discoveryCard}>
        <View style={styles.discoveryIcon}>
          <Ionicons name={icon} size={18} color="#0F172A" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.discoveryTitle}>{title}</Text>
          <Text style={styles.discoverySubtitle}>{subtitle}</Text>
        </View>

        <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  discoveryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  discoveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  discoveryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  discoverySubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },
});
