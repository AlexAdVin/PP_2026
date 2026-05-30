// components/layout/AmbientBackground.tsx

import React from "react";

import { ImageBackground, StyleSheet } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

export default function AmbientBackground({ imageBackground }: Props) {
  return (
    <ImageBackground
      source={imageBackground}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.image}
    >
      {/* soft overlay for premium glass look */}
      <LinearGradient
        colors={[
          "rgba(248,250,252,0.72)",
          "rgba(248,250,252,0.82)",
          "rgba(255,255,255,0.92)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* subtle dark top fade */}
      <LinearGradient
        colors={["rgba(15,23,42,0.18)", "transparent"]}
        style={styles.topFade}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },

  image: {
    opacity: 0.95,
  },

  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
});
