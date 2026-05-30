import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import DiscoveryCard from "./DiscoveryCard";
import FavouriteCard from "./FavouriteCard";

type SearchItem = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type Props = {
  loading: boolean;
  results: SearchItem[];
  showDiscovery: boolean;
  onSelect: (placeId: string, description: string) => void;
  recentSearches: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
  }>;
  favourites: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
  }>;
};

export default function SearchResults({
  loading,
  results,
  showDiscovery,
  onSelect,
  recentSearches,
  favourites,
}: Props) {
  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="small" color="#0F172A" />
      </View>
    );
  }

  if (showDiscovery) {
    return (
      <Animated.ScrollView
        entering={FadeInDown.duration(600)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.discoveryScroll}
      >
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent searches</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Clear</Text>
            </TouchableOpacity>
          </View>

          {recentSearches.map((item) => (
            <DiscoveryCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favourite places</Text>
          <View style={styles.favouriteRow}>
            {favourites.map((item) => (
              <FavouriteCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
              />
            ))}
          </View>
        </View>

        <Animated.View
          style={styles.suggestedCard}
          entering={FadeInDown.duration(600)}
        >
          <LinearGradient
            colors={["#0F172A", "#111827"]}
            style={styles.premiumCard}
          >
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond-outline" size={14} color="#fff" />
              <Text style={styles.premiumBadgeText}>Curated parking</Text>
            </View>

            <Text style={styles.premiumTitle}>Premium host spaces nearby</Text>
            <Text style={styles.premiumText}>
              Hand-picked parking spots with secure access and seamless entry.
            </Text>

            <TouchableOpacity activeOpacity={0.9} style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Explore nearby</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.ScrollView>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.place_id}
      contentContainerStyle={styles.resultsList}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 40)}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelect(item.place_id, item.description)}
          >
            <BlurView intensity={35} tint="light" style={styles.resultCard}>
              <View style={styles.resultIcon}>
                <Ionicons name="location" size={18} color="#0F172A" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>
                  {item.structured_formatting?.main_text || item.description}
                </Text>
                <Text style={styles.resultSubtitle}>
                  {item.structured_formatting?.secondary_text}
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    paddingTop: 30,
    alignItems: "center",
  },

  discoveryScroll: {
    paddingBottom: 120,
  },

  section: {
    marginTop: 18,
    paddingHorizontal: 20,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
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

  favouriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  resultsList: {
    paddingTop: 18,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  resultIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.72)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  resultSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  suggestedCard: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  premiumCard: {
    borderRadius: 34,
    padding: 24,
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  premiumBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  premiumTitle: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    marginTop: 18,
    letterSpacing: -1,
  },

  premiumText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 12,
  },

  premiumButton: {
    marginTop: 24,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
  },

  premiumButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
});
