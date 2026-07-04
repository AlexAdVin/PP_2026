import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HapticButton } from "@/components/HapticButton";
import ReservationCountdown from "@/components/reservations/ReservationCountdown";

const { width } = Dimensions.get("screen");

type Props = {
  reservation: any;
  role?: "driver" | "host";
  onCancel?: () => void;
  onEdit?: () => void;
  onContact?: () => void;
};

const formatTime = (value?: string) =>
  value
    ? new Date(value).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    : "--";

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

export default function ReservationPassport({ reservation, role = "driver", onCancel, onEdit, onContact }: Props) {
  const locationName = reservation?.locationName ?? reservation?.locName ?? "Parking reservation";
  const lotLabel = reservation?.lotNumber ?? reservation?.lotNr ?? reservation?.lotID ?? reservation?.lotId ?? "--";
  const primaryName = role === "host" ? reservation?.driverName ?? "Guest" : locationName;
  const secondaryName = role === "host" ? locationName : `Lot ${lotLabel}`;
  const price = reservation?.totalAmount ?? reservation?.parkingAmount ?? reservation?.agreedPriceHR ?? reservation?.hourlyRate;
  const bookedAt = reservation?.bookedAt
    ? new Date(reservation.bookedAt).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";
  const paymentMethod = reservation?.paymentMethodLabel ?? reservation?.paymentMethodType ?? "Masked payment";
  const statusLabel = reservation?.status ?? "confirmed";

  return (
    <View style={styles.passport}>
      <View style={styles.leftPane}>
        <Text style={styles.eyebrow}>{role === "host" ? "Guest reservation" : "Reservation passport"}</Text>
        <Text numberOfLines={2} style={styles.title}>{primaryName}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>{secondaryName}</Text>

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(reservation?.startBooking)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>From</Text>
            <Text style={styles.detailValue}>{formatTime(reservation?.startBooking)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Until</Text>
            <Text style={styles.detailValue}>{formatTime(reservation?.endBooking)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>{formatCurrency(price)}</Text>
          </View>
          {role === "host" ? (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Booked at</Text>
                <Text style={styles.detailValue}>{bookedAt}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>{paymentMethod}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{statusLabel}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lot</Text>
                <Text style={styles.detailValue}>{lotLabel}</Text>
              </View>
            </>
          ) : null}
        </View>

        <ReservationCountdown startBooking={reservation?.startBooking} endBooking={reservation?.endBooking} />

        {reservation?.bookingReference ? (
          <Text numberOfLines={1} style={styles.reference}>Ref {reservation.bookingReference}</Text>
        ) : null}
      </View>

      <View style={styles.rightPane}>
        <HapticButton hapticStyle="medium" style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
          <MaterialCommunityIcons name="calendar-remove-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Cancel</Text>
        </HapticButton>

        <HapticButton hapticStyle="selection" style={[styles.actionButton, styles.editButton]} onPress={role === "host" ? onContact : onEdit}>
          <MaterialCommunityIcons name={role === "host" ? "message-text-outline" : "calendar-edit"} size={24} color="#0F172A" />
          <Text style={[styles.actionText, styles.editText]}>{role === "host" ? "Contact" : "Edit"}</Text>
        </HapticButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  passport: {
    width: "100%",
    minHeight: width * 0.82,
    flexDirection: "row",
    padding: 18,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  leftPane: {
    width: "70%",
    paddingRight: 14,
  },
  rightPane: {
    width: "30%",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitle: {
    color: "#334155",
    fontSize: 15,
    marginTop: 4,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  detailItem: {
    width: "46%",
  },
  detailLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailValue: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  reference: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
  cancelButton: {
    marginBottom: 12,
    backgroundColor: "#991B1B",
    borderColor: "rgba(255,255,255,0.5)",
  },
  editButton: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "rgba(15,23,42,0.12)",
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  editText: {
    color: "#0F172A",
  },
});