import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
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

  const locationCount = locations.length;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <LiquidGlassModal heightPercent={0.72} onClose={onClose} onBackdropPress={onClose}>
        <View style={stylesModal.header}>
          <Text style={stylesModal.eyebrow}>Hosting hub</Text>
          <Text style={stylesModal.title}>Choose a place</Text>
          <Text style={stylesModal.subtitle}>Switch the active location to review revenue, reservations, and live controls.</Text>

          <BlurView intensity={35} tint="light" style={stylesModal.summaryCard}>
            <Text style={stylesModal.summaryLabel}>Collection</Text>
            <Text style={stylesModal.summaryValue}>
              {locationCount} {locationCount === 1 ? "location" : "locations"}
            </Text>
            <Text style={stylesModal.summaryMeta}>Private host places curated for the current account.</Text>
          </BlurView>
        </View>

        <View style={stylesModal.listHeader}>
          <Text style={stylesModal.listTitle}>Available places</Text>
          <Text style={stylesModal.listHint}>Tap one to switch context</Text>
        </View>

        <ScrollView
          style={stylesModal.scroll}
          contentContainerStyle={stylesModal.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <BlurView intensity={22} tint="light" style={stylesModal.listShell}>
            {locations.map((item, index) => (
              <View key={item?.id ?? `${index}`} style={stylesModal.listItemWrap}>
                <Text style={stylesModal.itemMeta}>Place {String(index + 1).padStart(2, "0")}</Text>
                <ListingCard
                  showLocationsList
                  item={item}
                  index={index}
                  length={locations.length}
                  onSelectLocation={onSelectLocation}
                />
              </View>
            ))}
          </BlurView>
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
  summaryCard: {
    marginTop: 18,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)",
    backgroundColor: "rgba(255,255,255,0.42)",
    overflow: "hidden",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    letterSpacing: 0.3,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.6,
  },
  summaryMeta: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
  listHeader: {
    paddingHorizontal: width * 0.06,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  listHint: {
    fontSize: 12,
    color: "#64748B",
  },
  scroll: {
    height: height * 0.5,
    paddingHorizontal: width * 0.04,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  listShell: {
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.28)",
    overflow: "hidden",
  },
  listItemWrap: {
    marginVertical: 8,
  },
  itemMeta: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 8,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});