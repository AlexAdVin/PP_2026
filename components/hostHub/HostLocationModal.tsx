import React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import Modal from "react-native-modal";
import styles from "@/global/style/styles";
import ListingCard from "@/components/hostHub/ListingCard";

const { height, width } = Dimensions.get("screen");

type HostLocationModalProps = {
  visible: boolean;
  locations: any[];
  onClose: () => void;
  onSelectLocation: (index: number) => void;
};

export default function HostLocationModal({
  visible,
  locations,
  onClose,
  onSelectLocation,
}: HostLocationModalProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.65}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.92)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 12,
          paddingBottom: 24,
          minHeight: height * 0.42,
          maxHeight: height * 0.72,
        }}
      >
        <View style={{ marginBottom: 5, flexDirection: "row" }}>
          <Text style={styles.titleModal}>Choose a place</Text>
          <Text
            onPress={onClose}
            style={[
              styles.txtInIcon,
              {
                fontSize: 25,
                paddingVertical: height * 0.02,
                color: "#fff",
                marginRight: width * 0.03,
              },
            ]}
          >
            X
          </Text>
        </View>

        <ScrollView
          style={{ height: height * 0.55, paddingHorizontal: width * 0.02 }}
          showsVerticalScrollIndicator={false}
        >
          {locations.map((item, index) => (
            <ListingCard
              key={item?.id ?? `${index}`}
              showLocationsList
              item={item}
              index={index}
              length={locations.length}
              onSelectLocation={onSelectLocation}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}