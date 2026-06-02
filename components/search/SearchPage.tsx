import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";

import { useLocationStore } from "@/src/store";
import { authSearchGateAdapter } from "@/src/adapters/authSearchGateAdapter";
import AmbientBackground from "@/components/layout/AmbientBackground";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { useAuthStore } from "@/src/store/authStore";

const { height } = Dimensions.get("window");

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

export default function SearchPage() {
  const apiMaps = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isPlaceSelected = useRef(false);

  const setDestinationDetails = useLocationStore(
    (state) => state.setDestinationDetails,
  );
  const session = useAuthStore((state) => state.session);
  const openAuthModal = useAuthStore((state) => state.openModal);
  const setPendingSearch = useAuthStore((state) => state.setPendingSearch);
  const pendingSearch = useAuthStore((state) => state.pendingSearch);
  const clearPendingSearch = useAuthStore((state) => state.clearPendingSearch);

  const completeSearch = useCallback(
    async (placeId: string, description: string) => {
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
      router.replace("/driver");
    },
    [apiMaps, setDestinationDetails],
  );

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
  }, [query, apiMaps]);

  useEffect(() => {
    const debounce = setTimeout(fetchPlaces, 350);
    return () => clearTimeout(debounce);
  }, [query, fetchPlaces]);

  const handleSelectPlace = useCallback(
    async (placeId: string, description: string) => {
      try {
        if (!session) {
          const gate = await authSearchGateAdapter.recordSearchAttempt();

          if (!gate.allowed) {
            setPendingSearch({ placeId, description });
            openAuthModal("search-limit");
            return;
          }
        }

        await completeSearch(placeId, description);
      } catch (error) {
        console.error(error);
      }
    },
    [completeSearch, openAuthModal, session, setPendingSearch],
  );

  useEffect(() => {
    if (!session || !pendingSearch) {
      return;
    }

    void completeSearch(pendingSearch.placeId, pendingSearch.description).finally(
      clearPendingSearch,
    );
  }, [clearPendingSearch, completeSearch, pendingSearch, session]);

  const handleChangeText = (text: string) => {
    isPlaceSelected.current = false;
    setQuery(text);
  };

  const showDiscovery = useMemo(() => query.length === 0, [query]);

return (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" />

    <LinearGradient
      colors={["#EEF2F5", "#fcf8f8", "#FFFFFF"]}
      style={StyleSheet.absoluteFill}
    />

    <AmbientBackground
      imageBackground={require("@/assets/img/6232c93f3ccdf.jpg")}
    />

    <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
      <LinearGradient
        colors={["#0F172A", "#111827", "#1E293B"]}
        style={styles.heroGradient}
      >
        <View style={styles.topRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
            <BlurView intensity={30} tint="dark" style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>PARKINGPLANET</Text>

          <Text style={styles.heroTitle}>Where would you like to park?</Text>

          <Text style={styles.heroSubtitle}>
            Discover premium private parking spaces from trusted local hosts.
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>

    {/* SEARCH INPUT */}
    <View style={styles.searchWrapper}>
      <SearchInput
        query={query}
        onChangeText={handleChangeText}
        onFilterPress={() => router.push("/driver/filter")}
        autoFocus
      />
    </View>

    <View style={styles.content}>
      <SearchResults
        loading={loading}
        results={results}
        showDiscovery={showDiscovery}
        onSelect={handleSelectPlace}
        recentSearches={RECENT_SEARCHES}
        favourites={FAVOURITES}
      />
    </View>
  </View>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  hero: {
    height: height * 0.34,
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

  searchWrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    top: height * 0.29,

    zIndex: 1000,
    elevation: 1000,
  },

  content: {
    flex: 1,
    paddingTop: 70,
  },
});

/* const styles = StyleSheet.create({
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
  content: {
    flex: 1,
  },
});
 */