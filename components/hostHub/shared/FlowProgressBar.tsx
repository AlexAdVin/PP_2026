import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type FlowProgressBarProps = {
  progress: number;
};

export default function FlowProgressBar({ progress }: FlowProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.progressTrack}>
      <LinearGradient
        colors={["#0F172A", "#475569"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${clampedProgress}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 10,
    overflow: "hidden",
    backgroundColor: "rgba(15,23,42,0.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});