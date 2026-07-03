import React, { useMemo } from "react";

import ReservationListScreen from "@/components/reservations/ReservationListScreen";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

export default function ReservationsScreen() {
  const currentLocation = useHostStore(selectCurrentHostLocation);

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