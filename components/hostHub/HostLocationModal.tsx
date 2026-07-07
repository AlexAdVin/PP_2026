import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import ListingCard from "@/components/hostHub/ListingCard";
import LiquidGlassModal from "@/components/modals/LiquidGlassModal";

const { height, width } = Dimensions.get("screen");

type HostLocationModalProps = {
  visible: boolean;
  locations: any[];
  onClose: () => void;
  onSelectLocation: (index: number) => void;
};

export default function HostLocationModal({
  visible,
  locations,
  onClose,
  onSelectLocation,
}: HostLocationModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <LiquidGlassModal
        heightPercent={0.68}
        onClose={onClose}
        onBackdropPress={onClose}
        titleSlot={(
          <View style={stylesModal.header}>
            <Text style={stylesModal.eyebrow}>Hosting hub</Text>
            <Text style={stylesModal.title}>Choose a place</Text>
            <Text style={stylesModal.subtitle}>Switch the active location to review revenue, reservations, and live controls.</Text>
          </View>
        )}
      >

        <ScrollView
          style={{ height: height * 0.52, paddingHorizontal: width * 0.04 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {locations.map((item, index) => (
            <ListingCard
              key={item?.id ?? `${index}`}
              showLocationsList
              item={item}
              index={index}
              length={locations.length}
              onSelectLocation={onSelectLocation}
            />
          ))}
        </ScrollView>
      </LiquidGlassModal>
    </View>
  );
}

const stylesModal = StyleSheet.create({
  header: {
    paddingHorizontal: width * 0.06,
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.4,
    color: "rgba(15,23,42,0.55)",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginTop: 8,
  },
});