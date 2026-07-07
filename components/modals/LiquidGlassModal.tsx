import React, { useEffect } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

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
import { Ionicons } from "@expo/vector-icons";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const CLOSE_ANIMATION_DURATION = 240;
const PAN_CLOSE_VELOCITY = 900;

type Props = {
  children: React.ReactNode;
  height?: number;
  heightPercent?: number;
  onClose: () => void;
  onBackdropPress?: () => void;
  showCloseButton?: boolean;
  titleSlot?: React.ReactNode;
  visible?: boolean;
  useNativeModal?: boolean;
};

export default function LiquidGlassModal({
  children,
  height,
  heightPercent,
  onClose,
  onBackdropPress,
  showCloseButton = true,
  titleSlot,
  visible = true,
  useNativeModal = false,
}: Props) {
  const resolvedHeight = height ?? SCREEN_HEIGHT * (heightPercent ?? 0.55);
  const closedPosition = resolvedHeight + 72;
  const translateY = useSharedValue(closedPosition);
  const isClosing = useSharedValue(false);

  useEffect(() => {
    if (!visible) {
      translateY.value = closedPosition;
      isClosing.value = false;
      return;
    }

    isClosing.value = false;
    translateY.value = closedPosition;
    translateY.value = withSpring(0, {
      damping: 24,
      stiffness: 240,
      mass: 0.92,
    });
  }, [closedPosition, isClosing, translateY, visible]);

  const animateClose = () => {
    "worklet";
    if (isClosing.value) {
      return;
    }

    isClosing.value = true;
    translateY.value = withTiming(closedPosition, { duration: CLOSE_ANIMATION_DURATION }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const closeSheet = () => {
    animateClose();
  };

  const gesture = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY * 0.96;
      }
    })
    .onEnd((e) => {
      const shouldClose = translateY.value > resolvedHeight * 0.22 || e.velocityY > PAN_CLOSE_VELOCITY;

      if (shouldClose) {
        animateClose();
      } else {
        translateY.value = withSpring(0, {
          damping: 28,
          stiffness: 260,
          mass: 0.9,
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
    opacity: interpolate(translateY.value, [0, resolvedHeight], [1, 0]),
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

          <View style={styles.chromeRow}>
            <View style={styles.handle} />

            {showCloseButton ? (
              <TouchableOpacity
                activeOpacity={0.85}
                hitSlop={16}
                onPress={closeSheet}
                style={styles.closeButton}
              >
                <View style={styles.closeButtonGlass}>
                  <Ionicons name="close" size={18} color="rgba(255,255,255,0.96)" />
                </View>
              </TouchableOpacity>
            ) : null}

            {titleSlot ? (
              <View style={styles.titleSlotWrap}>
                {titleSlot}
              </View>
            ) : null}
          </View>

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

  chromeRow: {
    justifyContent: "center",
    minHeight: 44,
    paddingTop: 10,
    marginBottom: 18,
  },

  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignSelf: "center",
  },

  closeButton: {
    position: "absolute",
    top: 2,
    right: 18,
  },

  closeButtonGlass: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    shadowColor: "#ffffff",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },

  titleSlotWrap: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingRight: 68,
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
