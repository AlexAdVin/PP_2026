import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import stylesBtns from "@/global/style/stylesBtns";

const { width } = Dimensions.get("screen");

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

const formatTime = (value?: string) =>
  value
    ? new Date(value).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

const getDurationLabel = (start?: string, end?: string) => {
  if (!start || !end) {
    return "0 hr 00 min";
  }

  const diffMs = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hr ${minutes.toString().padStart(2, "0")} min`;
};

type TransactionDataCardProps = {
  item: any;
  style?: object;
};

export default function TransactionDataCard({ item, style }: TransactionDataCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        stylesListingCard.header,
        {
          backgroundColor: "rgba(100,0,0,0.3)",
          padding: width * 0.03,
          paddingRight: width * 0.01,
        },
        style,
      ]}
    >
      <View style={stylesListingCard.dateBadge}>
        <Text style={stylesListingCard.dateDay}>
          {item?.startBooking
            ? new Date(item.startBooking).toLocaleDateString(undefined, { day: "2-digit" })
            : "--"}
        </Text>
        <Text style={stylesListingCard.dateMonth}>
          {item?.startBooking
            ? new Date(item.startBooking).toLocaleDateString(undefined, { month: "short" })
            : "---"}
        </Text>
      </View>

      <View style={stylesListingCard.headerText}>
        <Text style={stylesListingCard.title}>{item?.driverName ?? "Guest"}</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={stylesListingCard.subtitle}>From: {formatTime(item?.startBooking)} • </Text>
          <Text style={stylesListingCard.subtitle}>Until: {formatTime(item?.endBooking)}</Text>
        </View>
        <Text numberOfLines={1} style={stylesListingCard.subtitle}>
          {getDurationLabel(item?.startBooking, item?.endBooking)} • {formatCurrency(item?.agreedPriceHR)}
        </Text>
      </View>

      <View style={[stylesBtns.btn, { borderColor: "rgba(255,255,255,0.4)", borderWidth: 1 }]}>
        <Text style={{ color: "#fff" }}>Details</Text>
      </View>
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
});