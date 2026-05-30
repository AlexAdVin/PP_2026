// app/driver/index.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useLocationStore } from "../../../src/store";

const { width, height } = Dimensions.get("window");

const RECENT_SEARCHES = [
  {
    id: "1",
    title: "Nyhavn Harbour",
    subtitle: "Copenhagen",
    icon: "time-outline",
  },
  {
    id: "2",
    title: "Vesterbro Courtyard",
    subtitle: "Private host parking",
    icon: "star-outline",
  },
];

const FAVOURITES = [
  {
    id: "1",
    title: "Home",
    subtitle: "Østerbro",
    icon: "home-outline",
  },
  {
    id: "2",
    title: "Office",
    subtitle: "Christianshavn",
    icon: "briefcase-outline",
  },
];

export default function SearchScreen() {
  const apiMaps = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const isPlaceSelected = useRef(false);

  const setDestinationDetails = useLocationStore(
    (state) => state.setDestinationDetails,
  );

  /* FETCH WITH DEBOUNCE */

  const fetchPlaces = useCallback(async () => {
    if (query.length > 2 && !isPlaceSelected.current) {
      setLoading(true);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${apiMaps}`,
        );

        const data = await response.json();

        setResults(data.predictions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const debounce = setTimeout(fetchPlaces, 350);

    return () => clearTimeout(debounce);
  }, [query, fetchPlaces]);

  /* SELECT PLACE */

  const handleSelectPlace = useCallback(
    async (placeId: string, description: string) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiMaps}`,
        );

        const details = await response.json();

        setDestinationDetails({
          location: details.result.geometry.location,
          viewport: details.result.geometry.viewport,
          description,
        });

        isPlaceSelected.current = true;
        setQuery(description);
        setResults([]);

        /* MODERN TRANSITION TO MAP / RESULTS */
        router.replace("/driver");
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );

  const handleChangeText = (text: string) => {
    isPlaceSelected.current = false;
    setQuery(text);
  };

  const showDiscovery = useMemo(() => {
    return query.length === 0;
  }, [query]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* BACKGROUND */}
      <LinearGradient
        colors={["#EEF2F5", "#fcf8f8", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      {/* HERO */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
        <LinearGradient
          colors={["#0F172A", "#111827", "#1E293B"]}
          style={styles.heroGradient}
        >
          {/* TOP ROW - back button */}
          <View style={styles.topRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
              <BlurView intensity={30} tint="dark" style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* TITLE */}
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>PARKINGPLANET</Text>

            <Text style={styles.heroTitle}>
              Where would{"\n"}you like to park?
            </Text>

            <Text style={styles.heroSubtitle}>
              Discover premium private parking spaces from trusted local hosts.
            </Text>
          </View>

          {/* SEARCH */}
          <BlurView intensity={45} tint="light" style={styles.searchContainer}>
            <View style={styles.searchInner}>
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={18} color="#0F172A" />
              </View>

              <TextInput
                placeholder="Search destination"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={query}
                onChangeText={handleChangeText}
                autoFocus
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/driver/filter")}
              >
                <View style={styles.filterButton}>
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={18}
                    color="#0F172A"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      {/* RESULTS */}
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color="#0F172A"
            style={{ marginTop: 30 }}
          />
        )}

        {/* GOOGLE RESULTS */}
        {!showDiscovery && (
          <FlatList
            data={results}
            keyExtractor={(item: any) => item.place_id}
            contentContainerStyle={{
              paddingTop: 18,
              paddingBottom: 120,
            }}
            renderItem={({ item, index }: any) => (
              <Animated.View entering={FadeInDown.delay(index * 40)}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    handleSelectPlace(item.place_id, item.description)
                  }
                >
                  <BlurView
                    intensity={35}
                    tint="light"
                    style={styles.resultCard}
                  >
                    <View style={styles.resultIcon}>
                      <Ionicons name="location" size={18} color="#0F172A" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultTitle}>
                        {item.structured_formatting?.main_text ||
                          item.description}
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
        )}

        {/* DISCOVERY STATE */}
        {showDiscovery && (
          <Animated.ScrollView
            entering={FadeInDown.duration(600)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 120,
            }}
          >
            {/* RECENTS */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recent searches</Text>

                <Text style={styles.sectionAction}>Clear</Text>
              </View>

              {RECENT_SEARCHES.map((item) => (
                <DiscoveryCard
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
                />
              ))}
            </View>

            {/* FAVOURITES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Favourite places</Text>

              <View style={styles.favouriteRow}>
                {FAVOURITES.map((item) => (
                  <FavouriteCard
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    icon={item.icon}
                  />
                ))}
              </View>
            </View>

            {/* SUGGESTED */}
            <LinearGradient
              colors={["#0F172A", "#111827"]}
              style={styles.premiumCard}
            >
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond-outline" size={14} color="#fff" />

                <Text style={styles.premiumBadgeText}>Curated parking</Text>
              </View>

              <Text style={styles.premiumTitle}>
                Premium host spaces nearby
              </Text>

              <Text style={styles.premiumText}>
                Hand-picked parking spots with secure access and seamless entry.
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.premiumButton}
              >
                <Text style={styles.premiumButtonText}>Explore nearby</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.ScrollView>
        )}
      </View>
    </View>
  );
}

/* DISCOVERY CARD */

function DiscoveryCard({ title, subtitle, icon }: any) {
  return (
    <TouchableOpacity activeOpacity={0.85}>
      <BlurView intensity={30} tint="light" style={styles.discoveryCard}>
        <View style={styles.discoveryIcon}>
          <Ionicons name={icon} size={18} color="#0F172A" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.discoveryTitle}>{title}</Text>

          <Text style={styles.discoverySubtitle}>{subtitle}</Text>
        </View>

        <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
      </BlurView>
    </TouchableOpacity>
  );
}

/* FAVOURITE CARD */

function FavouriteCard({ title, subtitle, icon }: any) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.favouriteCard}>
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
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  hero: {
    height: height * 0.38,
  },

  heroGradient: {
    flex: 1,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    paddingTop: 58,
    paddingHorizontal: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    gap: 6,
  },

  cityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  heroContent: {
    marginTop: 34,
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -1.3,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 14,
    width: "90%",
  },

  searchContainer: {
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    position: "absolute",
    left: 20,
    right: 20,
    bottom: -28,
  },

  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  searchIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.82)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.82)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 18,
  },

  section: {
    marginTop: 18,
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

  discoveryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  discoveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  discoveryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  discoverySubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  favouriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  favouriteCard: {
    width: width * 0.43,
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

  premiumCard: {
    marginTop: 30,
    borderRadius: 34,
    padding: 24,
    marginBottom: 80,
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
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
});
