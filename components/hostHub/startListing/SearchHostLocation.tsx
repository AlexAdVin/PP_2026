import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";
import styles from "@/global/style/styles";

export default function SearchHostLocation({ address, onChangeAddress }) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;

  if (!apiKey) {
    return (
      <View style={stylesSearchHostLocation.main}>
        <View style={[styles.textInputContainer, { flex: 1 }]}> 
          <View style={styles.txtInIcon}>
            <Ionicons name="location-sharp" size={26} style={{ color: "#fff" }} />
          </View>
          <TextInput
            value={address}
            onChangeText={(value) => onChangeAddress({ address: value, latitude: null, longitude: null })}
            placeholder="Enter the address below"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            style={[styles.txtInput, { marginLeft: 0 }]}
            keyboardAppearance="dark"
            autoCorrect={false}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={stylesSearchHostLocation.main}>
      <GooglePlacesAutocomplete
        placeholder={address || "Enter the address below"}
        fetchDetails
        minLength={3}
        autoFocus
        enablePoweredByContainer={false}
        query={{
          key: apiKey,
          language: "en",
        }}
        debounce={400}
        nearbyPlacesAPI="GooglePlacesSearch"
        styles={{
          textInputContainer: {
            backgroundColor: "rgba(0,0,0,0.2)",
            alignItems: "center",
          },
          textInput: {
            backgroundColor: "transparent",
            color: "#fff",
            fontSize: 18,
            marginTop: 7,
          },
          listView: {
            backgroundColor: "transparent",
          },
          row: { backgroundColor: "rgba(255,255,255,0.3)" },
          separator: { backgroundColor: "transparent" },
        }}
        textInputProps={{
          placeholderTextColor: "rgba(255, 255, 255, 0.3)",
          fontSize: 19,
          returnKeyType: "search",
          keyboardAppearance: "dark",
          autoCorrect: false,
        }}
        onPress={(data, details = null) => {
          onChangeAddress({
            address: data.description,
            latitude: details?.geometry?.location?.lat ?? null,
            longitude: details?.geometry?.location?.lng ?? null,
          });
        }}
        renderLeftButton={() => (
          <View style={styles.txtInIcon}>
            <Ionicons name="location-sharp" size={26} style={{ color: "#fff" }} />
          </View>
        )}
        renderRow={(rowData) => {
          const title = rowData.structured_formatting.main_text;
          const secondary = rowData.structured_formatting.secondary_text;

          return (
            <View style={stylesSearchHostLocation.containerResultRow}>
              <Text style={stylesSearchHostLocation.textResultTitle}>{title}</Text>
              <Text style={stylesSearchHostLocation.textResultDescription}>{secondary}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const stylesSearchHostLocation = StyleSheet.create({
  main: {
    flexDirection: "row",
    marginBottom: 30,
    width: "100%",
  },
  containerResultRow: {
    justifyContent: "center",
    paddingLeft: 15,
  },
  textResultTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  textResultDescription: {
    fontSize: 15,
    marginTop: 2,
  },
});