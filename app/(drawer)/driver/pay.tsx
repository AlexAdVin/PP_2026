import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import styles from '../../../global/style/styles'
import BackBtn from '@/components/btns/BackBtn'
import BookingTimeSheet from '@/components/time/BookingTimeSheet'
import { useLocationStore } from '../../../src/store'
import { useAuthStore } from '@/src/store/authStore'
import LiquidGlassModal from '@/components/modals/LiquidGlassModal'
import PaymentMethodScreen from '@/app/modal/PaymentMethodScreen'
import { calculateBookingPricing, getBookingEnd } from '@/src/lib/bookingPricing'
import { transactionAdapter } from '@/src/adapters/transactionAdapter'
import type { PaymentMethodSelection } from '@/src/types/payment'
import { publicLocationAdapter } from '@/src/adapters/publicLocationAdapter'
import { findAvailableAlternative } from '@/src/lib/findAvailableAlternative'
import BookingAlternativeModal from '@/components/modals/BookingAlternativeModal'
import { getEffectiveBookingStart } from '@/src/lib/bookingTime'

const { width, height } = Dimensions.get("window");

const cancelPolicy = 'I agree with the House Rules, Cancellation Policy and the Guest Refund Policy. I understand and agree to pay the total amount shown which include Service Fees.'

const RECOVERABLE_AVAILABILITY_MESSAGE_FRAGMENTS = [
  'already booked for that time',
  'not available for booking',
  'lot is not bookable',
];

const isRecoverableAvailabilityError = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  return RECOVERABLE_AVAILABILITY_MESSAGE_FRAGMENTS.some((fragment) => normalizedMessage.includes(fragment));
};

