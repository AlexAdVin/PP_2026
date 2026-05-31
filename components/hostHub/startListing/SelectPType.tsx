import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const parkingTypes = [
  {
    id: 0,
    icon: "vector-square-open",
    label: "Open space",
    description: "Outdoor parking",
  },
  {
    id: 1,
    icon: "garage-open-variant",
    label: "Car port",
    description: "Outdoor parking with a roof",
  },
  {
    id: 2,
    icon: "garage-variant",
    label: "Garage",
    description: "Indoor parking enclosed",
  },
  {
    id: 3,
    icon: "garage-variant-lock",
    label: "Secured garage",
    description: "Indoor parking with secured access",
  },
];

export default function SelectPType({ type, onChange }) {
  return (
    <>
      {parkingTypes.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onChange(item.label)}
          style={{ marginBottom: 14, borderRadius: 26, overflow: "hidden" }}
        >
          <BlurView
            intensity={44}
            tint="light"
            style={{
              minHeight: 94,
              paddingHorizontal: 18,
              paddingVertical: 18,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: item.label === type ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
              backgroundColor: item.label === type ? "rgba(255,255,255,0.54)" : "rgba(255,255,255,0.34)",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={item.label === type ? ["rgba(226,232,240,0.82)", "rgba(255,255,255,0.22)"] : ["rgba(255,255,255,0.42)", "rgba(255,255,255,0.12)"]}
              style={{ position: "absolute", inset: 0 }}
            />
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: item.label === type ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.86)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={28}
                color={item.label === type ? "#fff" : "#0F172A"}
              />
            </View>
            <View style={{ flexDirection: "column", flex: 1, paddingHorizontal: 14, justifyContent: "center" }}>
              <Text style={{ color: "#0F172A", fontSize: 18, fontWeight: "700" }}>{item.label}</Text>
              <Text style={{ color: "#475569", marginTop: 4 }}>{item.description}</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      ))}
    </>
  );
}