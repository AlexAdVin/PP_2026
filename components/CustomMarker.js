import React from "react";
import { View, Text } from "react-native";
import { Marker } from "react-native-maps";

const CustomMarker = (props) => {
  const { coords, price, onPress, isSelected } = props;

  return (
    <Marker coordinate={coords} onPress={onPress}>
      <View style={{
        backgroundColor: isSelected ? "rgba(255,255,255,0.9)":"rgba(0,0,0,0.4)",
        borderColor: isSelected ? null:"rgba(255,255,255,0.8)",
        borderWidth:1,
        paddingVertical: 5,
        paddingHorizontal:10,
        borderRadius:50,

      }}>
        <Text style={{ color: isSelected ? "black" : "white", fontWeight: "bold" }}>DKK {price}</Text>
      </View>
    </Marker>
  );
};

export default CustomMarker;
