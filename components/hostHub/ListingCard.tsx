import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");

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
        <View style={stylesListingCard.ctaIcon}>
          <Ionicons name="location-outline" size={18} color="#0F172A" />
        </View>

        <View style={stylesListingCard.copyWrap}>
          <Text numberOfLines={1} style={stylesListingCard.title}>{item?.locName}</Text>
          <Text numberOfLines={1} style={stylesListingCard.subtitle}>{item?.type}</Text>
          <Text numberOfLines={1} style={stylesListingCard.address}>
            {item?.addrLoc}
          </Text>
        </View>

        <View style={stylesListingCard.trailingWrap}>
          {!showLocationsList ? (
            <>
              <Entypo name="chevron-thin-up" size={16} color="rgba(15,23,42,0.42)" />
              <Entypo name="chevron-thin-down" size={16} color="#0F172A" />
            </>
          ) : (
            <Ionicons name="arrow-forward" size={16} color="#0F172A" />
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const stylesListingCard = StyleSheet.create({
  outer: {
    marginBottom: width * 0.02,
    borderRadius: 28,
    overflow: "hidden",
  },
  outerModal: {
    marginHorizontal: 2,
  },
  card: {
    minHeight: 84,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.45)",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  copyWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  trailingWrap: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});
