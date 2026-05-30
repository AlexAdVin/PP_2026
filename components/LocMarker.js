import React from "react";
import { View, Text } from "react-native";
import { Marker } from "react-native-maps";
import { Entypo } from '@expo/vector-icons';
import { useLocationStore } from "../src/store";

const LocMarker = (props) => {
  const { coords,  searchHere, setActiveTab } = props;

  const destination = useLocationStore((state) => state.destinationDetails);
  const setDestinationDetails = useLocationStore((state) => state.setDestinationDetails);

  const coords2 = {
    latitude: 56.14622405130924, 
    longitude: 10.203573374816004
  }

  const handlePressSearchHere = () => {
    searchHere();
    setActiveTab("Parking")
    setDestinationDetails({ ...destination, location: null });
  }

  return (
    <Marker coordinate={coords ?? coords2} onPress={handlePressSearchHere} >
      <View style={{
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingVertical: 5,
        paddingHorizontal:10,
        borderRadius:50,
        alignItems:"center",
        flexDirection:"row"
      }}>
        <Text style={{ color: "black" , fontWeight: "bold", }}>Search here</Text>
        <Entypo name="chevron-right" size={24} color="black" />
      </View>
    </Marker>
  );
};

export default LocMarker;
