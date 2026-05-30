import React from "react";
import { View, Text } from "react-native";
import { Entypo } from "@expo/vector-icons";

const bulletPoints = [
  "Share your parking and earn money",
  "It is free of charge to host",
  "You decide when and how you share",
];

export default function BulletPoints() {
  return (
    <>
      {bulletPoints.map((bullet) => (
        <View
          key={bullet}
          style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
        >
          <Entypo
            name="dot-single"
            size={24}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 16, color: "white" }}>{bullet}</Text>
        </View>
      ))}
    </>
  );
}