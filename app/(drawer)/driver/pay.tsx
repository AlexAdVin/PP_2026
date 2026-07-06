import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
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
import BlurView from 'expo-blur/build/BlurView'

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
{/* About */}
<View style={stylesPay.payHeroWrapper}>
  <LinearGradient
    colors={[
      'rgba(255,255,255,0.16)',
      'rgba(255,255,255,0.06)',
      'rgba(0,0,0,0.12)',
    ]}
   style={stylesPay.payHeroCard}
   >
    <View style={stylesPay.payHeroTopRow}>
      <View style={stylesPay.payHeroPill}>
        <MaterialCommunityIcons name="parking" size={24} color="#fff" />
        <Text style={stylesPay.payHeroPillText}>Private parking</Text>
      </View>
      <View style={stylesPay.payHeroAccessPill}>
        <View style={stylesPay.payHeroAccessDot} />
        <Text style={stylesPay.payHeroAccessText}>24/7 access</Text>
      </View>
    </View>

    <View style={stylesPay.payHeroIconWrap}>
     <MaterialCommunityIcons name="car-brake-parking" size={38} color="#fff" />
    </View>

    <Text style={stylesPay.payHeroEyebrow}>
    {cachedLocation?.locName ?? 'Selected parking spot'}
    </Text>

   <Text style={stylesPay.payHeroTitle}>
      Confirm your{'\n'}private spot.
    </Text>

    <Text style={stylesPay.payHeroSubtitle}>
     {selectedLot?.lotNr
        ? `Reserved space · Lot ${selectedLot.lotNr}`
        : 'Reserved private parking space'}
    </Text>

    <View style={stylesPay.payHeroBottomRow}>
      <View>
        <Text style={stylesPay.payHeroSmallLabel}>Hourly rate</Text>
        <Text style={stylesPay.payHeroPrice}>
          {new Intl.NumberFormat('da', {
            style: 'currency',
            currency: 'DKK',
          }).format(hourlyPrice)}
        </Text>
      </View>

      <View style={stylesPay.payHeroVerified}>
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={18}
          color="#D7FFE6"
        />
        <Text style={stylesPay.payHeroVerifiedText}>Verified host</Text>
      </View>
    </View>
  </LinearGradient>
</View>

{/* Parking info */}
<TouchableOpacity
  activeOpacity={0.86}
  onPress={() => setShowTPicker(true)}
  style={stylesPay.parkingInfoFloatingWrap}
>
  <BlurView intensity={50} tint="light" style={stylesPay.parkingInfoGlass}>
    <View style={stylesPay.parkingInfoIItem}>
      <Text style={stylesPay.parkingInfoValue}>
        {start.toLocaleString('en-UK', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
          timeZone: 'Europe/Copenhagen',
        })}
      </Text>
      <Text style={stylesPay.parkingInfoLabel}>Arrival</Text>
    </View>

    <View style={stylesPay.parkingInfoDivider} />

    <View style={stylesPay.parkingInfoCenter}>
      <View style={stylesPay.parkingInfoCenter}>
        <View style={stylesPay.parkingInfoIconCircle}>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#0F172A" />
        </View>
        <Text style={stylesPay.parkingInfoEditText}>Edit time</Text>
      </View>
    </View>

    <View style={stylesPay.parkingInfoDivider} />

    <View style={stylesPay.parkingInfoItem}>
      <Text style={stylesPay.parkingInfoValue}>{formattedEnd}</Text>
      <Text style={stylesPay.parkingInfoLabel}>Departure</Text>
    </View>
  </BlurView>
</TouchableOpacity>

