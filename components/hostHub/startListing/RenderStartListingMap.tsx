import React, { useRef } from "react";
import { Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { mapDarkStyle } from "@/model/mapData";
import reverseGeoCode from "@/global/utils/reverseGeoCode";

const { width, height } = Dimensions.get("screen");
const ASPECT_RATIO = width / height;
const dynamicDelta = 0.005;
const latitudeDelta = dynamicDelta;
const longitudeDelta = dynamicDelta * ASPECT_RATIO;

export default function RenderStartListingMap({ latitude, longitude, onUpdateLocation }) {
  const mapRef = useRef(null);

  return (
    <MapView
      ref={mapRef}
      style={{ height: height * 0.4, width }}
      customMapStyle={mapDarkStyle}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      }}
    >
      <Marker
        draggable
        coordinate={{ latitude, longitude }}
        onDragEnd={async (event) => {
          const nextLatitude = event.nativeEvent.coordinate.latitude;
          const nextLongitude = event.nativeEvent.coordinate.longitude;
          const address = await reverseGeoCode(nextLatitude, nextLongitude);
          onUpdateLocation({
            address,
            latitude: nextLatitude,
            longitude: nextLongitude,
          });
        }}
      />
    </MapView>
  );
}