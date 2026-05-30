import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import styles from "@/components/styles/layout.styles";
type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};
export default function HeroHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: Props) {
  return (
    <View style={styles.hero}>
      <LinearGradient
        colors={["#0F172A", "#111827", "#1E293B"]}
        style={styles.heroGradient}
      >
        {/* TOP */}
        <View style={styles.topRow}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
            <BlurView intensity={30} tint="dark" style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <BlurView intensity={30} tint="dark" style={styles.cityPill}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.cityText}> Copenhagen </Text>
          </BlurView>
        </View>
        {/* CONTENT */}
        <View style={styles.heroContent}>
          {eyebrow && <Text style={styles.heroEyebrow}> {eyebrow} </Text>}
          {title && <Text style={styles.heroTitle}> {title} </Text>}
          {subtitle && <Text style={styles.heroSubtitle}> {subtitle} </Text>}
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}
