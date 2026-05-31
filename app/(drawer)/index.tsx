import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import GlassFeatureCard from "@/components/layout/premium/GlassFeatureCard";
import GlassIconButton from "@/components/layout/premium/GlassIconButton";
import PremiumHero from "@/components/layout/premium/PremiumHero";
import PremiumMetricStrip from "@/components/layout/premium/PremiumMetricStrip";
import PremiumScreen from "@/components/layout/premium/PremiumScreen";
import QuickActionCard from "@/components/layout/premium/QuickActionCard";
import SectionHeader from "@/components/layout/premium/SectionHeader";

export default function Landing() {
  const navigation = useNavigation<any>();
  const imageBackground = require("@/assets/img/6232c93f3ccdf.jpg");

  return (
    <PremiumScreen imageBackground={imageBackground}>
      <PremiumHero
        imageSource={imageBackground}
        eyebrow="Copenhagen · Private Hosts"
        title={"Beautiful parking.\nSeamlessly shared."}
        subtitle="Discover curated parking spaces from trusted local hosts across the city."
        topBar={
          <>
            <GlassIconButton onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu" size={22} color="#fff" />
            </GlassIconButton>
            <GlassIconButton onPress={() => router.push("/profile")}>
              <Ionicons name="person-outline" size={22} color="#fff" />
            </GlassIconButton>
          </>
        }
      />

      <View style={styles.metricWrap}>
        <PremiumMetricStrip
          metrics={[
            { value: "240+", label: "Hosts" },
            { value: "4.9", label: "Rating" },
            { value: "24/7", label: "Access" },
          ]}
        />
      </View>

        <Animated.View entering={FadeInDown.duration(600)}></Animated.View>
        <GlassFeatureCard
          icon="search"
          title="Explore parking"
          subtitle="Nearby · Flexible · Instant"
          onPress={() => router.push("/driver/search")}
        />

        <View style={styles.section}>
          <SectionHeader title="Your space" actionLabel="See all" />

          <View style={styles.quickScroll}>
            <QuickActionCard
              icon="compass-outline"
              label="Explore"
              subtitle="Find premium parking"
              onPress={() => router.push("/driver")}
            />

            <QuickActionCard
              icon="car-outline"
              label="Active"
              subtitle="Current sessions"
              onPress={() => console.log("Parking")}
              accent="rgba(219, 234, 254, 0.72)"
            />

            <QuickActionCard
              icon="leaf-outline"
              label="Impact"
              subtitle="CO₂ savings"
              onPress={() => console.log("Impact")}
              accent="rgba(220, 252, 231, 0.72)"
            />

            <QuickActionCard
              icon="home-outline"
              label="Host"
              subtitle="Share your spot"
              onPress={() => router.push("/host")}
              accent="rgba(254, 226, 226, 0.72)"
            />
          </View>
        </View>

        <GlassFeatureCard
          title="Continue parking"
          subtitle="Vesterbro Courtyard · Reserved 2 minutes ago"
          onPress={() => router.push("/driver")}
          trailingLabel="Resume"
        />

        <LinearGradient
          colors={["#DDF5E8", "#F4FBF7", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.impactCard}
        >
          {/* GLOW ORB */}
          <View style={styles.impactGlow} />

          <View style={styles.impactTopRow}>
            <View>
              <Text style={styles.impactEyebrow}>Sustainability impact</Text>

              <Text style={styles.impactTitle}>Your forest is growing 🌲</Text>
            </View>

            <BlurView intensity={40} tint="light" style={styles.impactBadge}>
              <Ionicons name="leaf" size={14} color="#22C55E" />
              <Text style={styles.impactBadgeText}>+12%</Text>
            </BlurView>
          </View>

          <Text style={styles.impactText}>
            One more parking away from planting your next tree.
          </Text>

          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#22C55E", "#4ADE80"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressFill}
              />
            </View>

            <Text style={styles.progressText}>70%</Text>
          </View>

          <View style={styles.impactStats}>
            <View>
              <Text style={styles.impactStatValue}>3</Text>
              <Text style={styles.impactStatLabel}>Trees planted</Text>
            </View>

            <View>
              <Text style={styles.impactStatValue}>2.4kg</Text>
              <Text style={styles.impactStatLabel}>CO₂ offset</Text>
            </View>

            <View>
              <Text style={styles.impactStatValue}>18</Text>
              <Text style={styles.impactStatLabel}>Eco trips</Text>
            </View>
          </View>
        </LinearGradient>

        {/* PREMIUM HOST CARD */}
        <LinearGradient
          colors={["#0F172A", "#111827", "#1E293B"]}
          style={styles.hostCard}
        >
          <View style={styles.hostBadge}>
            <Ionicons name="diamond-outline" size={14} color="#fff" />
            <Text style={styles.hostBadgeText}>Host program</Text>
          </View>

          <Text style={styles.hostTitle}>
            Turn your empty parking into monthly income
          </Text>

          <Text style={styles.hostText}>
            Join trusted homeowners sharing beautiful private parking spaces.
          </Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.hostButton}>
            <Text style={styles.hostButtonText}>Become a host</Text>
          </TouchableOpacity>
        </LinearGradient>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  metricWrap: {
    marginHorizontal: 24,
    marginTop: -38,
  },
  section: {
    marginTop: 34,
    paddingHorizontal: 20,
  },
  quickScroll: {
    flexDirection: "row",
  },

  impactCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 34,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  impactGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
    top: -80,
    right: -40,
  },

  impactTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  impactEyebrow: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  impactTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.8,
  },

  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
  },

  impactBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },

  impactText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 24,
    color: "#475569",
  },

  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },

  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    width: "70%",
    height: "100%",
    borderRadius: 999,
  },

  progressText: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
  },

  impactStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(15,23,42,0.06)",
  },

  impactStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  impactStatLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  /* HOST CARD */

  hostCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 34,
    padding: 24,
  },

  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  hostBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  hostTitle: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    marginTop: 18,
    letterSpacing: -1,
  },

  hostText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 12,
  },

  hostButton: {
    marginTop: 24,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
  },

  hostButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
});
