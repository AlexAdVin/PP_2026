import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";

export default function RenderIncrementer({ value, onChange }) {
  const adjustCount = (amount) => {
    const nextValue = Number(value ?? 0) + amount;
    if (nextValue > 0) {
      onChange(nextValue);
    }
  };

  return (
    <BlurView
      intensity={44}
      tint="light"
      style={{
        width: "100%",
        minHeight: 88,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.82)",
        backgroundColor: "rgba(255,255,255,0.42)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
      }}
    >
      <TouchableOpacity onPress={() => adjustCount(-1)} style={counterButtonStyle}>
        <Text style={counterButtonText}>-</Text>
      </TouchableOpacity>

      <Text style={counterValueStyle}>{value}</Text>

      <TouchableOpacity onPress={() => adjustCount(1)} style={counterButtonStyle}>
        <Text style={counterButtonText}>+</Text>
      </TouchableOpacity>
    </BlurView>
  );
}

const counterButtonStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#0F172A",
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

const counterButtonText = {
  color: "#fff",
  fontSize: 24,
  fontWeight: "700" as const,
};

const counterValueStyle = {
  color: "#0F172A",
  fontSize: 36,
  fontWeight: "700" as const,
};