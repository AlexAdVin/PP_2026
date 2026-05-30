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

export default function FavouriteCard({
  title,
  subtitle,
  icon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.favouriteCard}
    >
      <BlurView intensity={35} tint="light" style={styles.favouriteBlur}>
        <View style={styles.favouriteIcon}>
          <Ionicons name={icon} size={18} color="#0F172A" />
        </View>

        <Text style={styles.favouriteTitle}>{title}</Text>
        <Text style={styles.favouriteSubtitle}>{subtitle}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  favouriteCard: {
    width: "48%",
    marginBottom: 14,
  },

  favouriteBlur: {
    borderRadius: 30,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  favouriteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.82)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  favouriteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  favouriteSubtitle: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
  },
});
