import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import stylesBtns from "@/global/style/stylesBtns";
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
      style={[
        stylesListingCard.header,
        stylesBtns.glow,
        {
          marginBottom: width * 0.02,
          backgroundColor: !showLocationsList
            ? "rgba(100,0,0,0.7)"
            : "rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: width * 0.03,
        },
      ]}
    >
      <View style={stylesListingCard.headerText}>
        <Text style={stylesListingCard.title}>{item?.locName}</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={stylesListingCard.subtitle}>{item?.type} • </Text>
          <Text style={stylesListingCard.subtitle}>{formatCurrency(item?.hrPrice)}</Text>
        </View>
        <Text numberOfLines={1} style={stylesListingCard.subtitle}>
          {item?.addrLoc}
        </Text>
      </View>

      {length > 0 && !showLocationsList ? (
        <View style={{ justifyContent: "flex-end" }}>
          <Entypo
            name="chevron-thin-up"
            size={18}
            color="rgba(255,255,255,0.3)"
            style={stylesListingCard.chevIcon}
          />
          <Entypo
            name="chevron-thin-down"
            size={18}
            color="rgba(255,255,255,0.7)"
            style={stylesListingCard.chevIcon}
          />
        </View>
      ) : (
        <View
          style={[
            stylesBtns.btn,
            stylesBtns.glow,
            { borderColor: "rgba(255,255,255,0.4)", borderWidth: 1 },
          ]}
        >
          <Text style={{ color: "#fff" }}>Select</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const stylesListingCard = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  chevIcon: {
    marginRight: width * 0.02,
  },
});