import React, { useEffect, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import mockHostData from "@/model/mockLocations.json";
import HostHighlightsGrid from "@/components/hostHub/HostHighlightsGrid";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");

const buildAvailabilitySummary = (location: any) => {
  const lots = location?.Lots?.items ?? [];
  const availabilityRules = lots.flatMap((lot: any) => lot?.AvlDaysNTimes?.items ?? []);
  const activeDays = Array.from(new Set(availabilityRules.filter((item: any) => item?.bool).map((item: any) => item?.day)));
  return activeDays.length ? activeDays.join(", ") : "No recurring availability configured";
};

export default function HostCalendarScreen() {
  const router = useRouter();
  const hydrateHostData = useHostStore((state) => state.hydrateHostData);
  const hostLotState = useHostStore((state) => state.hostLotState);
  const currentLocation = useHostStore(selectCurrentHostLocation);

  useEffect(() => {
    if (!hostLotState.locations?.length) {
      hydrateHostData(mockHostData);
    }
  }, [hostLotState.locations?.length, hydrateHostData]);

  const lots = useMemo(() => currentLocation?.Lots?.items ?? [], [currentLocation]);
  const highlights = useMemo(
    () => [
      {
        title: "Configured days",
        icon: "calendar-outline" as const,
        count: buildAvailabilitySummary(currentLocation).split(",").filter(Boolean).length,
      },
      {
        title: "Active lots",
        icon: "car-outline" as const,
        count: lots.length,
      },
      {
        title: "Reservations",
        icon: "receipt-outline" as const,
        count: lots.flatMap((lot: any) => lot?.Transactions?.items ?? []).length,
        onPress: () => router.push("/host/reservations"),
      },
      {
        title: "Location editor",
        icon: "create-outline" as const,
        count: "Open",
        onPress: () => router.push("/host/update-avl"),
      },
    ],
    [currentLocation, lots, router],
  );

  return (
    <LinearGradient colors={["rgba(200,0,0,0.05)", "rgba(20,0,0,1)"]} style={StyleSheet.absoluteFill}>
      <ScrollView contentContainerStyle={stylesScreen.content} showsVerticalScrollIndicator={false}>
        <Text style={stylesScreen.title}>{currentLocation?.locName ?? "Hosting schedule"}</Text>
        <Text style={stylesScreen.subtitle}>{buildAvailabilitySummary(currentLocation)}</Text>
        <HostHighlightsGrid highlights={highlights} />

        <View style={stylesScreen.section}>
          <Text style={stylesScreen.sectionTitle}>Availability windows</Text>
          {lots.map((lot: any) => {
            const rules = lot?.AvlDaysNTimes?.items ?? [];
            return (
              <View key={lot?.id} style={stylesScreen.card}>
                <Text style={stylesScreen.cardTitle}>Lot {lot?.lotNr ?? "-"}</Text>
                <Text style={stylesScreen.cardBody}>
                  {rules.length
                    ? rules
                        .filter((rule: any) => rule?.bool)
                        .map((rule: any) => `${rule.day}: ${rule.sT?.slice(11, 16)}-${rule.eT?.slice(11, 16)}`)
                        .join("\n")
                    : "No availability windows configured yet."}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const stylesScreen = StyleSheet.create({
  content: {
    paddingTop: 120,
    paddingBottom: 120,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: width * 0.05,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    paddingHorizontal: width * 0.05,
    paddingTop: 8,
    paddingBottom: 18,
  },
  section: {
    paddingHorizontal: width * 0.05,
    marginTop: 18,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardBody: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
});