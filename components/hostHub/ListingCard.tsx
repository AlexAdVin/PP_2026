import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

type ListingCardProps = {
  length: number;
  item: any;
  index?: number;
  showLocationsList?: boolean;
  onOpenLocations?: () => void;
  onSelectLocation?: (index: number) => void;
};

export default function ListingCard({
  length,
  item,
  index,
  showLocationsList = false,
  onOpenLocations,
  onSelectLocation,
}: ListingCardProps) {
  const setListingData = useHostStore((state) => state.setListingData);
  const isActive = item?.isActive ?? true;
  const lotsCount = item?.Lots?.items?.length ?? item?.nrOfLots ?? 0;

  const handlePress = () => {
    if (!showLocationsList) {
      onOpenLocations?.();
      return;
    }

    if (typeof index === "number") {
      setListingData(item);
      onSelectLocation?.(index);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.92}
      style={[stylesListingCard.outer, showLocationsList && stylesListingCard.outerModal]}
    >
      <BlurView intensity={showLocationsList ? 40 : 55} tint={showLocationsList ? "dark" : "light"} style={stylesListingCard.card}>
        <View style={stylesListingCard.orb} />

        <View style={stylesListingCard.headerRow}>
          <View style={[stylesListingCard.statusPill, isActive ? stylesListingCard.statusPillLive : stylesListingCard.statusPillPaused]}>
            <Text style={[stylesListingCard.statusText, !isActive && stylesListingCard.statusTextPaused]}>
              {isActive ? "Live" : "Paused"}
            </Text>
          </View>

          <Text style={stylesListingCard.priceTag}>{formatCurrency(item?.hrPrice)}</Text>
        </View>

        <View style={stylesListingCard.headerText}>
          <Text style={stylesListingCard.title}>{item?.locName}</Text>
          <Text style={stylesListingCard.subtitle}>
            {item?.type} • {lotsCount} {lotsCount === 1 ? "lot" : "lots"}
          </Text>
          <Text numberOfLines={2} style={stylesListingCard.address}>
            {item?.addrLoc}
          </Text>
        </View>

        <View style={stylesListingCard.footerRow}>
          <View>
            <Text style={stylesListingCard.footerLabel}>
              {showLocationsList ? "Tap to switch active place" : `${length} hosted places available`}
            </Text>
          </View>

          <View style={stylesListingCard.ctaChip}>
            <Text style={stylesListingCard.ctaText}>{showLocationsList ? "Select" : "Switch location"}</Text>
            <Ionicons name="arrow-forward" size={16} color="#0F172A" />
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const stylesListingCard = StyleSheet.create({
  outer: {
    marginBottom: width * 0.02,
    borderRadius: 26,
    overflow: "hidden",
  },
  outerModal: {
    marginHorizontal: 2,
  },
  card: {
    padding: width * 0.045,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -32,
    top: -48,
    backgroundColor: "rgba(205, 226, 216, 0.22)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: showColor("title"),
  },
  subtitle: {
    fontSize: 14,
    color: showColor("subtitle"),
    marginTop: 4,
  },
  address: {
    fontSize: 14,
    color: showColor("address"),
    lineHeight: 20,
    marginTop: 10,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillLive: {
    backgroundColor: "rgba(43, 148, 86, 0.16)",
  },
  statusPillPaused: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  statusText: {
    color: "#1F7A48",
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextPaused: {
    color: "rgba(255,255,255,0.82)",
  },
  priceTag: {
    fontSize: 14,
    fontWeight: "700",
    color: showColor("title"),
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 12,
    color: showColor("subtitle"),
  },
  ctaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.78)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
});

function showColor(kind: "title" | "subtitle" | "address") {
  if (kind === "title") {
    return "#FFFFFF";
  }

  if (kind === "subtitle") {
    return "rgba(255,255,255,0.78)";
  }

  return "rgba(255,255,255,0.68)";
}