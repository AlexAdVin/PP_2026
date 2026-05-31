import React from "react";
import { Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

type PremiumHeroProps = {
  imageSource: any;
  eyebrow: string;
  title: string;
  subtitle: string;
  topBar?: React.ReactNode;
  children?: React.ReactNode;
  heightPercent?: number;
};

export default function PremiumHero({
  imageSource,
  eyebrow,
  title,
  subtitle,
  topBar,
  children,
  heightPercent = 0.46,
}: PremiumHeroProps) {
  return (
    <View style={[styles.heroWrapper, { height: height * heightPercent }]}>
      <ImageBackground source={imageSource} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
        <LinearGradient
          colors={[
            "rgba(15,23,42,0.10)",
            "rgba(15,23,42,0.25)",
            "rgba(15,23,42,0.78)",
          ]}
          style={StyleSheet.absoluteFill}
        />

        {topBar ? <View style={styles.topBar}>{topBar}</View> : null}

        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>{eyebrow}</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    marginBottom: 8,
  },
  heroImage: {
    flex: 1,
  },
  heroImageStyle: {
    borderRadius: 10,
  },
  topBar: {
    marginTop: 60,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    marginTop: "auto",
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -1.4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
    width: "92%",
    fontWeight: "400",
  },
});