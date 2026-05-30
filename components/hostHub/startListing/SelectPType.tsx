import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import stylesBtns from "@/global/style/stylesBtns";

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
          style={[
            stylesBtns.optionBtnWide,
            stylesBtns.glow,
            {
              backgroundColor:
                item.label === type ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
              shadowColor: item.label === type ? "rgba(255,255,255,0.9)" : "#00000000",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={50}
            color={item.label === type ? "#fff" : "rgba(255,255,255,0.5)"}
          />
          <View style={{ flexDirection: "column", flex: 1, paddingHorizontal: 10, justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>{item.label}</Text>
            <Text style={{ color: item.label === type ? "#fff" : "#ccc" }}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}