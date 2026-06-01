import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("screen");

type CreateListingTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const tabs = ["Availability", "Facilities"];

export default function CreateListingTabs({ activeTab, setActiveTab }: CreateListingTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
          onPress={() => setActiveTab(tab)}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    width,
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
  },
  tabLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
  activeTabLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});