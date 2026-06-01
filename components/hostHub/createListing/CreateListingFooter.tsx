import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import styles from "@/global/style/styles";

const { width, height } = Dimensions.get("screen");

type CreateListingFooterProps = {
  activeTab: string;
  onBack: () => void;
  onNext: () => void;
};

export default function CreateListingFooter({ activeTab, onBack, onNext }: CreateListingFooterProps) {
  return (
    <BlurView tint="dark" intensity={70} style={localStyles.container}>
      {activeTab !== "Availability" ? (
        <TouchableOpacity style={localStyles.button} activeOpacity={0.75} onPress={onBack}>
          <MaterialIcons name="navigate-before" size={26} color="#fff" />
          <Text style={styles.exText}>Back</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={[localStyles.button, { marginLeft: "auto" }]} activeOpacity={0.75} onPress={onNext}>
        <Text style={styles.exText}>{activeTab === "Facilities" ? "Save" : "Next"}</Text>
        <MaterialCommunityIcons
          name={activeTab === "Facilities" ? "content-save-outline" : "chevron-double-right"}
          size={28}
          color="white"
          style={{ marginRight: width * 0.025 }}
        />
      </TouchableOpacity>
    </BlurView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.06,
    width,
    height: height * 0.1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    marginHorizontal: width * 0.05,
  },
});