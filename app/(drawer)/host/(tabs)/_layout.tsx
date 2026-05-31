import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";

export default function HostTabsLayout() {
  return (
    <NativeTabs
      backgroundColor="rgba(15,23,42,0.72)"
      iconColor={{ default: "rgba(255,255,255,0.48)", selected: "#FFFFFF" }}
      tintColor="rgba(255,255,255,0.86)"
      labelStyle={{ fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.52)" }}
      blurEffect="systemChromeMaterialDark"
      shadowColor="rgba(15,23,42,0.18)"
      disableTransparentOnScrollEdge
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <Icon
          src={{
            default: <VectorIcon family={Ionicons} name="grid-outline" />,
            selected: <VectorIcon family={Ionicons} name="grid" />,
          }}
        />
        <Label>Hub</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <Icon
          src={{
            default: <VectorIcon family={Ionicons} name="calendar-clear-outline" />,
            selected: <VectorIcon family={Ionicons} name="calendar-clear" />,
          }}
        />
        <Label>Calendar</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reservations">
        <Icon
          src={{
            default: <VectorIcon family={Ionicons} name="receipt-outline" />,
            selected: <VectorIcon family={Ionicons} name="receipt" />,
          }}
        />
        <Label>Bookings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
