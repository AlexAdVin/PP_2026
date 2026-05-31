import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";

export default function PriceSection({ value, onChange }) {
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
      <TouchableOpacity onPress={() => adjustCount(-1)} style={priceButtonStyle}>
        <Text style={priceButtonText}>-</Text>
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#64748B", fontSize: 12, marginBottom: 6 }}>DKK per hour</Text>
        <TextInput
          value={priceInput}
          onChangeText={handlePriceChange}
          placeholder="e.g. 12.5"
          placeholderTextColor="rgba(15,23,42,0.3)"
          style={priceInputStyle}
          keyboardType="numeric"
          keyboardAppearance="dark"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity onPress={() => adjustCount(1)} style={priceButtonStyle}>
        <Text style={priceButtonText}>+</Text>
      </TouchableOpacity>
    </BlurView>
  );
}

const priceButtonStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#0F172A",
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

const priceButtonText = {
  color: "#fff",
  fontSize: 24,
  fontWeight: "700" as const,
};

const priceInputStyle = {
  minWidth: 120,
  color: "#0F172A",
  fontSize: 34,
  fontWeight: "700" as const,
  textAlign: "center" as const,
};