import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  StatusBar,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import AmbientBackground from "@/components/layout/AmbientBackground";

const { height } = Dimensions.get("window");

export default function Landing() {
  const navigation = useNavigation<any>();
  const imageBackground = require("@/assets/img/6232c93f3ccdf.jpg");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#EEF2F5", "#F8FAFC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground imageBackground={imageBackground} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={imageBackground}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <LinearGradient
              colors={[
                "rgba(15,23,42,0.10)",
                "rgba(15,23,42,0.25)",
                "rgba(15,23,42,0.78)",
              ]}
              style={StyleSheet.absoluteFill}
            />

            {/* TOP BAR */}
            {/*             <View style={styles.heroTopRow}>
              <BlurView intensity={30} tint="dark" style={styles.topPill}>
                <Ionicons name="sparkles" size={14} color="#fff" />
                <Text style={styles.topPillText}>Premium Parking</Text>
              </BlurView>

              <BlurView intensity={30} tint="dark" style={styles.profileBtn}>
                <Ionicons name="person-outline" size={18} color="#fff" />
              </BlurView>
            </View> */}

            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.glassBtn}
                onPress={() => navigation.openDrawer()}
              >
                <Ionicons name="menu" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.glassBtn}
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="person-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>Copenhagen · Private Hosts</Text>

              <Text style={styles.heroTitle}>
                Beautiful parking.{"\n"}
                Seamlessly shared.
              </Text>

              <Text style={styles.heroSubtitle}>
                Discover curated parking spaces from trusted local hosts across
                the city.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* FLOATING STATS */}
        {/*         <BlurView intensity={50} tint="light" style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>240+</Text>
            <Text style={styles.statLabel}>Hosts</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Access</Text>
          </View>
        </BlurView> */}

        <Animated.View entering={FadeInDown.duration(600)}></Animated.View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/driver/search")}
        >
          <BlurView
            intensity={60}
            tint="light"
            style={{ ...styles.statsCard, alignItems: "center" }}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="search" size={18} color="#0F172A" />
            </View>

            <View>
              <Text style={styles.ctaTitle}>Explore parking</Text>
              <Text style={styles.ctaSub}>Nearby · Flexible · Instant</Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#0F172A"
              style={{ marginLeft: "auto" }}
            />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Your space</Text>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScroll}
          >
            <QuickAction
              icon="compass-outline"
              label="Explore"
              subtitle="Find premium parking"
              onPress={() => router.push("/driver")}
            />

            <QuickAction
              icon="car-outline"
              label="Active"
              subtitle="Current sessions"
              onPress={() => console.log("Parking")}
            />

            <QuickAction
              icon="leaf-outline"
              label="Impact"
              subtitle="CO₂ savings"
              onPress={() => console.log("Impact")}
            />

            <QuickAction
              icon="home-outline"
              label="Host"
              subtitle="Share your spot"
              onPress={() => router.push("/host")}
            />
          </ScrollView>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/driver")}
        >
          <BlurView intensity={40} tint="light" style={styles.continueCard}>
            <View>
              <Text style={styles.continueEyebrow}>Continue parking</Text>

              <Text style={styles.continueTitle}>Vesterbro Courtyard</Text>

              <Text style={styles.continueSubtitle}>
                Reserved 2 minutes ago
              </Text>
            </View>

            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={18} color="#0F172A" />
            </View>
          </BlurView>
        </TouchableOpacity>

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
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, subtitle, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.quickOuter}
    >
      <BlurView intensity={40} tint="light" style={styles.quickCard}>
        <LinearGradient
          colors={["rgba(255,255,255,0.65)", "rgba(255,255,255,0.25)"]}
          style={styles.quickGlow}
        />

        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color="#0F172A" />
        </View>

        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={styles.quickSub}>{subtitle}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scroll: {
    paddingBottom: 140,
  },

  heroWrapper: {
    height: height * 0.45,
  },

  heroImage: {
    flex: 1,
  },

  heroImageStyle: {
    borderRadius: 10,
  },

  topBar: {
    marginTop: 60,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  glassBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  heroContent: {
    padding: 24,
    marginTop: "auto",
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.4,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -1.4,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
    width: "92%",
    fontWeight: "400",
  },

  metricWrap: {
    marginHorizontal: 24,
    marginTop: -38,
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: -38,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  ctaTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaSub: {
    color: "#475569",
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginTop: 34,
    paddingHorizontal: 20,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.8,
  },
  sectionAction: {
    color: "#64748B",
    fontWeight: "600",
  },
  quickScroll: {
    paddingRight: 20,
  },
  quickOuter: {
    width: 180,
    marginRight: 14,
  },
  quickCard: {
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  quickGlow: {
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
  quickLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  quickSub: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 6,
  },
  continueCard: {
    marginHorizontal: 20,
    marginTop: 10,
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
