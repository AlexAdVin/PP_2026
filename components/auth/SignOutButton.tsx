import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";

type Props = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  iconColor?: string;
  onSignedOut?: () => void;
};

export default function SignOutButton({
  label = "Sign out",
  style,
  backgroundColor = "rgba(255,255,255,0.72)",
  borderColor = "rgba(255,255,255,0.9)",
  textColor = "#171717",
  iconColor = "rgba(23,23,23,0.52)",
  onSignedOut,
}: Props) {
  const session = useAuthStore((state) => state.session);
  const [busy, setBusy] = useState(false);

  if (!session) {
    return null;
  }

  const handlePress = async () => {
    setBusy(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      onSignedOut?.();
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        void handlePress();
      }}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      disabled={busy}
    >
      {busy ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <Feather name="log-out" size={17} color={iconColor} />
          <Text
            style={[
              styles.label,
              {
                color: textColor,
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
