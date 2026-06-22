import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Image } from 'react-native';
import useCheckAvailability from '../../global/utils/useCheckAvailability';
import useHapticFeedback from '../../global/utils/useHapticFeedback';

const { width, height } = Dimensions.get("screen");

// Car top view silhouette image for occupied lots
let TOPCAR;
try {
  TOPCAR = require("../../assets/lotImg/carTopV_W.png");
} catch {
  // Fallback if local asset not found
  console.warn("Local car image not found, using fallback");
  TOPCAR = null;
}

const ITEM_SIZE = width * 0.23;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;

const LotsCarousel = ({ checkedLot, setCheckedLot, lotState }) => {

  const nrOfLots = lotState?.Lots ? (lotState.Lots.items.length) : (lotState?.length);
  const { getAvailabilityStatus } = useCheckAvailability();
  const { triggerHaptic } = useHapticFeedback();

  const _pLOTS = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;
  const didApplyInitialIndex = useRef(false);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!didApplyInitialIndex.current && nrOfLots > 2 && checkedLot === 1) {
      return;
    }

    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0]?.index;
      if (newIndex !== checkedLot) {
        setCheckedLot(newIndex);
        triggerHaptic('medium');
      }
    }
  });

  useEffect(() => {
    if (_pLOTS.current && typeof checkedLot === 'number' && nrOfLots > 2) {
      _pLOTS.current.scrollToIndex({ index: checkedLot, animated: false });
      didApplyInitialIndex.current = true;
    }
  }, [checkedLot, nrOfLots]);

  const transactionsData = lotState?.Lots ? (lotState.Lots.items) : (lotState);

  return (
    <View style={stylesLotsCarousel.cont}>
      {nrOfLots > 1 ? (
        <Animated.FlatList
          showsHorizontalScrollIndicator={false}
          ref={_pLOTS}
          horizontal
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.min(Math.max(Math.round(offsetX / ITEM_SIZE), 0), nrOfLots - 1);
            didApplyInitialIndex.current = true;
            if (newIndex !== checkedLot) {
              setCheckedLot(newIndex);
              triggerHaptic('medium');
            }
          }}
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          initialScrollIndex={nrOfLots >= 3 ? 1 : 0}
          getItemLayout={(data, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index
          })}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          style={{ flexGrow: 0 }}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
            minimumViewTime: 100,
          }}
          contentContainerStyle={{
            paddingHorizontal: ITEM_SPACING
          }}
          data={lotState?.Lots ? (lotState.Lots.items) : (lotState)}
          keyExtractor={(item) => item.lotNr.toString()}
          renderItem={({ item: { lotNr, avlBool, Transactions }, index }) => {
            const inputRange = [
              (index - 1) * ITEM_SIZE,
              index * ITEM_SIZE,
              (index + 1) * ITEM_SIZE,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [.3, 1, .3]
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [.8, 1, .8]
            });

            const availabilityStatus = avlBool === false
              ? 'Unavailable'
              : getAvailabilityStatus(
                  Transactions?.items,
                  new Date().toISOString()
                );

            return (
              <Animated.View style={{ opacity, transform: [{ scale }], width: ITEM_SIZE }}>
                <View style={stylesLotsCarousel.lotCont}>
                  <Text style={stylesLotsCarousel.heading}>{lotNr}</Text>
                  <View style={[stylesLotsCarousel.parkContOutter, stylesLotsCarousel.parkContInner]}>
                    {availabilityStatus === 'Busy' && TOPCAR ? (
                      <Image 
                        style={stylesLotsCarousel.topCarImg}
                        source={TOPCAR}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={[stylesLotsCarousel.avlTxt, { color: availabilityStatus === 'Available' ? '#4CAF50' : '#FF9800' }]}> 

                        {availabilityStatus}
                      </Text>
                    )}
                  </View>
                </View>
              </Animated.View>
            );
          }}
        />
      ) : (
        <View style={stylesLotsCarousel.lotCont}>
          <Text style={stylesLotsCarousel.heading}>1</Text>
          <View style={[stylesLotsCarousel.parkContOutter, stylesLotsCarousel.parkContOne]}>
            {transactionsData[checkedLot]?.Transactions ? (
              (transactionsData[checkedLot]?.avlBool === false ? 'Unavailable' : getAvailabilityStatus(transactionsData[checkedLot].Transactions?.items, new Date().toISOString())) === 'Busy' && TOPCAR ? (
                <Image 
                  style={stylesLotsCarousel.topCarImg}
                  source={TOPCAR}
                  resizeMode="contain"
                />
              ) : (
                <Text style={[stylesLotsCarousel.avlTxt, { color: (transactionsData[checkedLot]?.avlBool === false ? 'Unavailable' : getAvailabilityStatus(transactionsData[checkedLot].Transactions?.items, new Date().toISOString())) === 'Available' ? '#4CAF50' : '#FF9800' }]}>
                  {transactionsData[checkedLot]?.avlBool === false ? 'Unavailable' : getAvailabilityStatus(transactionsData[checkedLot].Transactions?.items, new Date().toISOString())}
                </Text>
              )
            ) : (
              <Text style={stylesLotsCarousel.avlTxt}>{transactionsData[checkedLot]?.avlBool === false ? 'Unavailable' : 'Available'}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const stylesLotsCarousel = StyleSheet.create({
  cont: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingTop: height * 0.06,
  },
  lotCont: {
    marginTop: height * 0.03,
    marginBottom: height * 0.04,
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  parkContOutter: {
    paddingVertical: '10%',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
    paddingHorizontal: '3%',
  },
  parkContInner: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  parkContOne: {
    height: width * 0.37,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  avlTxt: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: width * 0.01,
    color: "#fff"
  },
  topCarImg: {
    width: 80,
    height: 130,
    resizeMode: "contain",
  }
});

export default LotsCarousel;