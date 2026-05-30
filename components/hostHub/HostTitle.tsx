import React from "react";
import { View, Text, Dimensions } from "react-native";
import styles from "@/global/style/styles";

const { height } = Dimensions.get("screen");

type HostTitleProps = {
  title: string;
};

export default function HostTitle({ title }: HostTitleProps) {
  return (
    <View style={{ ...styles.headingContainer, paddingTop: height * 0.13 }}>
      <Text style={styles.heading}>{title}</Text>
    </View>
  );
}