import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
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

const { width, height } = Dimensions.get("window");

const cancelPolicy = 'I agree with the House Rules, Cancellation Policy and the Guest Refund Policy. I understand and agree to pay the total amount shown which include Service Fees.'

const Pay = () => {
  const { hrPrice, lotID } = useLocalSearchParams();
//console.log("Pay - hrPrice -->", hrPrice)

  // Convert string to number
  const hourlyPrice = Number(hrPrice);
  const resolvedLotId = Array.isArray(lotID) ? lotID[0] : lotID;

  const router = useRouter();
  const { bookingTime } = useLocationStore();
  const session = useAuthStore((state) => state.session);
  const openModal = useAuthStore((state) => state.openModal);

  const [showTPicker, setShowTPicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSheetHeight, setPaymentSheetHeight] = useState(0.55);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const start = new Date(bookingTime.startTime);
  const duration = new Date(bookingTime.duration);
  const parkingSessionEnd = getBookingEnd(start, duration);
  const pricing = calculateBookingPricing(hourlyPrice, duration);

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

      Alert.alert(
        'Booking confirmed',
        `Reference ${transaction.bookingReference}\n${new Intl.NumberFormat('da', { style: 'currency', currency: 'DKK' }).format(transaction.totalAmount)}`,
        [{ text: 'OK', onPress: () => router.replace('/') }],
      );
    } catch (error: any) {
      console.error('Failed to create booking transaction', error);
      Alert.alert('Could not complete booking', error?.message ?? 'Please try a different time slot.');
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
        <View style={[styles.txtInC, { marginBottom: width * 0.01, padding: width * 0.05 }]}>
          <View style={{ borderColor: "white", borderWidth: 2, padding: width * 0.01, borderRadius: 7 }}>
            <View style={{ width: width * 0.35, height: width * 0.25, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 7 }} />
          </View>
          <View>
            <Text style={{ color: "#fff" }}>Open 24/7</Text>
          </View>
        </View>

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
    </LinearGradient>
  )
}

export default Pay
