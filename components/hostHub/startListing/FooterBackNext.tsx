import React from "react";
import { Text, Dimensions, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("screen");

export default function FooterBackNext({ handlePrev, handleNext, activeSlide, isLastSlide }) {
  return (
    <BlurView
      tint="light"
      intensity={55}
      style={{
        minHeight: height * 0.1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 28,
        paddingHorizontal: width * 0.04,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.85)",
        backgroundColor: "rgba(255,255,255,0.46)",
      }}
    >
      {activeSlide !== 0 ? (
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
          hitSlop={20}
          onPress={handlePrev}
        >
          <MaterialCommunityIcons
            name="chevron-double-left"
            size={22}
            color="#0F172A"
          />
          <Text style={{ color: "#0F172A", fontSize: 16, fontWeight: "600", marginLeft: 6 }}>Back</Text>
        </Pressable>
      ) : <Pressable style={{ width: 72 }} />}

      <Pressable
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 999,
            overflow: "hidden",
          },
        ]}
        hitSlop={20}
        onPress={handleNext}
      >
        <LinearGradient
          colors={["#0F172A", "#334155"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 14,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginRight: 8 }}>
            {isLastSlide ? "Create" : "Next"}
          </Text>
          <MaterialCommunityIcons
            name={isLastSlide ? "check-bold" : "chevron-double-right"}
            size={22}
            color="#fff"
          />
        </LinearGradient>
      </Pressable>
    </BlurView>
  );
}