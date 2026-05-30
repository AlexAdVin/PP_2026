import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  useColorScheme,
} from "react-native";

import { BlurView } from "expo-blur";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import profileStyles from "@/components/styles/profile.styles";

const { width } = Dimensions.get("window");

const CustomDrawer = (props) => {
  const router = useRouter();
  const scheme = useColorScheme();

  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#111315" : "#F3F2EE",

    card: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)",

    cardBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",

    primaryText: isDark ? "#F5F5F5" : "#171717",

    secondaryText: isDark ? "rgba(255,255,255,0.48)" : "rgba(23,23,23,0.52)",

    accent: "#7C8B7A",
    accentSoft: "rgba(124,139,122,0.12)",

    shadow: isDark ? "#000000" : "#CFD5DB",
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}
      <View style={profileStyles.headerContainer}>
        <BlurView
          intensity={55}
          tint={isDark ? "dark" : "light"}
          style={[
            profileStyles.mobilityCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {/* center content */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/profile")}
            style={profileStyles.sectionRow}
          >
            {/* avatar + ring */}
            <View style={profileStyles.avatarWrapper}>
              <View
                style={[
                  profileStyles.progressRing,
                  {
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Image
                  source={require("../../assets/img/userImg/profiles/AL.jpg")}
                  style={profileStyles.avatar}
                />
              </View>
            </View>

            {/* user content */}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  profileStyles.userName,
                  {
                    color: colors.primaryText,
                  },
                ]}
              >
                Anne Larsen
              </Text>

              <Text
                style={[
                  profileStyles.userRole,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Level 8 Eco Driver
              </Text>

              {/* hero metric */}
              <View style={profileStyles.sectionRow}>
                <MaterialCommunityIcons
                  name="tree-outline"
                  size={18}
                  color={colors.accent}
                />

                <Text
                  style={[
                    profileStyles.heroMetric,
                    {
                      color: colors.primaryText,
                    },
                  ]}
                >
                  42 Trees Planted
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* metrics */}
          <View style={profileStyles.metricsGrid}>
            {/* Stants 1 - Planet Points */}
            <View
              style={[
                profileStyles.metricCard,
                {
                  backgroundColor: colors.accentSoft,
                },
              ]}
            >
              <Text
                style={[
                  profileStyles.metricValue,
                  {
                    color: colors.primaryText,
                  },
                ]}
              >
                280
              </Text>

              <Text
                style={[
                  profileStyles.metricLabel,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Planet Points
              </Text>
            </View>
            {/* Stants 2 - Smart Parks */}
            <View
              style={[
                profileStyles.metricCard,
                {
                  backgroundColor: colors.accentSoft,
                },
              ]}
            >
              <Text
                style={[
                  profileStyles.metricValue,
                  {
                    color: colors.primaryText,
                  },
                ]}
              >
                18
              </Text>

              <Text
                style={[
                  profileStyles.metricLabel,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                Smart Parks
              </Text>
            </View>
            {/* Stants 3 - CO₂ Saved */}
            <View
              style={[
                profileStyles.metricCard,
                {
                  backgroundColor: colors.accentSoft,
                },
              ]}
            >
              <Text
                style={[
                  profileStyles.metricValue,
                  {
                    color: colors.primaryText,
                  },
                ]}
              >
                12kg
              </Text>

              <Text
                style={[
                  profileStyles.metricLabel,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                CO₂ Saved
              </Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* NAVIGATION */}
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        <BlurView
          intensity={45}
          tint={isDark ? "dark" : "light"}
          style={[
            {
              flex: 1,
              paddingTop: 10,
              marginTop: -40,
            },
          ]}
        >
          <DrawerItemList {...props} />
        </BlurView>
      </DrawerContentScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Feather name="log-out" size={17} color={colors.secondaryText} />

          <Text
            style={[
              styles.logoutText,
              {
                color: colors.primaryText,
              },
            ]}
          >
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 72 : 52,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  mobilityCard: {
    borderRadius: 34,
    borderWidth: 1,
    overflow: "hidden",
    padding: 22,

    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 4,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    marginRight: 18,
  },

  progressRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 50,
  },

  userName: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.5,
  },

  userRole: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },

  heroMetric: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },

  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },

  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },

  footer: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },

  logoutButton: {
    height: 56,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
