import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

import LotsCarousel from '../../../components/lots/LotsCarousel';
import BookingTimeSheet from '@/components/time/BookingTimeSheet';
import ListingTabs from '../../../components/booking/ListingTabs';
import FooterActionBar from '../../../components/footerNavs/FooterActionBar';
import AmenitiesList from '../../../components/booking/AmenitiesList';
import MoreLessComponent from '../../../components/booking/MoreLessComponent';
import BackBtn from '../../../components/btns/BackBtn';
import { useLocationStore } from '../../../src/store';
import { getBookingEnd } from '../../../src/lib/bookingPricing';
import { getEffectiveBookingStart } from '../../../src/lib/bookingTime';

const { width, height } = Dimensions.get("window");

const rulesText = 'The gate opens by inserting the 4 digit code. The code is received in the welcoming message, after the booking. FYI: There might be a dog in the yard, however peaceful.'
const descriptionText = 'Parking space outside the congestion zone within a secure gated area. The space is lit during night and a CCTV camera is mounted for security reasons. Please read the rules for access info!'

const PlaceDetail = () => {
  const { post, locationId, lotId } = useLocalSearchParams();
  const bookingTime = useLocationStore((state) => state.bookingTime);
  const driverDiscovery = useLocationStore((state) => state.driverDiscovery);
  const selectedLocationId = useLocationStore((state) => state.selectedLocationId);
  const setSelectedParkingTarget = useLocationStore((state) => state.setSelectedParkingTarget);
  const resolvedLocationId = Array.isArray(locationId) ? locationId[0] : (locationId ?? selectedLocationId);
  const resolvedLotId = Array.isArray(lotId) ? lotId[0] : lotId;
  const routeMarker = useMemo(() => {
    if (!post) {
      return null;
    }

    return JSON.parse(Array.isArray(post) ? post[0] : post);
  }, [post]);
  const marker: any = routeMarker ?? (driverDiscovery.locations ?? []).find((location: any) => location?.id === resolvedLocationId) ?? null;

  const lotsArray: any[] = useMemo(
    () => [...(marker?.Lots?.items ?? [])].sort((a, b) => a.lotNr - b.lotNr),
    [marker?.Lots?.items],
  );

  // Lots carousel states
  const [checkedLot, setCheckedLot] = useState<number>(() => lotsArray.length >= 3 ? 1 : 0);

  const [aTab, setATab] = useState('Information')

  // Modal states
  const [showTPicker, setShowTPicker] = useState(false);

  const selectedLot = lotsArray[checkedLot];
  const lotIsBookable = selectedLot?.avlBool !== false;
  const requestedStart = getEffectiveBookingStart(bookingTime);
  const requestedEnd = getBookingEnd(requestedStart, bookingTime.duration);
  const bookingWindows = [...(selectedLot?.Transactions?.items ?? [])];
  const lotIdsKey = lotsArray.map((lot: any) => lot?.id ?? '').join('|');

  const nextAvailableStart = bookingWindows
    .sort((left: any, right: any) => new Date(left.startBooking).getTime() - new Date(right.startBooking).getTime())
    .reduce((nextAvailable: Date | null, booking: any) => {
      const bookingStart = new Date(booking?.startBooking);
      const bookingEnd = new Date(booking?.endBooking);

      if (requestedStart >= bookingEnd || requestedEnd <= bookingStart) {
        return nextAvailable;
      }

      if (!nextAvailable) {
        return bookingEnd;
      }

      return bookingStart <= nextAvailable ? new Date(Math.max(nextAvailable.getTime(), bookingEnd.getTime())) : nextAvailable;
    }, null);

  useEffect(() => {
    if (!marker?.id) {
      return;
    }

    const preferredIndex = resolvedLotId
      ? lotsArray.findIndex((lot: any) => lot?.id === resolvedLotId)
      : -1;
    const nextIndex = preferredIndex >= 0 ? preferredIndex : (lotsArray.length >= 3 ? 1 : 0);
    const nextLotId = lotsArray[nextIndex]?.id ?? null;

    setCheckedLot(nextIndex);

    const currentSelection = useLocationStore.getState();

    if (currentSelection.selectedLocationId !== marker.id || currentSelection.selectedLotId !== nextLotId) {
      setSelectedParkingTarget(marker.id, nextLotId);
    }
  }, [lotIdsKey, lotsArray, marker?.id, resolvedLotId, setSelectedParkingTarget]);

  const formattedNextAvailable = nextAvailableStart
    ? nextAvailableStart.toLocaleString('da-DK', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;
  const bookingBlocked = !lotIsBookable || Boolean(nextAvailableStart);
  const blockedMessage = !lotIsBookable ? 'This lot is currently unavailable' : undefined;

  if (!marker) {
    return null;
  }



    return (

      <LinearGradient
        // Background Linear Gradient
        colors={['rgba(2, 165, 21, 0.78)', 'rgba(20,0,0,1)']}
        style={StyleSheet.absoluteFill}
      >

        <View style={styles.header}>
          <BackBtn />
        </View>

        <LotsCarousel checkedLot={checkedLot} setCheckedLot={setCheckedLot} lotState={marker} />

        <ListingTabs activeFooterTab={aTab} setFooterActiveTab={setATab} />

        {aTab === 'Information' && <>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentInset={{ top: 0, bottom: height * 0.1 }}>
            {/* Amenities */}
            <View style={[styles.fieldContainer, styles.fieldPadding]}>
              <Text style={styles.txtFieldTitle}>This place offers</Text>
              <AmenitiesList />
              <MoreLessComponent text={descriptionText} linesToTruncate={2} />
            </View>

            {/* Rules */}
            <View style={[styles.fieldContainer, styles.fieldPadding]}>
              <Text style={styles.txtFieldTitle}>Rules</Text>
              <MoreLessComponent text={rulesText} linesToTruncate={2} />
            </View>

            {/* Photos & Street view */}
            <View style={[styles.txtInC, { justifyContent: "space-evenly", marginBottom: width * 0.01 }]} >
              <TouchableOpacity style={{ borderColor: "white", borderWidth: 2, padding: width * 0.01, borderRadius: 7, margin: width * 0.05, }}>
                <Image source={{ uri: "https://img.freepik.com/premium-photo/car-near-house-modern-area-comfortable-housing-mortgage-parking-apartment-house-suburbs_114160-1649.jpg" }} style={{ opacity: 0.5, width: width * 0.35, height: width * 0.25, resizeMode: "cover", borderRadius: 7 }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ borderColor: "white", borderWidth: 2, padding: width * 0.01, borderRadius: 7, margin: width * 0.05, }}>
                <Image source={{ uri: "https://img.freepik.com/premium-photo/car-near-house-modern-area-comfortable-housing-mortgage-parking-apartment-house-suburbs_114160-1649.jpg" }} style={{ opacity: 0.5, width: width * 0.35, height: width * 0.25, resizeMode: "cover", borderRadius: 7 }} />
              </TouchableOpacity>
            </View>

          </ScrollView>

          <BookingTimeSheet
            visible={showTPicker}
            onClose={() => setShowTPicker(false)}
            title="Arrival & Duration"
            heightPercent={0.68}
          />
        </>

        }

        <FooterActionBar
          setShowTPicker={setShowTPicker}
          checkedLot={checkedLot}
          marker={marker}
          bookingBlocked={bookingBlocked}
          formattedNextAvailable={formattedNextAvailable ?? undefined}
          blockedMessage={blockedMessage}
        />

      </LinearGradient>

    )

}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: height * 0.05,
    left: 10,
    zIndex: 10,
  },
  fieldContainer: {
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.05,
  },
  fieldPadding: {
    padding: width * 0.03,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  txtFieldTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
  },
  txtInC: {
    alignItems: 'center',
  },
  txtInIcon: {
    textAlign: 'center',
  },
});

export default PlaceDetail
