import React, { useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "@/components/btns/BackBtn";
import mockHostData from "@/model/mockLocations.json";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");

export default function UpdateAvailabilityScreen() {
  const hydrateHostData = useHostStore((state) => state.hydrateHostData);
  const hostLotState = useHostStore((state) => state.hostLotState);
  const currentLocation = useHostStore(selectCurrentHostLocation);

  useEffect(() => {
    if (!hostLotState.locations?.length) {
      hydrateHostData(mockHostData);
    }
  }, [hostLotState.locations?.length, hydrateHostData]);

  const lots = currentLocation?.Lots?.items ?? [];

  return (
    <LinearGradient colors={["rgba(200,0,0,0.05)", "rgba(20,0,0,1)"]} style={StyleSheet.absoluteFill}>
      <View style={stylesScreen.header}>
        <BackBtn />
        <Text style={stylesScreen.headerTitle}>Location editor</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={stylesScreen.content} showsVerticalScrollIndicator={false}>
        <View style={stylesScreen.card}>
          <Text style={stylesScreen.locationName}>{currentLocation?.locName ?? "Selected location"}</Text>
          <Text style={stylesScreen.locationMeta}>{currentLocation?.addrLoc ?? "No address"}</Text>
          <Text style={stylesScreen.locationMeta}>Type: {currentLocation?.type ?? "Unknown"}</Text>
          <Text style={stylesScreen.locationMeta}>Lots: {currentLocation?.nrOfLots ?? 0}</Text>
        </View>

        {lots.map((lot: any) => (
          <View key={lot?.id} style={stylesScreen.card}>
            <Text style={stylesScreen.sectionTitle}>Lot {lot?.lotNr ?? "-"}</Text>
            <Text style={stylesScreen.locationMeta}>Available: {lot?.avlBool ? "Yes" : "No"}</Text>
            <Text style={stylesScreen.locationMeta}>Charger: {lot?.chargerBool ? "Installed" : "None"}</Text>
            <Text style={stylesScreen.locationMeta}>
              Rules: {lot?.rules ?? "No specific rules configured."}
            </Text>
            <Text style={stylesScreen.locationMeta}>
              Window: {lot?.startAvl ?? "-"} to {lot?.endAvl ?? "-"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const stylesScreen = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: width * 0.04,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: width * 0.05,
    paddingTop: 24,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  locationName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  locationMeta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});