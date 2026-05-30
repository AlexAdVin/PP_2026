import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import styles from "@/components/styles/profile.styles";
export default function ProfilePassport() {
  return (
    <View style={styles.headerContainer}>
      <BlurView intensity={55} tint="light" style={styles.mobilityCard}>
        {/* HEADER */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/profile")}
          style={styles.sectionRow}
        >
          {/* AVATAR */}
          <View style={styles.avatarWrapper}>
            <View style={styles.progressRing}>
              <Image
                source={require("../../assets/img/userImg/profiles/AL.jpg")}
                style={styles.avatar}
              />
            </View>
          </View>
          {/* USER */}
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}> Anne Larsen </Text>
            <Text style={styles.userRole}> Level 8 Eco Driver </Text>
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons
                name="tree-outline"
                size={18}
                color="#22C55E"
              />
              <Text style={styles.heroMetric}> 42 Trees Planted </Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* METRICS */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}> 280 </Text>
            <Text style={styles.metricLabel}> Planet Points </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}> 18 </Text>
            <Text style={styles.metricLabel}> Smart Parks </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}> 12kg </Text>
            <Text style={styles.metricLabel}> CO₂ Saved </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}
