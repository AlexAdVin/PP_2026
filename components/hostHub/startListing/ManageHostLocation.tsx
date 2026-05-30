import React, { useState } from "react";
import { Alert, Dimensions, Pressable, Text, View } from "react-native";
import { Entypo, Octicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import styles from "@/global/style/styles";
import stylesStartListing from "@/global/style/stylesStartListing";
import reverseGeoCode from "@/global/utils/reverseGeoCode";
import RenderStartListingMap from "@/components/hostHub/startListing/RenderStartListingMap";
import SearchHostLocation from "@/components/hostHub/startListing/SearchHostLocation";

const { width } = Dimensions.get("screen");
const COLORS = { primary: "#2825", white: "#fff" };

export default function ManageHostLocation({ address, latitude, longitude, onChange }) {
  const startListingStyles = stylesStartListing({ COLORS });
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);

  const handleUseCurrentLocation = async () => {
    try {
      setIsFetchingCurrentLocation(true);
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Location unavailable",
          "Allow location access to autofill your parking address, or search manually.",
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextLatitude = current.coords.latitude;
      const nextLongitude = current.coords.longitude;
      const nextAddress = await reverseGeoCode(nextLatitude, nextLongitude);

      onChange({
        address: nextAddress,
        latitude: nextLatitude,
        longitude: nextLongitude,
      });
    } catch (error) {
      console.error("handleUseCurrentLocation", error);
      Alert.alert("Location unavailable", "We could not read your current location.");
    } finally {
      setIsFetchingCurrentLocation(false);
    }
  };

  return address && latitude && longitude ? (
    <View style={{ zIndex: 10, width }}>
      <Text style={[startListingStyles.titleField, startListingStyles.titleFieldAlignment]}>Is this correct?</Text>

      <View style={styles.txtInC}>
        <Entypo name="location" size={24} style={styles.txtInIcon} />
        <Text style={styles.txtInput}>{address}</Text>
        <Octicons
          name="x-circle-fill"
          size={18}
          color="#fff"
          style={styles.chevIcon}
          onPress={() => onChange({ address: "", latitude: null, longitude: null })}
        />
      </View>

      <RenderStartListingMap
        latitude={latitude}
        longitude={longitude}
        onUpdateLocation={({ address: nextAddress, latitude: nextLatitude, longitude: nextLongitude }) =>
          onChange({
            address: nextAddress,
            latitude: nextLatitude,
            longitude: nextLongitude,
          })
        }
      />
    </View>
  ) : (
    <>
      <Text style={[startListingStyles.titleField, startListingStyles.titleFieldAlignment]}>
        Enter the location for your parking
      </Text>

      <SearchHostLocation address={address} onChangeAddress={onChange} />

      <Pressable style={styles.txtInC} onPress={handleUseCurrentLocation} disabled={isFetchingCurrentLocation}>
        <Entypo name="location" size={24} style={styles.txtInIcon} />
        <Text style={styles.txtInput}>
          {isFetchingCurrentLocation ? "Finding your current location..." : "Use my current location"}
        </Text>
        <Entypo name="chevron-thin-right" size={18} color="#fff" style={styles.chevIcon} />
      </Pressable>
    </>
  );
}