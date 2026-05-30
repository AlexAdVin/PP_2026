import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AmbientBackground from "./AmbientBackground";

type Props = { children: React.ReactNode };
export default function ScreenLayout({ children }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#EEF2F5", "#F8FAFC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground imageBackground={require("@/assets/img/userImg/profiles/AL.jpg")} />
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
});
