import React from "react";
import { Text, TouchableOpacity } from "react-native";
import stylesBtns from "@/global/style/stylesBtns";

type HostFooterButtonProps = {
  label: string;
  onPress: () => void;
};

export default function HostFooterButton({ label, onPress }: HostFooterButtonProps) {
  return (
    <TouchableOpacity style={[stylesBtns.btn4, stylesBtns.glow]} onPress={onPress}>
      <Text style={stylesBtns.btn4Text}>{label}</Text>
    </TouchableOpacity>
  );
}