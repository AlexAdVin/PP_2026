import React, { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import BackBtn from "@/components/btns/BackBtn";
import CreateListingFooter from "@/components/hostHub/createListing/CreateListingFooter";
import LotSettings from "@/components/hostHub/createListing/LotSettings";
import LotsCarousel from "@/components/lots/LotsCarousel";
import styles from "@/global/style/styles";
import { useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");

export default function CreateListingScreen() {
  const router = useRouter();
  const listingData = useHostStore((state) => state.listingData);
  const listingLotDraft = useHostStore((state) => state.listingLotDraft);
  const initializeListingLotDraft = useHostStore((state) => state.initializeListingLotDraft);
  const updateListingLotField = useHostStore((state) => state.updateListingLotField);
  const updateListingLotAvailability = useHostStore((state) => state.updateListingLotAvailability);
  const finalizeHostListing = useHostStore((state) => state.finalizeHostListing);
  const [checkedLot, setCheckedLot] = useState(0);
  const [activeTab, setActiveTab] = useState("Availability");

  useEffect(() => {
    if (!listingLotDraft.length) {
      initializeListingLotDraft(listingData);
    }
  }, [initializeListingLotDraft, listingData, listingLotDraft.length]);

  const handleBack = () => {
    if (activeTab === "Facilities") {
      setActiveTab("Availability");
      return;
    }

    router.back();
  };

  const handleNext = async () => {
    if (activeTab === "Availability") {
      setActiveTab("Facilities");
      return;
    }

    try {
      const createdLocation = await finalizeHostListing();

      if (!createdLocation) {
        Alert.alert("Could not save listing", "Try again.");
        return;
      }

      router.replace("/host");
    } catch {
      Alert.alert("Could not save listing", "Try again.");
    }
  };

  return (
    <LinearGradient colors={["rgba(200,0,0,0.05)", "rgba(20,0,0,1)"]} style={StyleSheet.absoluteFill}>
      <View style={localStyles.header}>
        <BackBtn />
        <Text style={localStyles.headerTitle}>Lot settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.headingContainer}>
        <Text style={[styles.heading, { color: "#fff" }]}>{listingData?.locName || "New listing"}</Text>
        <Text style={localStyles.headerMeta}>{listingData?.addrLoc || "No address selected"}</Text>
      </View>

      {listingLotDraft.length ? (
        <>
          <LotsCarousel checkedLot={checkedLot} setCheckedLot={setCheckedLot} lotState={listingLotDraft} />

          <LotSettings
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            checkedLot={checkedLot}
            lotState={listingLotDraft}
            handleChange={updateListingLotField}
            handleAvlChange={updateListingLotAvailability}
          />
        </>
      ) : null}

      <View style={localStyles.footerWrap}>
        <CreateListingFooter activeTab={activeTab} onBack={handleBack} onNext={handleNext} />
      </View>
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
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
  headerMeta: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    marginTop: 8,
  },
  footerWrap: {
    position: "absolute",
    bottom: 0,
    width,
    alignItems: "center",
  },
});