import React, { useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";

import ReservationListScreen from "@/components/reservations/ReservationListScreen";
import { hostDatabaseAdapter } from "@/src/adapters/hostDatabaseAdapter";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

export default function ReservationsScreen() {
  const currentLocation = useHostStore(selectCurrentHostLocation);
  const hydrateHostData = useHostStore((state) => state.hydrateHostData);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshHostReservations = async () => {
        try {
          const payload = await hostDatabaseAdapter.fetchHostData();

          if (isActive) {
            hydrateHostData(payload);
          }
        } catch (error) {
          console.error("Failed to refresh host reservations", error);
        }
      };

      void refreshHostReservations();

      return () => {
        isActive = false;
      };
    }, [hydrateHostData]),
  );

  const reservations = useMemo(() => {
    const lots = currentLocation?.Lots?.items ?? [];

    return lots.flatMap((lot: any, lotIndex: number) =>
      (lot?.Transactions?.items ?? []).map((transaction: any) => ({
        ...transaction,
        locationId: currentLocation?.id,
        locationName: currentLocation?.locName,
        lotId: lot?.id,
        lotNumber: lot?.lotNr ?? lotIndex + 1,
      })),
    );
  }, [currentLocation]);

  return (
    <ReservationListScreen
      role="host"
      title="Reservations"
      reservations={reservations}
      emptyMessage={currentLocation ? "No transactions available" : "No hosted location selected yet."}
      initialFilter="Today"
    />
  );
}