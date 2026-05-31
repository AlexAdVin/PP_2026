import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

export default function SearchHostLocation({ address, onChangeAddress }) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;

  if (!apiKey) {
    return (
      <View style={stylesSearchHostLocation.main}>
        <BlurView intensity={40} tint="light" style={stylesSearchHostLocation.fallbackInput}>
          <View style={stylesSearchHostLocation.iconWrap}>
            <Ionicons name="location-sharp" size={20} color="#0F172A" />
          </View>
          <TextInput
            value={address}
            onChangeText={(value) => onChangeAddress({ address: value, latitude: null, longitude: null })}
            placeholder="Enter the address below"
            placeholderTextColor="rgba(15, 23, 42, 0.35)"
            style={stylesSearchHostLocation.fallbackTextInput}
            keyboardAppearance="dark"
            autoCorrect={false}
            returnKeyType="search"
          />
        </BlurView>
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
            backgroundColor: "transparent",
            alignItems: "center",
            paddingHorizontal: 0,
          },
          textInput: {
            minHeight: 68,
            borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.58)",
            color: "#0F172A",
            fontSize: 17,
            marginTop: 0,
            paddingLeft: 64,
            paddingRight: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.85)",
          },
          listView: {
            backgroundColor: "rgba(255,255,255,0.92)",
            borderRadius: 24,
            marginTop: 12,
            overflow: "hidden",
          },
          row: { backgroundColor: "transparent", paddingVertical: 14 },
          separator: { backgroundColor: "rgba(148,163,184,0.15)", height: 1, marginHorizontal: 14 },
        }}
        textInputProps={{
          placeholderTextColor: "rgba(15, 23, 42, 0.35)",
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
          <View style={stylesSearchHostLocation.leftIconWrap}>
            <Ionicons name="location-sharp" size={20} color="#0F172A" />
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
    marginBottom: 30,
    width: "100%",
  },
  fallbackInput: {
    width: "100%",
    minHeight: 68,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.82)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fallbackTextInput: {
    flex: 1,
    minHeight: 48,
    color: "#0F172A",
    fontSize: 17,
  },
  leftIconWrap: {
    position: "absolute",
    left: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.82)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
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