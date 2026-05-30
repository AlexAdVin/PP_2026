import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HostTitle from "@/components/hostHub/HostTitle";
import FooterBackNext from "@/components/hostHub/startListing/FooterBackNext";
import ManageHostLocation from "@/components/hostHub/startListing/ManageHostLocation";
import PriceSection from "@/components/hostHub/startListing/PriceSection";
import RenderIncrementer from "@/components/hostHub/startListing/RenderIncrementer";
import SelectPType from "@/components/hostHub/startListing/SelectPType";
import styles from "@/global/style/styles";
import stylesBtns from "@/global/style/stylesBtns";
import stylesStartListing from "@/global/style/stylesStartListing";
import { useHostStore } from "@/src/hostStore";

const COLORS = { primary: "#2825", white: "#fff" };
const startListingStyles = stylesStartListing({ COLORS });

const content = [
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
      <LinearGradient colors={["rgba(200,0,0,0.05)", "#000"]} style={StyleSheet.absoluteFill}>
        <HostTitle title={slideContent.q} />

        <View style={startListingStyles.footerContainer}>
          <View style={[styles.fieldContainer, { alignItems: "center", paddingVertical: 20 }]}> 
            {activeSlide === 0 ? <SelectPType type={listingData.type} onChange={(value) => updateListingField("type", value)} /> : null}

            {activeSlide === 1 ? (
              <ManageHostLocation
                address={listingData.addrLoc}
                latitude={listingData.lat}
                longitude={listingData.lng}
                onChange={({ address, latitude, longitude }) =>
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
                <Text style={[startListingStyles.titleField, startListingStyles.titleFieldAlignment]}>
                  {slideContent.ph}
                </Text>
                <View style={styles.txtInC}>
                  <MaterialCommunityIcons name="arrow-expand-horizontal" size={35} style={styles.txtMultiIcon} />
                  <View style={styles.txtInCFlex}>
                    <Text style={styles.txtMultiInfo}>Passenger car</Text>
                    <Text style={styles.txtMultiSubInfo}>Length: 5 m, Width: 2.5 m, Height: 2.2 m</Text>
                  </View>
                </View>
                <RenderIncrementer
                  value={Number(listingData.nrOfLots)}
                  onChange={(nextValue) => updateListingField("nrOfLots", nextValue)}
                />
              </>
            ) : null}

            {activeSlide === 3 ? (
              <>
                <Text style={[startListingStyles.titleField, startListingStyles.titleFieldAlignment]}>
                  {slideContent.q}
                </Text>
                <PriceSection
                  value={Number(listingData.hrPrice)}
                  onChange={(nextValue) => updateListingField("hrPrice", nextValue)}
                />
              </>
            ) : null}

            {activeSlide === 4 ? (
              <View style={{ width: "100%" }}>
                <Text style={[startListingStyles.titleField, startListingStyles.titleFieldAlignment]}>
                  Enter a name for the parking
                </Text>

                <View style={styles.txtInC}>
                  <MaterialCommunityIcons name={slideContent.icon} size={26} style={styles.txtInIcon} />
                  <TextInput
                    value={listingData.locName}
                    onChangeText={(value) => updateListingField("locName", value)}
                    placeholder={slideContent.ph}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    style={styles.txtInput}
                    keyboardAppearance="dark"
                    autoComplete="off"
                    autoCorrect={false}
                  />
                </View>
              </View>
            ) : null}
          </View>

          <View style={[startListingStyles.progressBar, stylesBtns.glow]}>
            <View style={{ ...startListingStyles.progressBarFill, width: `${progress}%` }} />
          </View>

          <FooterBackNext handlePrev={goBack} handleNext={goNext} activeSlide={activeSlide} />
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}