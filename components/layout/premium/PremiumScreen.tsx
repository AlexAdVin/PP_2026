import React from "react";
import {
  ImageSourcePropType,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AmbientBackground from "@/components/layout/AmbientBackground";

type PremiumScreenProps = {
  children: React.ReactNode;
  imageBackground: ImageSourcePropType;
  contentContainerStyle?: ViewStyle;
};

export default function PremiumScreen({
  children,
  imageBackground,
  contentContainerStyle,
}: PremiumScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#EEF2F5", "#F8FAFC", "#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <AmbientBackground imageBackground={imageBackground} />
      <ScrollView
        contentContainerStyle={[styles.scroll, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    paddingBottom: 140,
  },
});