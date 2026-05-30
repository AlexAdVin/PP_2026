import React from "react";
import { Text, Dimensions, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import styles from "@/global/style/styles";
import stylesBtns from "@/global/style/stylesBtns";

const { width, height } = Dimensions.get("screen");

export default function FooterBackNext({ handlePrev, handleNext, activeSlide }) {
  return (
    <BlurView
      tint="dark"
      intensity={70}
      style={{
        height: height * 0.12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {activeSlide !== 0 ? (
        <Pressable
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 5,
            borderRadius: 10,
            marginHorizontal: width * 0.05,
          }}
          hitSlop={20}
          onPress={handlePrev}
        >
          <MaterialCommunityIcons
            name="chevron-double-left"
            size={28}
            color="white"
            style={{ marginLeft: width * 0.025 }}
          />
          <Text style={styles.exText}>Back</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={[
          stylesBtns.glow,
          {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.7)",
            marginLeft: "auto",
            marginVertical: 5,
            borderRadius: 10,
            marginHorizontal: width * 0.05,
          },
        ]}
        hitSlop={20}
        onPress={handleNext}
      >
        <Text style={styles.exText}>{activeSlide === 4 ? "Create" : "Next"}</Text>
        <MaterialCommunityIcons
          name={activeSlide === 4 ? "check-bold" : "chevron-double-right"}
          size={28}
          color="white"
          style={{ marginRight: width * 0.025 }}
        />
      </Pressable>
    </BlurView>
  );
}