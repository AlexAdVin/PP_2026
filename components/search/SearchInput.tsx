import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  query: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchInput({
  query,
  onChangeText,
  onFilterPress,
  placeholder = "Search destination",
  autoFocus = false,
}: Props) {
  return (
    <BlurView intensity={45} tint="light" style={styles.searchContainer}>
      <View style={styles.searchInner}>
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={18} color="#0F172A" />
        </View>

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={query}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          underlineColorAndroid="transparent"
        />

        <TouchableOpacity activeOpacity={0.8} onPress={onFilterPress}>
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
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.18)",
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
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "500",

    paddingVertical: 0, // fixes Android clipping
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

/* const styles = StyleSheet.create({
  searchContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.18)",
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
    color: "#0F172A",
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
}); */
