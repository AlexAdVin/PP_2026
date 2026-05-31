import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

type GlassIconButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
};

export default function GlassIconButton({ children, onPress }: GlassIconButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.touchable}>
      <BlurView intensity={25} tint="dark" style={styles.button}>
        {children}
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 24,
    overflow: "hidden",
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});