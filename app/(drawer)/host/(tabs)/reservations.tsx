import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TransactionDataCard from "@/components/hostHub/TransactionDataCard";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");

const filters = ["Today", "Upcoming", "History"] as const;

const getBatchItemStyle = (index: number, totalLength: number, expanded: boolean) => {
  const style: Record<string, number> = {};
  if (index === 0) {
    style.borderTopLeftRadius = 10;
    style.borderTopRightRadius = 10;
  }

  if (expanded ? index === totalLength - 1 : index === Math.min(2, totalLength - 1)) {
    style.borderBottomLeftRadius = 10;
    style.borderBottomRightRadius = 10;
    style.marginBottom = width * 0.02;
  }

  return style;
};

function LotTransactions({ lot, lotIndex, filter }: { lot: any; lotIndex: number; filter: string }) {
  const [expanded, setExpanded] = useState(false);
  const transactions = lot?.Transactions?.items ?? [];

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const filteredTransactions = transactions
    .filter((transaction: any) => {
      const startBookingDate = new Date(transaction.startBooking);
      const endBookingDate = new Date(transaction.endBooking);

      if (filter === "Today") {
        return startBookingDate >= startOfDay && endBookingDate <= endOfDay;
      }

      if (filter === "Upcoming") {
        return startBookingDate > endOfDay;
      }

      if (filter === "History") {
        return endBookingDate < startOfDay;
      }

      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.endBooking).getTime() - new Date(a.endBooking).getTime(),
    );

  return (
    <View style={{ marginBottom: 20, marginHorizontal: width * 0.03 }}>
      <View style={stylesScreen.rowHeader}>
        <Text style={stylesScreen.lotTitle}>Lot {lotIndex + 1} Transactions</Text>
        {transactions.length > 3 ? (
          <Text onPress={() => setExpanded((value) => !value)} style={stylesScreen.toggle}>
            {expanded ? "Show Less" : "Show More"}
          </Text>
        ) : null}
      </View>

      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction: any, index: number) => {
          if (!expanded && index >= 3) {
            return null;
          }

          return (
            <TransactionDataCard
              key={transaction.id}
              item={transaction}
              style={getBatchItemStyle(index, filteredTransactions.length, expanded)}
            />
          );
        })
      ) : (
        <Text style={stylesScreen.emptyLabel}>No transactions available</Text>
      )}
    </View>
  );
}

export default function ReservationsScreen() {
  const currentLocation = useHostStore(selectCurrentHostLocation);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Today");

  const lots = useMemo(() => currentLocation?.Lots?.items ?? [], [currentLocation]);

  return (
    <LinearGradient colors={["rgba(200,0,0,0.05)", "rgba(20,0,0,1)"]} style={StyleSheet.absoluteFill}>
      <ScrollView contentContainerStyle={{ paddingTop: 110, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {!currentLocation ? (
          <Text style={stylesScreen.emptyLabel}>No hosted location selected yet.</Text>
        ) : null}
        <View style={stylesScreen.tabContainer}>
          {filters.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[stylesScreen.tabButton, filter === tab && stylesScreen.activeTabButton]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  stylesScreen.tabButtonText,
                  filter === tab && stylesScreen.activeTabButtonText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {lots.map((lot: any, lotIndex: number) => (
          <LotTransactions key={lot?.id ?? lotIndex} lot={lot} lotIndex={lotIndex} filter={filter} />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const stylesScreen = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
  },
  tabButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
  activeTabButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  lotTitle: {
    fontSize: 18,
    color: "#fff",
  },
  toggle: {
    color: "#fff",
  },
  emptyLabel: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
});