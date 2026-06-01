import React, { useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, StyleSheet, Switch, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import BackBtn from "@/components/btns/BackBtn";
import CreateListingFooter from "@/components/hostHub/createListing/CreateListingFooter";
import LotSettings from "@/components/hostHub/createListing/LotSettings";
import FlowIntroSlides, { type FlowIntroSlide } from "@/components/hostHub/shared/FlowIntroSlides";
import LotsCarousel from "@/components/lots/LotsCarousel";
import styles from "@/global/style/styles";
import { useHostStore } from "@/src/hostStore";

const { width } = Dimensions.get("screen");
const imageBackground = require("@/assets/img/6232c93f3ccdf.jpg");

const introSlides: FlowIntroSlide[] = [
  {
    id: "lot-intro-1",
    eyebrow: "Lot settings",
    title: "Now decide when the parking should be available.",
    subtitle: "Many hosts open parking while they are at work, and institutions often share spaces after hours when employees go home.",
    chips: ["Workday windows", "After-hours access", "Per-lot setup"],
    cards: [
      {
        id: "lot-intro-1-card-1",
        icon: "briefcase-clock-outline",
        title: "Great for daytime routines",
        body: "Make a lot available while you are away, then reclaim it later when you need it again.",
      },
      {
        id: "lot-intro-1-card-2",
        icon: "office-building-clock-outline",
        title: "Useful for offices and institutions",
        body: "Open staff parking after hours, on weekends, or whenever the site is otherwise sitting empty.",
      },
    ],
  },
  {
    id: "lot-intro-2",
    eyebrow: "Availability defaults",
    title: "Each lot starts with a 12-month window by default.",
    subtitle: "That default can be changed at any time, and it keeps rolling forward automatically unless you stop it.",
    chips: ["12-month default", "Editable anytime", "Auto-reset behavior"],
    cards: [
      {
        id: "lot-intro-2-card-1",
        icon: "calendar-range-outline",
        title: "Choose the overall date range",
        body: "Shorten it, extend it, or switch it off entirely whenever your schedule changes.",
      },
      {
        id: "lot-intro-2-card-2",
        icon: "calendar-clock-outline",
        title: "Choose days and time intervals",
        body: "Pick which days of the week are available and, for those days, the exact time intervals the lot can be booked.",
      },
    ],
  },
  {
    id: "lot-intro-3",
    eyebrow: "Control and pricing",
    title: "Lots can vary in availability and price.",
    subtitle: "Use the master switch for the entire listing or pause a single lot when only one bay should be unavailable.",
    chips: ["Per-lot price", "Granular switches", "Hosting Hub master switch"],
    cards: [
      {
        id: "lot-intro-3-card-1",
        icon: "toggle-switch-outline",
        title: "Master switch for the full listing",
        body: "Pause or reopen the whole listing here. The same listing-wide control remains available later from Hosting Hub.",
      },
      {
        id: "lot-intro-3-card-2",
        icon: "car-multiple",
        title: "Different lots can behave differently",
        body: "One lot can stay private, another can stay open every evening, and the price can vary lot by lot.",
      },
    ],
  },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const listingData = useHostStore((state) => state.listingData);
  const listingLotDraft = useHostStore((state) => state.listingLotDraft);
  const initializeListingLotDraft = useHostStore((state) => state.initializeListingLotDraft);
  const updateListingLotField = useHostStore((state) => state.updateListingLotField);
  const updateListingLotAvailability = useHostStore((state) => state.updateListingLotAvailability);
  const setListingDraftActive = useHostStore((state) => state.setListingDraftActive);
  const finalizeHostListing = useHostStore((state) => state.finalizeHostListing);
  const [checkedLot, setCheckedLot] = useState(0);
  const [activeTab, setActiveTab] = useState("Availability");
  const [activeIntroSlide, setActiveIntroSlide] = useState(0);

  const isListingActive = useMemo(
    () => (listingLotDraft.length ? listingLotDraft.some((lot) => lot?.avlBool !== false) : listingData?.isActive ?? true),
    [listingData?.isActive, listingLotDraft],
  );

  useEffect(() => {
    if (!listingLotDraft.length) {
      initializeListingLotDraft(listingData);
    }
  }, [initializeListingLotDraft, listingData, listingLotDraft.length]);

  const handleBack = () => {
    if (activeIntroSlide < introSlides.length) {
      if (activeIntroSlide === 0) {
        router.back();
        return;
      }

      setActiveIntroSlide((current) => current - 1);
      return;
    }

    if (activeTab === "Facilities") {
      setActiveTab("Availability");
      return;
    }

    router.back();
  };

  const handleNext = async () => {
    if (activeIntroSlide < introSlides.length) {
      if (activeIntroSlide === introSlides.length - 1) {
        setActiveIntroSlide(introSlides.length);
        return;
      }

      setActiveIntroSlide((current) => current + 1);
      return;
    }

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

  if (activeIntroSlide < introSlides.length) {
    return (
      <FlowIntroSlides
        slides={introSlides}
        imageBackground={imageBackground}
        onComplete={() => setActiveIntroSlide(introSlides.length)}
        onExit={() => router.back()}
        finalLabel="Open settings"
      />
    );
  }

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

      <View style={localStyles.masterCard}>
        <View style={localStyles.masterCopy}>
          <Text style={localStyles.masterTitle}>Listing master switch</Text>
          <Text style={localStyles.masterSubtitle}>Pause or reopen every lot in this listing here. You can also switch the full location on or off later from Hosting Hub.</Text>
        </View>
        <Switch
          value={isListingActive}
          onValueChange={setListingDraftActive}
          trackColor={{ false: "rgba(148,163,184,0.35)", true: "rgba(255,255,255,0.55)" }}
          thumbColor={isListingActive ? "#0F172A" : "#CBD5E1"}
        />
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
  masterCard: {
    marginTop: 18,
    marginHorizontal: width * 0.05,
    marginBottom: 14,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    backgroundColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
  },
  masterCopy: {
    flex: 1,
    paddingRight: 16,
  },
  masterTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  masterSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  footerWrap: {
    position: "absolute",
    bottom: 0,
    width,
    alignItems: "center",
  },
});