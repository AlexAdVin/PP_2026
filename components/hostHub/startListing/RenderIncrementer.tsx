import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import stylesBtns from "@/global/style/stylesBtns";
import stylesStartListing from "@/global/style/stylesStartListing";

const COLORS = { primary: "#2825", white: "#fff" };

export default function RenderIncrementer({ value, onChange }) {
  const startListingStyles = stylesStartListing({ COLORS });

  const adjustCount = (amount) => {
    const nextValue = Number(value ?? 0) + amount;
    if (nextValue > 0) {
      onChange(nextValue);
    }
  };

  return (
    <View style={[stylesBtns.optionBtnWide, { alignItems: "center" }]}>
      <TouchableOpacity onPress={() => adjustCount(-1)} style={[startListingStyles.button, stylesBtns.glow]}>
        <Text style={startListingStyles.buttonText}>-</Text>
      </TouchableOpacity>

      <Text style={startListingStyles.txtIncrementer}>{value}</Text>

      <TouchableOpacity onPress={() => adjustCount(1)} style={[startListingStyles.button, stylesBtns.glow]}>
        <Text style={startListingStyles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}