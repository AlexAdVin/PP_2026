import React from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { BlurView } from "expo-blur";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  children: React.ReactNode;
  height?: number;
  heightPercent?: number;
  onClose: () => void;
  onBackdropPress?: () => void;
};

export default function LiquidGlassModal({
  children,
  height,
  heightPercent,
  onClose,
  onBackdropPress,
}: Props) {
  const resolvedHeight = height ?? SCREEN_HEIGHT * (heightPercent ?? 0.55);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > 120) {
        translateY.value = withTiming(resolvedHeight + 100);

        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 220,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, 250], [1, 0.2]),
  }));

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress ?? onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.sheet,
            {
              height: resolvedHeight,
            },
            animatedStyle,
          ]}
        >
          <BlurView
            intensity={65}
            tint="light"
            style={StyleSheet.absoluteFill}
          />

          <GlassHighlights />

          <View style={styles.handle} />

          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
}

function GlassHighlights() {
  return (
    <>
      <View style={styles.topGlow} />

      <View style={styles.leftGlow} />

      <View style={styles.innerBorder} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.18)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 24,
  },

  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    //backgroundColor: "rgba(255,255,255,0.12)",
  },

  leftGlow: {
    position: "absolute",
    left: -20,
    top: 0,
    width: 100,
    height: 300,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "20deg" }],
  },

  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
});
