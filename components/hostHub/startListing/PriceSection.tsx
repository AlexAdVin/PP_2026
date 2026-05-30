import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import stylesBtns from "@/global/style/stylesBtns";
import stylesStartListing from "@/global/style/stylesStartListing";

const COLORS = { primary: "#2825", white: "#fff" };

export default function PriceSection({ value, onChange }) {
  const startListingStyles = stylesStartListing({ COLORS });
  const [priceInput, setPriceInput] = useState(String(value ?? 25));

  useEffect(() => {
    setPriceInput(String(value ?? 25));
  }, [value]);

  const adjustCount = (amount) => {
    const nextValue = Number.parseFloat(priceInput.replace(",", ".")) || 0;
    if (nextValue + amount > 0) {
      setPriceInput(String(nextValue + amount));
      onChange(nextValue + amount);
    }
  };

  const handlePriceChange = (text) => {
    const sanitized = text.replace(",", ".");
    setPriceInput(sanitized);
    const nextValue = Number.parseFloat(sanitized);
    if (!Number.isNaN(nextValue)) {
      onChange(nextValue);
    }
  };

  return (
    <View style={[stylesBtns.optionBtnWide, { alignItems: "center" }]}> 
      <TouchableOpacity onPress={() => adjustCount(-1)} style={[startListingStyles.button, stylesBtns.glow]}>
        <Text style={startListingStyles.buttonText}>-</Text>
      </TouchableOpacity>

      <TextInput
        value={priceInput}
        onChangeText={handlePriceChange}
        placeholder="e.g. 12.5"
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={startListingStyles.txtIncrementer}
        keyboardType="numeric"
        keyboardAppearance="dark"
      />

      <TouchableOpacity onPress={() => adjustCount(1)} style={[startListingStyles.button, stylesBtns.glow]}>
        <Text style={startListingStyles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}