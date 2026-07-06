import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons, Entypo, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import styles from '../../../global/style/styles'
import BackBtn from '@/components/btns/BackBtn'
import TimeReg from '@/components/time/TimeReg'
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
  const session = useAuthStore((state) => state.session);
  const openModal = useAuthStore((state) => state.openModal);

  const [showTPicker, setShowTPicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSheetHeight, setPaymentSheetHeight] = useState(0.55);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alternativeState, setAlternativeState] = useState({
    visible: false,
    selectedLotNumber: null as number | null,
    alternativeLotNumber: null as number | null,
    alternativeLotId: null as string | null,
  });
  const [successReservationId, setSuccessReservationId] = useState<string | null>(null);

  const start = new Date(bookingTime.startTime);
  const duration = new Date(bookingTime.duration);
  const parkingSessionEnd = getBookingEnd(start, duration);
  const pricing = calculateBookingPricing(hourlyPrice, duration);
  const cachedLocation = (driverDiscovery.locations ?? []).find((location: any) => location?.id === resolvedLocationId);
  const selectedLot = (cachedLocation?.Lots?.items ?? []).find((lot: any) => lot?.id === resolvedLotId);
  const locationName = cachedLocation?.locName ?? 'Selected parking space';
  const lotLabel = selectedLot?.lotNr ? `Lot ${selectedLot.lotNr}` : 'Reserved lot';
  const parkingFromLabel = start.toLocaleString('en-UK', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: 'Europe/Copenhagen',
  });
  const parkingUntilLabel = parkingSessionEnd.toLocaleString('en-UK', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: 'Europe/Copenhagen',
  });
  const sessionDateLabel = start.toLocaleDateString('en-UK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Copenhagen',
  });

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
        <View style={stylesPay.heroWrapper}>
          <LinearGradient
            colors={['rgba(235,241,244,0.16)', 'rgba(97,126,140,0.14)', 'rgba(12,19,28,0.38)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={stylesPay.heroCard}
          >
            <View style={stylesPay.heroGlow} />

            <View style={stylesPay.heroTopRow}>
              <BlurView intensity={34} tint="light" style={stylesPay.heroPill}>
                <MaterialCommunityIcons name="shield-check-outline" size={14} color="#F8FAFC" />
                <Text style={stylesPay.heroPillText}>Secure checkout</Text>
              </BlurView>

              <BlurView intensity={28} tint="light" style={stylesPay.heroPill}>
                <Text style={stylesPay.heroPillText}>Open 24/7</Text>
              </BlurView>
            </View>

            <View style={stylesPay.heroContent}>
              <Text style={stylesPay.heroEyebrow}>{sessionDateLabel}</Text>
              <Text style={stylesPay.heroTitle}>{locationName}</Text>
              <Text style={stylesPay.heroSubtitle}>
                {lotLabel} reserved with a calm, direct handoff into payment and arrival details.
              </Text>

              <View style={stylesPay.heroMetaRow}>
                <View style={stylesPay.heroMetaCard}>
                  <Text style={stylesPay.heroMetaLabel}>Arrival</Text>
                  <Text style={stylesPay.heroMetaValue}>{parkingFromLabel}</Text>
                </View>

                <View style={stylesPay.heroMetaCard}>
                  <Text style={stylesPay.heroMetaLabel}>Total</Text>
                  <Text style={stylesPay.heroMetaValue}>
                    {new Intl.NumberFormat('da', { style: 'currency', currency: 'DKK' }).format(pricing.totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Parking info */}
        <TouchableOpacity activeOpacity={0.92} onPress={() => setShowTPicker(true)} style={stylesPay.parkingInfoTouchable}>
          <BlurView intensity={52} tint="light" style={stylesPay.parkingInfoCard}>
            <View style={stylesPay.ctaIcon}>
              <MaterialCommunityIcons name="clock-edit-outline" size={18} color="#0F172A" />
            </View>

            <View style={stylesPay.parkingInfoCopy}>
              <Text style={stylesPay.parkingInfoTitle}>Parking info</Text>
              <Text style={stylesPay.parkingInfoSubtitle}>
                {parkingFromLabel} to {parkingUntilLabel} · Tap to edit arrival or duration
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#0F172A"
              style={stylesPay.parkingInfoArrow}
            />
          </BlurView>
        </TouchableOpacity>

        {/* Price breakdown */}
        <View style={[styles.fieldContainer, { padding: width * 0.06 }]}>
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

      <Modal
        visible={showTPicker}
        transparent
        animationType='fade'
        onRequestClose={() => setShowTPicker(false)}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.9)']}
          style={StyleSheet.absoluteFill}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.9)', height: height * 0.85, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
              <View style={{ marginBottom: 10, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.titleModal, { flex: 1 }]}>Edit Arrival & Duration</Text>
                <TouchableOpacity onPress={() => setShowTPicker(false)}>
                  <Text style={{ fontSize: 28, color: "#fff", fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>
              <TimeReg setShowTF={setShowTPicker} />
            </View>
          </View>
        </LinearGradient>
      </Modal>

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
  heroWrapper: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  heroCard: {
    minHeight: 240,
    borderRadius: 34,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(226,232,240,0.12)',
    top: -70,
    right: -30,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heroPillText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  heroContent: {
    marginTop: 'auto',
    paddingTop: 34,
  },
  heroEyebrow: {
    color: 'rgba(241,245,249,0.74)',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: 10,
  },
  heroSubtitle: {
    color: 'rgba(241,245,249,0.78)',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: '92%',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  heroMetaCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroMetaLabel: {
    color: 'rgba(226,232,240,0.74)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroMetaValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  parkingInfoTouchable: {
    marginHorizontal: 20,
    marginTop: -28,
    zIndex: 2,
  },
  parkingInfoCard: {
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.84)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  parkingInfoCopy: {
    flex: 1,
    paddingRight: 10,
  },
  parkingInfoTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  parkingInfoSubtitle: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  parkingInfoArrow: {
    marginLeft: 'auto',
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
