import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("screen");

export type HostHighlight = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  count: string | number;
  onPress?: () => void;
};

type HostHighlightsGridProps = {
  highlights: HostHighlight[];
};

export default function HostHighlightsGrid({ highlights }: HostHighlightsGridProps) {
  return (
    <View style={stylesBoolElements.highlightsContainer}>
      {highlights.map((highlight) => (
        <TouchableOpacity
          key={highlight.title}
          onPress={highlight.onPress}
          style={stylesBoolElements.highlightCard}
          activeOpacity={0.88}
        >
          <BlurView intensity={45} tint="light" style={stylesBoolElements.highlightGlass}>
            <View style={stylesBoolElements.highlightRow}>
              <View style={stylesBoolElements.iconWrap}>
                <Ionicons name={highlight.icon} size={18} color="#0F172A" />
              </View>
              <Text numberOfLines={1} style={stylesBoolElements.highlightCount}>{highlight.count}</Text>
            </View>
            <Text style={stylesBoolElements.highlightTitle}>{highlight.title}</Text>
          </BlurView>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const stylesBoolElements = StyleSheet.create({
  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  highlightCard: {
    width: width * 0.43,
    marginTop: width * 0.035,
    borderRadius: 24,
    overflow: "hidden",
  },
  highlightGlass: {
    borderRadius: 24,
    padding: 14,
    minHeight: 106,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.82)",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightCount: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: "auto",
  },
  highlightTitle: {
    color: "#334155",
    fontSize: 14,
    flexShrink: 1,
    marginTop: 18,
  },
});