import React from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type ContinueActionCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ContinueActionCard({
  eyebrow,
  title,
  subtitle,
  onPress,
  style,
}: ContinueActionCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={style}>
      <BlurView intensity={40} tint="light" style={styles.continueCard}>
        <View>
          <Text style={styles.continueEyebrow}>{eyebrow}</Text>
          <Text style={styles.continueTitle}>{title}</Text>
          <Text style={styles.continueSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  continueCard: {
    borderRadius: 30,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  continueEyebrow: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },
  continueTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  continueSubtitle: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});