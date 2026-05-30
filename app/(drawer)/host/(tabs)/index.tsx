import React, { useEffect, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "@/global/style/styles";
import stylesBtns from "@/global/style/stylesBtns";
import mockHostData from "@/model/mockLocations.json";
import BulletPoints from "@/components/hostHub/BulletPoints";
import HostFooterButton from "@/components/hostHub/HostFooterButton";
import HostHighlightsGrid from "@/components/hostHub/HostHighlightsGrid";
import HostLocationModal from "@/components/hostHub/HostLocationModal";
import HostTitle from "@/components/hostHub/HostTitle";
import ListingCard from "@/components/hostHub/ListingCard";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

const { width, height } = Dimensions.get("screen");
const TOP_HEADER_HEIGHT = height * 0.25;

const hostContent = [
  {
    id: "1",
    q: "We are here to help",
    ph: "Chat with us",
    ic: "rocketchat",
  },
  {
    id: "2",
    q: "Resources and tips",
    ph: "How to get paid",
    ic: "hand-holding-usd",
  },
];

const getLocationTotals = (location: any) => {
  const lots = location?.Lots?.items ?? [];
  const transactions = lots.flatMap((lot: any) => lot?.Transactions?.items ?? []);
  const totalAgreedPrice = transactions.reduce(
    (sum: number, transaction: any) => sum + (transaction?.agreedPriceHR ?? 0),
    0,
  );

  return {
    totalAgreedPrice: new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 2,
    }).format(totalAgreedPrice),
    totalTransactionCount: transactions.length,
  };
};

export default function HostHomeScreen() {
  const router = useRouter();
  const hydrateHostData = useHostStore((state) => state.hydrateHostData);
  const hostLotState = useHostStore((state) => state.hostLotState);
  const showLocationsList = useHostStore((state) => state.showLocationsList);
  const setShowLocationsList = useHostStore((state) => state.setShowLocationsList);
  const selectLocation = useHostStore((state) => state.selectLocation);
  const currentLocation = useHostStore(selectCurrentHostLocation);

  useEffect(() => {
    if (!hostLotState.locations?.length) {
      hydrateHostData(mockHostData);
    }
  }, [hostLotState.locations?.length, hydrateHostData]);

  const totals = useMemo(() => getLocationTotals(currentLocation), [currentLocation]);

  const highlights = useMemo(
    () => [
      {
        title: "Chats to answer",
        icon: "chatbox-ellipses-outline" as const,
        count: 3,
      },
      {
        title: "Payout",
        icon: "trending-up" as const,
        count: totals.totalAgreedPrice,
      },
      {
        title: "Reservations",
        icon: "calendar-outline" as const,
        count: totals.totalTransactionCount,
        onPress: () => router.push("/host/reservations"),
      },
      {
        title: "Lot Settings",
        icon: "ellipsis-vertical-circle-outline" as const,
        count: "Modify",
        onPress: () => router.push("/host/update-avl"),
      },
    ],
    [router, totals.totalAgreedPrice, totals.totalTransactionCount],
  );

  return (
    <LinearGradient
      colors={["rgba(200,0,0,0.05)", "rgba(20,0,0,1)"]}
      style={[StyleSheet.absoluteFill, { justifyContent: "space-between" }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {hostLotState.locations?.length > 0 ? (
          <>
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(255,255,255,0.7)"]}
              style={{ position: "absolute", width: "100%", height: TOP_HEADER_HEIGHT }}
            >
              <View
                style={{
                  marginTop: height * 0.15,
                  marginHorizontal: width * 0.05,
                  flex: 1,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.heading}>Total:</Text>
                <Text style={styles.heading}>{totals.totalAgreedPrice}</Text>
              </View>
            </LinearGradient>

            <View
              style={{
                marginTop: TOP_HEADER_HEIGHT / 1.25,
                zIndex: 3,
                width: width * 0.9,
                alignSelf: "center",
              }}
            >
              <ListingCard
                length={hostLotState.locations.length}
                item={currentLocation}
                onOpenLocations={() => setShowLocationsList(true)}
              />
            </View>

            <HostHighlightsGrid highlights={highlights} />
          </>
        ) : (
          <HostTitle title={"Make your\nparking\navailable\n & earn extra\nevery day"} />
        )}

        {hostLotState.locations?.length > 0 ? (
          <View style={{ height: height * 0.5 }}>
            {hostContent.map((entry) => (
              <View key={entry.id}>
                <Text style={styles.titleIn}>{entry.q}</Text>
                <TouchableOpacity style={styles.txtInC}>
                  <FontAwesome5 name={entry.ic} size={24} style={styles.txtInIcon} />
                  <Text style={styles.txtInput}>{entry.ph}</Text>
                  <Entypo name="chevron-thin-right" size={18} style={styles.chevIcon} />
                </TouchableOpacity>
              </View>
            ))}
            <HostFooterButton label="Tell someone" onPress={() => router.push("/host/start-listing")} />
          </View>
        ) : (
          <View
            style={[
              styles.fieldContainer,
              {
                paddingHorizontal: width * 0.05,
                paddingVertical: width * 0.08,
                minHeight: height * 0.5,
              },
            ]}
          >
            <Text style={{ alignSelf: "flex-start", fontSize: 22, marginBottom: 10, color: "white" }}>
              Let others park when you are not there.
            </Text>
            <BulletPoints />
            <HostFooterButton label="Start sharing" onPress={() => router.push("/host/start-listing")} />
            <TouchableOpacity
              style={{
                ...stylesBtns.btn4,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
              }}
            >
              <Text style={{ ...stylesBtns.btn4Text, color: "rgba(255,255,255,0.5)" }}>
                Read more
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <HostLocationModal
        visible={showLocationsList}
        locations={hostLotState.locations}
        onClose={() => setShowLocationsList(false)}
        onSelectLocation={selectLocation}
      />
    </LinearGradient>
  );
}