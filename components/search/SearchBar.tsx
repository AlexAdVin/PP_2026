import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SearchBar() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push("/driver/search")}
      style={styles.touchable}
    >
      <BlurView intensity={65} tint="light" style={styles.searchContainer}>
        <View style={styles.searchInner}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={18} color="#0F172A" />
          </View>

          <Text style={styles.placeholder}>Search destination</Text>

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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
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
});