const Pay = () => {
  const { hrPrice, lotID, locationId } = useLocalSearchParams();
//console.log("Pay - hrPrice -->", hrPrice)

  // Convert string to number
  const hourlyPrice = Number(hrPrice);
  const resolvedLotId = Array.isArray(lotID) ? lotID[0] : lotID;
  const resolvedLocationId = Array.isArray(locationId) ? locationId[0] : locationId;

  const router = useRouter();
  const bookingTime = useLocationStore((state) => state.bookingTime);
  const driverDiscovery = useLocationStore((state) => state.driverDiscovery);
  const replaceCachedLocation = useLocationStore((state) => state.replaceCachedLocation);
  const appendTransactionToCachedLot = useLocationStore((state) => state.appendTransactionToCachedLot);
  const upsertDriverReservation = useLocationStore((state) => state.upsertDriverReservation);
  const resetBookingStartSelection = useLocationStore((state) => state.resetBookingStartSelection);
  const session = useAuthStore((state) => state.session);
  const openModal = useAuthStore((state) => state.openModal);

  const [showTPicker, setShowTPicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSheetHeight, setPaymentSheetHeight] = useState(0.55);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parkingInfoHeight, setParkingInfoHeight] = useState(150);
  const [alternativeState, setAlternativeState] = useState({
    visible: false,
    selectedLotNumber: null as number | null,
    alternativeLotNumber: null as number | null,
    alternativeLotId: null as string | null,
  });
  const [successReservationId, setSuccessReservationId] = useState<string | null>(null);

  const start = getEffectiveBookingStart(bookingTime);
  const duration = new Date(bookingTime.duration);
  const parkingSessionEnd = getBookingEnd(start, duration);
  const pricing = calculateBookingPricing(hourlyPrice, duration);
  const cachedLocation = (driverDiscovery.locations ?? []).find((location: any) => location?.id === resolvedLocationId);
  const selectedLot = (cachedLocation?.Lots?.items ?? []).find((lot: any) => lot?.id === resolvedLotId);
  const floatingOverlap = Math.max(34, Math.min(72, Math.round(parkingInfoHeight * 0.50)));

  useEffect(() => {
    if (!successReservationId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      router.replace({
        pathname: '/driver/reservations',
        params: {
          openReservationId: successReservationId,
        },
      });
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [router, successReservationId]);

  // Human readable format
  const formattedEnd = parkingSessionEnd.toLocaleString('en-UK', { hour: 'numeric', minute: 'numeric', hour12: false });
  const formattedStart = start.toLocaleString('en-UK', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Copenhagen' });

  const handlePaymentStepChange = (step: 'choose' | 'details' | 'review') => {
    switch (step) {
      case 'choose':
        setPaymentSheetHeight(0.5);
        break;
      case 'details':
        setPaymentSheetHeight(0.64);
        break;
      case 'review':
        setPaymentSheetHeight(0.52);
        break;
    }
  };

  const handlePaymentContinue = (selection: PaymentMethodSelection) => {
    setSelectedPayment(selection);
    setShowPaymentModal(false);
  };

  const handleGoBackToPlaceDetails = (targetLotId?: string | null) => {
    if (!resolvedLocationId) {
      router.replace('/');
      return;
    }

    router.replace({
      pathname: '/driver/placeDetail',
      params: {
        locationId: resolvedLocationId,
        lotId: targetLotId ?? resolvedLotId ?? undefined,
      },
    });
  };

  const handleConflictRecovery = async (errorMessage: string) => {
    if (!resolvedLocationId) {
      Alert.alert('Could not complete booking', errorMessage);
      return;
    }

    try {
      const latestLocation = await publicLocationAdapter.fetchById(resolvedLocationId);
      replaceCachedLocation(latestLocation);

      const alternativeLot = findAvailableAlternative(
        latestLocation,
        resolvedLotId,
        start,
        parkingSessionEnd,
      );

      const latestSelectedLot = (latestLocation?.Lots?.items ?? []).find((lot: any) => lot?.id === resolvedLotId);

      setAlternativeState({
        visible: true,
        selectedLotNumber: latestSelectedLot?.lotNr ?? selectedLot?.lotNr ?? null,
        alternativeLotNumber: alternativeLot?.lotNr ?? null,
        alternativeLotId: alternativeLot?.id ?? null,
      });
    } catch (refreshError) {
      console.error('Failed to refresh location after booking conflict', refreshError);
      Alert.alert('Could not complete booking', errorMessage);
    }
  };

  const handleConfirm = async () => {
    if (!session) {
      openModal('payment-required');
      return;
    }

    if (!resolvedLotId) {
      Alert.alert('Missing booking information', 'No parking lot was selected for this booking.');
      return;
    }

    if (!selectedPayment) {
      setShowPaymentModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const transaction = await transactionAdapter.createBookingTransaction({
        lotId: resolvedLotId,
        startBooking: start.toISOString(),
        endBooking: parkingSessionEnd.toISOString(),
        hourlyRate: hourlyPrice,
        paymentMethod: selectedPayment,
      });

      if (resolvedLocationId && resolvedLotId) {
        appendTransactionToCachedLot({
          locationId: resolvedLocationId,
          lotId: resolvedLotId,
          transaction: {
            id: transaction.id,
            lotID: transaction.lotId,
            startBooking: transaction.startBooking,
            endBooking: transaction.endBooking,
            status: transaction.status,
          },
        });
      }

      upsertDriverReservation({
        id: transaction.id,
        bookingReference: transaction.bookingReference,
        status: transaction.status,
        locationId: resolvedLocationId,
        locationName: cachedLocation?.locName ?? 'Parking reservation',
        lotId: resolvedLotId,
        lotNumber: selectedLot?.lotNr ?? null,
        startBooking: transaction.startBooking,
        endBooking: transaction.endBooking,
        hourlyRate: transaction.hourlyRate,
        parkingAmount: transaction.parkingAmount,
        serviceFeeAmount: transaction.serviceFeeAmount,
        totalAmount: transaction.totalAmount,
        currencyCode: transaction.currencyCode,
        paymentMethodLabel: transaction.paymentMethodLabel,
        bookedAt: transaction.bookedAt,
      });

      resetBookingStartSelection();

      setSuccessReservationId(transaction.id);
    } catch (error: any) {
      console.error('Failed to create booking transaction', error);

      const errorMessage = error?.message ?? 'Please try a different time slot.';

      if (isRecoverableAvailabilityError(errorMessage)) {
        await handleConflictRecovery(errorMessage);
      } else {
        Alert.alert('Could not complete booking', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(200,0,0,0.05)', 'rgba(20,0,0,1)']}
      style={StyleSheet.absoluteFill}
    >
      <View style={{ flexDirection: "row", height: height * 0.12, backgroundColor: "rgba(0,0,0,0.09)", alignItems: "flex-end", justifyContent: "center" }}>
        <Text style={{ bottom: height * 0.025, color: "#fff", fontSize: 16 }}>Confirm and pay</Text>
      </View>

      <View style={{ position: "absolute", top: height * 0.05, left: 10, zIndex: 10 }}>
        <BackBtn />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentInset={{ top: 0, bottom: height * 0.1 }}>
        {/* About */}
        <View style={stylesPay.aboutWrap}>
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={stylesPay.aboutCard}
          >
            <Text style={stylesPay.aboutEyebrow}>About this reservation</Text>
            <Text style={stylesPay.aboutTitle}>{cachedLocation?.locName ?? 'Selected parking space'}</Text>
            <Text style={stylesPay.aboutSubtitle}>
              Lot {selectedLot?.lotNr ?? 'Selected'} · Private host parking · Flexible arrival
            </Text>
          </LinearGradient>
        </View>

        {/* Parking info */}
        <TouchableOpacity
          onPress={() => setShowTPicker(true)}
          activeOpacity={0.92}
          onLayout={(event) => {
            const nextHeight = Math.round(event.nativeEvent.layout.height);

            if (nextHeight > 0 && nextHeight !== parkingInfoHeight) {
              setParkingInfoHeight(nextHeight);
            }
          }}
          style={[
            stylesPay.parkingInfoWrap,
            {
              marginTop: -floatingOverlap,
              marginBottom: -floatingOverlap,
            },
          ]}
        >
          <BlurView intensity={60} tint="light" style={stylesPay.parkingInfoCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.18)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={stylesPay.parkingInfoTopRow}>
              <Text style={stylesPay.parkingInfoLabel}>Parking info</Text>
              <View style={stylesPay.parkingInfoEditPill}>
                <Text style={stylesPay.parkingInfoEditText}>Edit</Text>
              </View>
            </View>

            <View style={stylesPay.parkingInfoTimesRow}>
              <View style={stylesPay.timeColumn}>
                <Text style={stylesPay.timeEyebrow}>Park from</Text>
                <Text style={stylesPay.timeValue}>Today at {formattedStart}</Text>
              </View>

              <View style={stylesPay.timeArrowWrap}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="#0F172A" />
              </View>

              <View style={stylesPay.timeColumn}>
                <Text style={stylesPay.timeEyebrow}>Park until</Text>
                <Text style={stylesPay.timeValue}>Today at {formattedEnd}</Text>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Price breakdown */}
        <View
          style={[
            styles.fieldContainer,
            stylesPay.priceBreakdownCard,
            {
              paddingTop: width * 0.06 + floatingOverlap,
            },
          ]}
        > 
          <Text style={styles.txtFieldTitle}>Price details</Text>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: height * 0.02 }}>
            <Text style={{ color: "#fff" }}>Parking price</Text>
            <Text style={{ color: "#fff" }}>
              {new Intl.NumberFormat('da', { style: "currency", currency: "DKK" }).format(pricing.parkingAmount)}
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: height * 0.01 }}>
            <Text style={{ color: "#fff" }}>Transaction fee</Text>
            <Text style={{ color: "#fff" }}>
              {new Intl.NumberFormat('da', { style: "currency", currency: "DKK" }).format(pricing.serviceFeeAmount)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: height * 0.02 }}>
            <Text style={{ color: "#fff" }}>Total (DKK)</Text>
            <Text style={{ color: "#fff" }}>
              {new Intl.NumberFormat('da', { style: "currency", currency: "DKK" }).format(pricing.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Vehicle */}
        <Text style={styles.titleIn}>Vehicle</Text>
        <TouchableOpacity style={styles.txtInC}>
          <MaterialCommunityIcons name="car-multiple" size={24} style={styles.txtInIcon} />
          <Text style={styles.txtInput}>Select vehicle</Text>
          <Entypo name="chevron-thin-right" size={18} color="#fff" style={{ marginRight: width * 0.05 }} />
        </TouchableOpacity>

        {/* Payment */}
        <Text style={styles.titleIn}>Payment</Text>
        <TouchableOpacity style={styles.txtInC} onPress={() => setShowPaymentModal(true)}>
          <MaterialCommunityIcons name="credit-card-check-outline" size={24} style={styles.txtInIcon} />
          <View style={styles.txtInCFlex}>
            <Text style={styles.txtMultiInfo}>{selectedPayment?.label ?? 'Choose payment method'}</Text>
            <Text style={styles.txtMultiSubInfo}>
              {selectedPayment ? 'Stored only as a masked booking record' : 'Card, MobilePay or Apple Pay'}
            </Text>
          </View>
          <Entypo name="chevron-thin-right" size={18} color="#fff" style={{ marginRight: width * 0.05 }} />
        </TouchableOpacity>

        <View style={[styles.fieldContainer, styles.fieldPadding]}>
          <Text style={{ color: "#fff" }}>{cancelPolicy}</Text>
        </View>
      </ScrollView>

      <View style={{ marginBottom: height * 0.06 }}>
        <TouchableOpacity disabled={isSubmitting} onPress={handleConfirm} style={{ height: 50, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', alignSelf: "center", width: width * 0.9, marginTop: height * 0.02, opacity: isSubmitting ? 0.6 : 1 }}>
          <Text style={{ fontWeight: "500", fontSize: 20 }}>{isSubmitting ? 'Processing...' : 'Confirm and pay'}</Text>
        </TouchableOpacity>
      </View>

      <BookingTimeSheet
        visible={showTPicker}
        onClose={() => setShowTPicker(false)}
        title="Edit Arrival & Duration"
        heightPercent={0.60}
      />

      {showPaymentModal && (
        <LiquidGlassModal heightPercent={paymentSheetHeight} onClose={() => setShowPaymentModal(false)}>
          <PaymentMethodScreen
            amountLabel={new Intl.NumberFormat('da', { style: 'currency', currency: 'DKK' }).format(pricing.totalAmount)}
            initialSelection={selectedPayment}
            onContinue={handlePaymentContinue}
            onStepChange={handlePaymentStepChange}
          />
        </LiquidGlassModal>
      )}

      <BookingAlternativeModal
        visible={alternativeState.visible}
        selectedLotNumber={alternativeState.selectedLotNumber}
        alternativeLotNumber={alternativeState.alternativeLotNumber}
        hasAlternative={Boolean(alternativeState.alternativeLotId)}
        onAcceptAlternative={() => {
          setAlternativeState((currentState) => ({
            ...currentState,
            visible: false,
          }));
          handleGoBackToPlaceDetails(alternativeState.alternativeLotId);
        }}
        onAcknowledge={() => {
          setAlternativeState((currentState) => ({
            ...currentState,
            visible: false,
          }));
          handleGoBackToPlaceDetails(alternativeState.alternativeLotId ?? resolvedLotId);
        }}
      />

      {successReservationId ? (
        <View style={stylesPay.successOverlay}>
          <LottieView
            autoPlay
            loop={false}
            source={require('@/assets/lottie/done/Comp 1.json')}
            style={stylesPay.successAnimation}
          />
          <Text style={stylesPay.successTitle}>Booking confirmed</Text>
          <Text style={stylesPay.successBody}>Preparing your reservation passport.</Text>
        </View>
      ) : null}
    </LinearGradient>
  )
}

const stylesPay = StyleSheet.create({
  aboutWrap: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },
  aboutCard: {
    minHeight: 188,
    borderRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 72,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  aboutEyebrow: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  aboutTitle: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
    marginTop: 14,
    letterSpacing: -0.9,
  },
  aboutSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  parkingInfoWrap: {
    marginHorizontal: 20,
    borderRadius: 28,
    overflow: 'hidden',
    zIndex: 3,
  },
  parkingInfoCard: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  parkingInfoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  parkingInfoLabel: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  parkingInfoEditPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  parkingInfoEditText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  parkingInfoTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    flex: 1,
  },
  timeEyebrow: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 6,
  },
  timeValue: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  timeArrowWrap: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBreakdownCard: {
    paddingHorizontal: width * 0.06,
    paddingBottom: width * 0.06,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: 'rgba(5,10,18,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  successAnimation: {
    width: 190,
    height: 190,
  },
  successTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 18,
  },
  successBody: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Pay
