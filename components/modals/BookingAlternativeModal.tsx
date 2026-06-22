import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BlurView } from "expo-blur";

import LiquidGlassModal from "@/components/modals/LiquidGlassModal";
import { HapticButton } from "@/components/HapticButton";

type Props = {
  visible: boolean;
  selectedLotNumber?: number | null;
  alternativeLotNumber?: number | null;
  hasAlternative: boolean;
  onAcceptAlternative: () => void;
  onAcknowledge: () => void;
};

export default function BookingAlternativeModal({
  visible,
  selectedLotNumber,
  alternativeLotNumber,
  hasAlternative,
  onAcceptAlternative,
  onAcknowledge,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <LiquidGlassModal heightPercent={0.42} onClose={onAcknowledge}>
      <View style={styles.container}>
        <Text style={styles.title}>That slot was just taken</Text>
        <Text style={styles.message}>
          {hasAlternative
            ? `Lot ${selectedLotNumber ?? "?"} is no longer available at your selected time. Lot ${alternativeLotNumber ?? "?"} is available instead.`
            : `Unfortunately, lot ${selectedLotNumber ?? "?"} is no longer available. Please select another time or find another parking location.`}
        </Text>

        <BlurView intensity={40} tint="light" style={styles.card}>
          <Text style={styles.cardTitle}>{hasAlternative ? "Suggested alternative" : "Next step"}</Text>
          <Text style={styles.cardText}>
            {hasAlternative
              ? `Switch to lot ${alternativeLotNumber ?? "?"} and continue from place details.`
              : "Go back to place details to refresh the latest live availability for this location."}
          </Text>
        </BlurView>

        <View style={styles.actions}>
          {hasAlternative ? (
            <HapticButton hapticStyle="medium" style={[styles.button, styles.primaryButton]} onPress={onAcceptAlternative}>
              <Text style={styles.primaryButtonText}>Use alternative</Text>
            </HapticButton>
          ) : null}

          <HapticButton style={[styles.button, hasAlternative ? styles.secondaryButton : styles.primaryButton]} onPress={onAcknowledge}>
            <Text style={hasAlternative ? styles.secondaryButtonText : styles.primaryButtonText}>Okay</Text>
          </HapticButton>
        </View>
      </View>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.9,
  },
  message: {
    marginTop: 12,
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    overflow: "hidden",
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    minHeight: 48,
    borderRadius: 22,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  secondaryButton: {
    marginLeft: 12,
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.15)",
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
});