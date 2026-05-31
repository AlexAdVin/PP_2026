import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";

type MetricItem = {
  value: string;
  label: string;
};

type PremiumMetricStripProps = {
  metrics: MetricItem[];
  dark?: boolean;
};

export default function PremiumMetricStrip({ metrics, dark = false }: PremiumMetricStripProps) {
  return (
    <BlurView intensity={48} tint={dark ? "dark" : "light"} style={styles.card}>
      {metrics.map((metric, index) => (
        <React.Fragment key={`${metric.label}-${index}`}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, dark && styles.metricValueDark]}>{metric.value}</Text>
            <Text style={[styles.metricLabel, dark && styles.metricLabelDark]}>{metric.label}</Text>
          </View>
          {index < metrics.length - 1 ? <View style={styles.divider} /> : null}
        </React.Fragment>
      ))}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  metricValueDark: {
    color: "#fff",
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  metricLabelDark: {
    color: "rgba(255,255,255,0.72)",
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
});