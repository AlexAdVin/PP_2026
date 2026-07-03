import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import FlowProgressBar from "@/components/hostHub/shared/FlowProgressBar";

type Props = {
  startBooking?: string;
  endBooking?: string;
};

const getRemainingLabel = (milliseconds: number) => {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min remaining`;
  }

  return `${hours} hr ${minutes.toString().padStart(2, "0")} min remaining`;
};

const formatStart = (startBooking?: string) =>
  startBooking
    ? new Date(startBooking).toLocaleString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

export default function ReservationCountdown({ startBooking, endBooking }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 30000);

    return () => clearInterval(intervalId);
  }, []);

  const state = useMemo(() => {
    const startTime = startBooking ? new Date(startBooking).getTime() : 0;
    const endTime = endBooking ? new Date(endBooking).getTime() : 0;

    if (!startTime || !endTime || endTime <= startTime) {
      return {
        label: "Reservation time unavailable",
        progress: 0,
      };
    }

    if (now < startTime) {
      return {
        label: `Starts ${formatStart(startBooking)}`,
        progress: 0,
      };
    }

    if (now > endTime) {
      return {
        label: "Reservation completed",
        progress: 100,
      };
    }

    return {
      label: getRemainingLabel(endTime - now),
      progress: ((now - startTime) / (endTime - startTime)) * 100,
    };
  }, [endBooking, now, startBooking]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{state.label}</Text>
      <FlowProgressBar progress={state.progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  label: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
});