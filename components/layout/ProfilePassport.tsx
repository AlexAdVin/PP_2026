import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import styles from "@/components/styles/profile.styles";
import { useAuthStore } from "@/src/store/authStore";

export default function ProfilePassport() {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  const displayName = profile?.displayName ?? "Guest driver";
  const secondaryLabel = session ? "Authenticated with Supabase" : "Browse mode";

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
            <Text style={styles.userName}> {displayName} </Text>
            <Text style={styles.userRole}> {secondaryLabel} </Text>
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons
                name="tree-outline"
                size={18}
                color="#22C55E"
              />
              <Text style={styles.heroMetric}>
                {session ? ` ${profile?.authProvider ?? "phone"} account ` : " Sign in to sync rewards "}
              </Text>
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
