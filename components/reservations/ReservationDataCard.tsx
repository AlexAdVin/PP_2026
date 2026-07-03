import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import stylesBtns from "@/global/style/stylesBtns";

const { width } = Dimensions.get("screen");

type Props = {
  item: any;
  role?: "driver" | "host";
  style?: object;
  onPressDetails: (item: any) => void;
};

const formatTime = (value?: string) =>
  value
    ? new Date(value).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

export default function ReservationDataCard({ item, role = "driver", style, onPressDetails }: Props) {
  const title = role === "host" ? item?.driverName ?? "Guest" : item?.locationName ?? item?.locName ?? "Parking reservation";
  const subtitle = role === "host" ? item?.locationName ?? item?.locName ?? "Hosted location" : `Lot ${item?.lotNumber ?? item?.lotNr ?? item?.lotID ?? item?.lotId ?? "--"}`;
  const price = item?.totalAmount ?? item?.parkingAmount ?? item?.agreedPriceHR ?? item?.hourlyRate;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[stylesCard.header, style]}
      onPress={() => onPressDetails(item)}
    >
      <View style={stylesCard.dateBadge}>
        <Text style={stylesCard.dateDay}>
          {item?.startBooking ? new Date(item.startBooking).toLocaleDateString(undefined, { day: "2-digit" }) : "--"}
        </Text>
        <Text style={stylesCard.dateMonth}>
          {item?.startBooking ? new Date(item.startBooking).toLocaleDateString(undefined, { month: "short" }) : "---"}
        </Text>
      </View>

      <View style={stylesCard.headerText}>
        <Text numberOfLines={1} style={stylesCard.title}>{title}</Text>
        <Text numberOfLines={1} style={stylesCard.subtitle}>{subtitle}</Text>
        <Text numberOfLines={1} style={stylesCard.subtitle}>
          {formatTime(item?.startBooking)} - {formatTime(item?.endBooking)} • {formatCurrency(price)}
        </Text>
      </View>

      <View style={[stylesBtns.btn, stylesCard.detailsButton]}>
        <Text style={stylesCard.detailsText}>Details</Text>
      </View>
    </TouchableOpacity>
  );
}

const stylesCard = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(100,0,0,0.3)",
    padding: width * 0.03,
    paddingRight: width * 0.01,
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
  dateBadge: {
    width: 52,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  dateMonth: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    textTransform: "uppercase",
  },
  detailsButton: {
    borderColor: "rgba(255,255,255,0.4)",
    borderWidth: 1,
  },
  detailsText: {
    color: "#fff",
  },
});