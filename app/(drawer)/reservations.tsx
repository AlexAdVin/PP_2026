import React from "react";
import { useLocalSearchParams } from "expo-router";

import ReservationListScreen from "@/components/reservations/ReservationListScreen";
import { useLocationStore } from "@/src/store";

export default function DrawerReservationsScreen() {
  const { openReservationId } = useLocalSearchParams();
  const driverReservations = useLocationStore((state) => state.driverReservations ?? []);
  const latestDriverReservationId = useLocationStore((state) => state.latestDriverReservationId);
  const initialReservationId = Array.isArray(openReservationId)
    ? openReservationId[0]
    : (openReservationId ?? latestDriverReservationId);

  return (
    <ReservationListScreen
      role="driver"
      title="My reservations"
      reservations={driverReservations}
      emptyMessage="No driver reservations yet"
      initialFilter="Today"
      initialReservationId={initialReservationId ?? null}
    />
  );
}