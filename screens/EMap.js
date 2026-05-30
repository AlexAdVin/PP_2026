import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions, FlatList, Platform} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { useLocationStore } from '../src/store';

import { mapDarkStyle, mapStandardStyle } from '../model/mapData';
import mockLocations from '../model/mockLocations.json';
import CustomMarker from '../components/CustomMarker';
import LocMarker from '../components/LocMarker';

import PostCard from '../components/home/Post/PostCard';

import stylesEMap from '../global/style/stylesEMap';

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

// Carousel card dimensions (matching stylesCards.js)
const CARD_WIDTH = width * 0.9;
const CARD_MARGIN = width * 0.03;
const CARD_SPACING = CARD_WIDTH + CARD_MARGIN;

const CarouselMap = ({ posts = [], setActiveTab }) => {
  // Use mock locations if no posts provided
  const displayPosts = posts.length > 0 ? posts : mockLocations.locations;
  const [mapBounds, setMapBounds] = useState({ viewport: null });
  const origin = useLocationStore((state) => state.originDetails);
  const destination = useLocationStore((state) => state.destinationDetails);
  const setMapBoundsStore = useLocationStore((state) => state.setMapBounds);
  const [selPostId, setSelPostId] = useState(null);
  const _map = useRef(null);
  const _carousel = useRef(null);
  const viewConfig = useRef({ itemVisiblePercentThreshold: 70 });


  const onViewChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      let selPlace = viewableItems[0].item;
      setSelPostId(selPlace.id);
    }
  }, []);

  const initialMapState = {
    latitude: origin?.location?.coords?.latitude ?? 55.492737581510625,
    longitude: origin?.location?.coords?.longitude ?? 10.211767094041582,
    latitudeDelta: 60.116821798539874 - 51.57257975751202,
    longitudeDelta: ((60.116821798539874 - 51.57257975751202) * ASPECT_RATIO)
  };

  useEffect(() => {
    let region = {
      latitude: destination?.location?.lat,
      longitude: destination?.location?.lng,
      latitudeDelta: 0.09,
      longitudeDelta: 0.035
    };
    destination?.location && _map.current.animateToRegion(region);
  }, [destination.location]);

  useEffect(() => {
    if (!selPostId || !_carousel.current) return;

    const index = displayPosts.findIndex(marker => marker.id === selPostId);
    if (index >= 0) {
      _carousel.current.scrollToIndex({
        index: index,
        animated: true
      });

      // Also animate map to selected marker
      let selMarker = displayPosts[index];
      let region = {
        latitude: selMarker.lat,
        longitude: selMarker.lng,
        latitudeDelta: 0.09,
        longitudeDelta: 0.035
      };
      _map.current.animateToRegion(region);
    }
  }, [selPostId, displayPosts]);

console.log("-----------------------------posts------->", displayPosts)

  const onRegionChangeComplete = async () => {
    await _map.current.getMapBoundaries().then(res => {
      setMapBounds({ viewport: res });
      setMapBoundsStore({ viewport: res });
      console.log("Boundaries as 2nd promise:", res);
    });
  };


  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={_map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFill}
        customMapStyle={mapDarkStyle}
        //showsUserLocation={true}
        showsBuildings={true}
        rotateEnabled={true}
        zoomEnabled={true}
        initialRegion={initialMapState}
        //cacheEnabled={true}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {origin?.location || destination?.location && <LocMarker coords={{ latitude: origin?.location ? (origin?.location?.coords?.latitude) : (destination?.location?.lat), longitude: origin?.location ? (origin?.location?.coords?.longitude) : (destination?.location?.lng) }} searchHere={onRegionChangeComplete} setActiveTab={setActiveTab}/>}

        {displayPosts.map(({ id, lat, lng, hrPrice, Lots, nrOfLots }) => (
          <CustomMarker
            key={id}
            coords={{ latitude: lat, longitude: lng }}
            price={hrPrice /* findMinPrice(nrOfLots, Lots) */}
            isSelected={id === selPostId}
            onPress={() => setSelPostId(id)}
          />
        ))}
      </MapView>
      {selPostId && (
        <View style={stylesEMap.carouselView}>
          <FlatList
            data={displayPosts}
            ref={_carousel}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (<PostCard post={item} parkingFee={item.hrPrice /* findMinPrice(item?.nrOfLots, item?.Lots) */} setSelPostId={setSelPostId} />)}
            onScrollToIndexFailed={() => { }}
            bounces={false}
            horizontal
            pagingEnabled={false}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_SPACING}
            snapToAlignment={'start'}
            decelerationRate={'fast'}
            viewabilityConfig={viewConfig.current}
            onViewableItemsChanged={onViewChanged}
            contentContainerStyle={{
              paddingHorizontal: width * 0.05 // Add padding to center first and last cards
            }}
            getItemLayout={(data, index) => ({
              length: CARD_SPACING,
              offset: CARD_SPACING * index,
              index
            })}
          />
        </View>
      )}
    </View>
  );
};

export default CarouselMap;
