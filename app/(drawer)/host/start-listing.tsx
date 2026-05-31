import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FooterBackNext from "@/components/hostHub/startListing/FooterBackNext";
import ManageHostLocation from "@/components/hostHub/startListing/ManageHostLocation";
import PriceSection from "@/components/hostHub/startListing/PriceSection";
import RenderIncrementer from "@/components/hostHub/startListing/RenderIncrementer";
import SelectPType from "@/components/hostHub/startListing/SelectPType";
import AmbientBackground from "@/components/layout/AmbientBackground";
import { useHostStore } from "@/src/hostStore";

type ListingField = "type" | "addrLoc" | "nrOfLots" | "hrPrice" | "locName";

type SlideContent = {
  id: string;
  q: string;
  field: ListingField;
  ph?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

type LocationPayload = {
  address: string;
  latitude: number | null;
  longitude: number | null;
};

const imageBackground = require("@/assets/img/6232c93f3ccdf.jpg");

const content: SlideContent[] = [
  {
    id: "1",
    q: "What type of\nparking do you offer?",
    field: "type",
  },
  {
    id: "2",
    q: "What is the\nparking address?",
    field: "addrLoc",
  },
  {
    id: "3",
    q: "How many can park here?",
    ph: "Choose how many cars can park",
    field: "nrOfLots",
  },
  {
    id: "4",
    q: "What is the price per hour?",
    field: "hrPrice",
  },
  {
    id: "5",
    q: "How to call\nyour location?",
    ph: "Central, 3 heated garages, 24/7 EV charge",
    field: "locName",
    icon: "car-multiple",
  },
];

export default function StartListingScreen() {
  const router = useRouter();
  const listingData = useHostStore((state) => state.listingData);
  const setListingData = useHostStore((state) => state.setListingData);
  const updateListingField = useHostStore((state) => state.updateListingField);
  const resetListingData = useHostStore((state) => state.resetListingData);
  const createHostLocationDraft = useHostStore((state) => state.createHostLocationDraft);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    resetListingData();
  }, [resetListingData]);

  const slideContent = content[activeSlide];
  const progress = (activeSlide / (content.length - 1)) * 100;
  const isLastSlide = activeSlide === content.length - 1;

  const validations = useMemo(
    () => ({
      type: Boolean(listingData.type),
      addrLoc: Boolean(listingData.addrLoc && listingData.lat && listingData.lng),
      nrOfLots: Number(listingData.nrOfLots) > 0,
      hrPrice: Number(listingData.hrPrice) > 0,
      locName: Boolean(listingData.locName?.trim()),
    }),
    [listingData],
  );

  const showValidationError = () => {
    if (!validations.type) {
      Alert.alert("Select parking type", "Choose the parking type before continuing.");
      return;
    }
    if (!validations.addrLoc) {
      Alert.alert("Add parking address", "Search for the address or use your current location.");
      return;
    }
    if (!validations.nrOfLots) {
      Alert.alert("How many cars can park?", "Set at least one parking lot to continue.");
      return;
    }
    if (!validations.hrPrice) {
      Alert.alert("Set the hourly price", "Enter a valid hourly price to continue.");
      return;
    }
    Alert.alert("Name your location", "Insert a location name to continue.");
  };

  const goNext = () => {
    if (!validations[slideContent.field]) {
      showValidationError();
      return;
    }

    if (activeSlide < content.length - 1) {
      setActiveSlide((current) => current + 1);
      return;
    }

    const createdLocation = createHostLocationDraft({
      ...listingData,
      nrOfLots: Number(listingData.nrOfLots),
      hrPrice: Number(listingData.hrPrice),
    });

    if (!createdLocation) {
      Alert.alert("Could not create listing", "Try again.");
      return;
    }

    router.replace("/host");
  };

  const goBack = () => {
    if (activeSlide > 0) {
      setActiveSlide((current) => current - 1);
      return;
    }

    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={wizardStyles.screen}>
        <LinearGradient colors={["#EEF2F5", "#F8FAFC", "#FFFFFF"]} style={StyleSheet.absoluteFill} />
        <AmbientBackground imageBackground={imageBackground} />

        <KeyboardAvoidingView
          style={wizardStyles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 74 : 24}
        >
          <View style={wizardStyles.contentWrap}>
            <View style={wizardStyles.heroBlock}>
              <Text style={wizardStyles.eyebrow}>Host program</Text>
              <Text style={wizardStyles.title}>{slideContent.q}</Text>
              <Text style={wizardStyles.subtitle}>
                Step {activeSlide + 1} of {content.length}. Build a polished listing with the same premium feel as the landing experience.
              </Text>
            </View>

            <View style={wizardStyles.slideContent}>
              {activeSlide === 0 ? <SelectPType type={listingData.type} onChange={(value: string) => updateListingField("type", value)} /> : null}

              {activeSlide === 1 ? (
                <ManageHostLocation
                  address={listingData.addrLoc}
                  latitude={listingData.lat}
                  longitude={listingData.lng}
                  onChange={({ address, latitude, longitude }: LocationPayload) =>
                    setListingData({
                      addrLoc: address,
                      lat: latitude,
                      lng: longitude,
                    })
                  }
                />
              ) : null}

              {activeSlide === 2 ? (
                <>
                  <Text style={wizardStyles.sectionTitle}>{slideContent.ph}</Text>
                  <View style={wizardStyles.infoCard}>
                    <MaterialCommunityIcons name="arrow-expand-horizontal" size={30} color="#0F172A" style={wizardStyles.infoIcon} />
                    <View style={wizardStyles.infoCopy}>
                      <Text style={wizardStyles.infoTitle}>Passenger car</Text>
                      <Text style={wizardStyles.infoSubtitle}>Length: 5 m, Width: 2.5 m, Height: 2.2 m</Text>
                    </View>
                  </View>
                  <RenderIncrementer
                    value={Number(listingData.nrOfLots)}
                    onChange={(nextValue: number) => updateListingField("nrOfLots", nextValue)}
                  />
                </>
              ) : null}

              {activeSlide === 3 ? (
                <>
                  <Text style={wizardStyles.sectionTitle}>Set a confident hourly rate</Text>
                  <PriceSection
                    value={Number(listingData.hrPrice)}
                    onChange={(nextValue: number) => updateListingField("hrPrice", nextValue)}
                  />
                </>
              ) : null}

              {activeSlide === 4 ? (
                <View style={wizardStyles.fullWidth}>
                  <Text style={wizardStyles.sectionTitle}>Enter a name for the parking</Text>

                  <View style={wizardStyles.inputRow}>
                    <MaterialCommunityIcons name={slideContent.icon} size={24} color="#0F172A" style={wizardStyles.inputIcon} />
                    <TextInput
                      value={listingData.locName}
                      onChangeText={(value) => updateListingField("locName", value)}
                      placeholder={slideContent.ph}
                      placeholderTextColor="rgba(15,23,42,0.35)"
                      style={wizardStyles.textInput}
                      keyboardAppearance="dark"
                      autoComplete="off"
                      autoCorrect={false}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <View style={wizardStyles.footerWrap}>
            <View style={wizardStyles.progressTrack}>
              <LinearGradient
                colors={["#0F172A", "#475569"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[wizardStyles.progressFill, { width: `${progress}%` }]}
              />
            </View>

            <FooterBackNext handlePrev={goBack} handleNext={goNext} activeSlide={activeSlide} isLastSlide={isLastSlide} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const wizardStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flex: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingTop: 88,
    paddingHorizontal: 20,
  },
  heroBlock: {
    marginBottom: 24,
  },
  eyebrow: {
    color: "#64748B",
    fontSize: 13,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  title: {
    color: "#0F172A",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -1.2,
  },
  subtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: "92%",
  },
  slideContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },
  infoCard: {
    overflow: "hidden",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  infoSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 4,
  },
  fullWidth: {
    width: "100%",
  },
  inputRow: {
    width: "100%",
    minHeight: 68,
    overflow: "hidden",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 52,
    color: "#0F172A",
    fontSize: 17,
  },
  footerWrap: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
    paddingTop: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(15,23,42,0.08)",
    marginBottom: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});