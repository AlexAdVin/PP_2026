import React, { useEffect } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";

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
  visible?: boolean;
  useNativeModal?: boolean;
};

export default function LiquidGlassModal({
  children,
  height,
  heightPercent,
  onClose,
  onBackdropPress,
  visible = true,
  useNativeModal = false,
}: Props) {
  const resolvedHeight = height ?? SCREEN_HEIGHT * (heightPercent ?? 0.55);
  const translateY = useSharedValue(resolvedHeight + 60);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 10,
      stiffness: 220,
    });
  }, [translateY]);

  const animateClose = () => {
    "worklet";
    translateY.value = withTiming(resolvedHeight + 80, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const closeSheet = () => {
    animateClose();
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > 120) {
        animateClose();
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

  if (!visible) {
    return null;
  }

  const sheet = (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress ?? closeSheet}>
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
    </View>
  );

  if (useNativeModal) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        navigationBarTranslucent
        hardwareAccelerated
        onRequestClose={closeSheet}
      >
        {sheet}
      </Modal>
    );
  }

  return sheet;
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
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
