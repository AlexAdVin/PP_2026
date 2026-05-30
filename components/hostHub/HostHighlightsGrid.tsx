import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import stylesBtns from "@/global/style/stylesBtns";

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
    <View style={[stylesBoolElements.highlightsContainer, stylesBtns.glow]}>
      {highlights.map((highlight) => (
        <TouchableOpacity
          key={highlight.title}
          onPress={highlight.onPress}
          style={stylesBoolElements.highlightCard}
        >
          <View style={stylesBoolElements.highlightRow}>
            <Ionicons name={highlight.icon} size={24} color="rgba(0,0,0,0.75)" />
            <Text style={stylesBoolElements.highlightCount}>{highlight.count}</Text>
          </View>
          <Text style={stylesBoolElements.highlightTitle}>{highlight.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const stylesBoolElements = StyleSheet.create({
  highlightsContainer: {
    padding: width * 0.05,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
  },
  highlightCard: {
    width: width * 0.43,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: width * 0.035,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  highlightCount: {
    color: "#000",
    fontSize: 18,
    marginLeft: "auto",
  },
  highlightTitle: {
    color: "#000",
    fontSize: 16,
    flexShrink: 1,
    marginVertical: width * 0.01,
  },
});