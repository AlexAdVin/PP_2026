import React, { useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import LiquidGlassModal from "@/components/modals/LiquidGlassModal";
import ReservationDataCard from "@/components/reservations/ReservationDataCard";
import ReservationPassport from "@/components/reservations/ReservationPassport";

const { width } = Dimensions.get("screen");

const filters = ["Today", "Upcoming", "History"] as const;

type Filter = (typeof filters)[number];

type Props = {
  reservations: any[];
  role?: "driver" | "host";
  title?: string;
  emptyMessage?: string;
  initialFilter?: Filter;
  initialReservationId?: string | null;
};

const getBatchItemStyle = (index: number, totalLength: number) => {
  const style: Record<string, number> = {};

  if (index === 0) {
    style.borderTopLeftRadius = 10;
    style.borderTopRightRadius = 10;
  }

  if (index === totalLength - 1) {
    style.borderBottomLeftRadius = 10;
    style.borderBottomRightRadius = 10;
    style.marginBottom = width * 0.02;
  }

  return style;
};

const filterReservations = (reservations: any[], filter: Filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return reservations
    .filter((reservation) => {
      const startBookingDate = new Date(reservation.startBooking);
      const endBookingDate = new Date(reservation.endBooking);

      if (filter === "Today") {
        return startBookingDate <= endOfDay && endBookingDate >= startOfDay;
      }

      if (filter === "Upcoming") {
        return startBookingDate > endOfDay;
      }

      return endBookingDate < startOfDay;
    })
    .sort((left, right) => new Date(left.startBooking).getTime() - new Date(right.startBooking).getTime());
};

export default function ReservationListScreen({
  reservations,
  role = "driver",
  title = "Reservations",
  emptyMessage = "No reservations available",
  initialFilter = "Today",
  initialReservationId = null,
}: Props) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);

  const filteredReservations = useMemo(() => filterReservations(reservations, filter), [filter, reservations]);

  useEffect(() => {
    if (!initialReservationId) {
      return;
    }

    const reservation = reservations.find((item) => item?.id === initialReservationId);

    if (reservation) {
      setFilter("Today");
      setSelectedReservation(reservation);
    }
  }, [initialReservationId, reservations]);

  return (
    <LinearGradient colors={["rgba(200,0,0,0.05)", "rgba(20,0,0,1)"]} style={StyleSheet.absoluteFill}>
      <ScrollView contentContainerStyle={{ paddingTop: 110, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={stylesScreen.title}>{title}</Text>

        <View style={stylesScreen.tabContainer}>
          {filters.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[stylesScreen.tabButton, filter === tab && stylesScreen.activeTabButton]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[stylesScreen.tabButtonText, filter === tab && stylesScreen.activeTabButtonText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredReservations.length > 0 ? (
          <View style={{ marginHorizontal: width * 0.03 }}>
            {filteredReservations.map((reservation, index) => (
              <ReservationDataCard
                key={reservation?.id ?? index}
                item={reservation}
                role={role}
                style={getBatchItemStyle(index, filteredReservations.length)}
                onPressDetails={setSelectedReservation}
              />
            ))}
          </View>
        ) : (
          <Text style={stylesScreen.emptyLabel}>{emptyMessage}</Text>
        )}
      </ScrollView>

      {selectedReservation ? (
        <LiquidGlassModal heightPercent={0.72} onClose={() => setSelectedReservation(null)} useNativeModal>
          <View style={stylesScreen.passportWrap}>
            <ReservationPassport
              reservation={selectedReservation}
              role={role}
              onCancel={() => {
                Alert.alert(
                  role === "host" ? "Cancel guest reservation" : "Cancel reservation",
                  role === "host"
                    ? "Host-side cancellation flow will be connected in the next stage."
                    : "Driver cancellation flow will be connected in the next stage.",
                );
              }}
              onEdit={() => {
                Alert.alert("Edit reservation", "Reservation editing will be connected in the next stage.");
              }}
              onContact={() => {
                Alert.alert("Contact driver", "Driver contact flow will be connected in the next stage.");
              }}
            />
          </View>
        </LiquidGlassModal>
      ) : null}
    </LinearGradient>
  );
}

const stylesScreen = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginHorizontal: width * 0.06,
    marginBottom: 4,
  },
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
  emptyLabel: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  passportWrap: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});