{/*         <View style={stylesPay.aboutContainer}>
          <View style={stylesPay.aboutImageWrap}>
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)']}
              style={stylesPay.aboutImagePlaceholder}
            >
              <MaterialCommunityIcons
                name="parking"
                size={42}
                color="#fff"
              />
            </LinearGradient>
          </View>

          <View style={stylesPay.aboutContent}>
            <View style={stylesPay.aboutHeaderRow}>
              <Text style={stylesPay.aboutTitle}>
                {cachedLocation?.locName ?? 'Private parking'}
              </Text>

              <View style={stylesPay.aboutBadge}>
                <View style={stylesPay.aboutBadgeDot} />
                <Text style={stylesPay.aboutBadgeText}>Open 24/7</Text>
              </View>
            </View>

            <Text style={stylesPay.aboutSubtitle}>
              Reserved private space
              {selectedLot?.lotNr ? ` · Lot ${selectedLot.lotNr}` : ''}
            </Text>

            <View style={stylesPay.aboutMetaRow}>
              <View style={stylesPay.aboutMetaItem}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={16}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={stylesPay.aboutMetaText}>Verified host</Text>
              </View>

              <View style={stylesPay.aboutMetaDivider} />

              <View style={stylesPay.aboutMetaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={stylesPay.aboutMetaText}>
                  Ends {formattedEnd}
                </Text>
              </View>
            </View>

            <View style={stylesPay.aboutFooter}>
              <Text style={stylesPay.aboutFooterLabel}>Hourly rate</Text>
              <Text style={stylesPay.aboutFooterPrice}>
                {new Intl.NumberFormat('da', {
                  style: 'currency',
                  currency: 'DKK',
                }).format(hourlyPrice)}
              </Text>
            </View>
          </View>
        </View> */}

        {/* Parking info */}
        <TouchableOpacity onPress={() => setShowTPicker(true)} style={[styles.txtInC, { backgroundColor: "rgba(0,0,0,0.1)", paddingVertical: width * 0.03, paddingHorizontal: width * 0.06 }]}>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.5)" }}>Parking from</Text>
            <Text style={{ color: "#fff" }}>Today at {start.toLocaleString('en-UK', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Copenhagen' })}</Text>
          </View>
          <View style={{ width: 100, alignItems: "center" }}>
            <MaterialCommunityIcons name="arrow-right" size={28} color="#fff" />
          </View>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.5)" }}>Parking until</Text>
            <Text style={{ color: "#fff" }}>Today at {formattedEnd}</Text>
          </View>
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
  payHeroWrapper: {
    marginHorizontal: 20,
    marginTop: height * 0.025,
  },

  payHeroCard: {
  minHeight: height * 0.32,
  borderRadius: 34,
  padding: 24,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.16)',
  backgroundColor: 'rgba(255,255,255,0.08)',
},

  payHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  payHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  payHeroPillText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },

payHeroAccessPill: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 999,
  backgroundColor: 'rgba(46,204,113,0.14)',
  borderWidth: 1,
  borderColor: 'rgba(46,204,113,0.22)',
},

payHeroAccessDot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: '#2ecc71',
  marginRight: 6,
},

  payHeroAccessText: {
    color: '#D7FFE6',
    fontSize: 14,
    fontWeight: '700',
  },

  payHeroIconWrap: {
  width: 68,
  height: 88,
  borderRadius: 24,
  backgroundColor: 'rgba(255,255,255,0.14)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.14)',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 34,
  marginBottom: 22,
},

payHeroEyebrow: {
  color: 'rgba(255,255,255,0.68)',
  fontSize: 13,
  letterSpacing: 0.4,
  marginBottom: 8,
},

  payHeroTitle: {
    color: '#fff',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.4,
  },

  payHeroSubtitle: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    width: '92%',
  },

payHeroBottomRow: { 
  marginTop: 26,
  paddingTop: 20,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.1)',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

payHeroSmallLabel: {
  color: 'rgba(255,255,255,0.48)',
  fontSize: 12,
  marginBottom: 4,
},
  payHeroPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  payHeroVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  payHeroVerifiedText: {
    color: '#D7FFE6',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  parkingInfoFloatingWrap: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: width * 0.04,
  borderRadius: 28,
  },

parkingInfoGlass: {
  borderRadius: 28,
  paddingVertical: 18,
  paddingHorizontal: 16,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.55)',
  backgroundColor: 'rgba(255,255,255,0.34)',
},

  parkingInfoItem: {
    flex: 1,
    alignItems: 'center',
  },

  parkingInfoVValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },

  parkingInfoLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

parkingInfoCenter: {
 flex: 0.9,
    alignItems: 'center',
},

parkingInfoIconCircle: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: 'rgba(255,255,255,0.78)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 5,
},

parkingInfoIItem: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

parkingInfoValue: {
  color: '#0F172A',
  fontSize: 23,
  fontWeight: '800',
  letterSpacing: -0.7,
},

parkingInfoDivider: {
  width: 1,
  height: 46,
  backgroundColor: 'rgba(15,23,42,0.13)',
},

parkingInfoEditText: {
  color: '#334155',
  fontSize: 11,
  fontWeight: '800',
},


});

export default Pay
