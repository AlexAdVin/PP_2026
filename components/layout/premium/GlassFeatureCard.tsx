import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type GlassFeatureCardProps = {
  title: string;
  subtitle: string;
  icon?: any;
  onPress?: () => void;
  alignCenter?: boolean;
  trailingLabel?: string;
  children?: React.ReactNode;
};

export default function GlassFeatureCard({
  title,
  subtitle,
  icon,
  onPress,
  alignCenter = false,
  trailingLabel,
  children,
}: GlassFeatureCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <BlurView intensity={60} tint="light" style={[styles.card, alignCenter && styles.centered]}>
        {icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color="#0F172A" />
          </View>
        ) : null}

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </View>

        {trailingLabel ? <Text style={styles.trailing}>{trailingLabel}</Text> : null}

        {!trailingLabel && onPress ? (
          <Ionicons name="arrow-forward" size={18} color="#0F172A" style={styles.chevron} />
        ) : null}
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: -38,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  centered: {
    alignItems: "center",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: "#475569",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 20,
  },
  trailing: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  chevron: {
    marginLeft: 12,
  },
});