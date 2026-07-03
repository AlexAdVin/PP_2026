import { Dimensions, Platform, Pressable, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import styles from '../../global/style/styles';
import BookingTabs from '../booking/BookingTabs';
import TSlots from '../home/TSlots';
import { useLocationStore } from '../../src/store';
import { getBookingEnd, getDurationMinutes } from '../../src/lib/bookingPricing';
import BookingAlternativeModal from '../modals/BookingAlternativeModal';
import { findAvailableAlternative, findNextAvailableStartForWindow, getMinutesUntilNextBooking } from '../../src/lib/findAvailableAlternative';

const { width, height } = Dimensions.get("screen");

const TimeReg = ({ setShowTF }) => {
  const router = useRouter();
  const bookingTime = useLocationStore((state) => state.bookingTime);
  const setBookingTime = useLocationStore((state) => state.setBookingTime);
  const driverDiscovery = useLocationStore((state) => state.driverDiscovery);
  const selectedLocationId = useLocationStore((state) => state.selectedLocationId);
  const selectedLotId = useLocationStore((state) => state.selectedLotId);
  
  const [tsTab, setTsTab] = useState(1);
  const [arrivalTab, setArrivalTab] = useState("Time of arrival");
  const [durationTab, setDurationTab] = useState(null);
  const [alternativeState, setAlternativeState] = useState({
    visible: false,
    selectedLotNumber: null,
    alternativeLotNumber: null,
    alternativeLotId: null,
  });

  const currentLocation = useMemo(
    () => (driverDiscovery.locations ?? []).find((location) => location?.id === selectedLocationId) ?? null,
    [driverDiscovery.locations, selectedLocationId],
  );
  const currentLot = useMemo(
    () => (currentLocation?.Lots?.items ?? []).find((lot) => lot?.id === selectedLotId) ?? null,
    [currentLocation, selectedLotId],
  );
  const currentTransactions = useMemo(
    () => currentLot?.Transactions?.items ?? [],
    [currentLot?.Transactions?.items],
  );
  const currentRequestedStart = useMemo(() => new Date(bookingTime.startTime), [bookingTime.startTime]);
  const currentRequestedEnd = useMemo(
    () => getBookingEnd(bookingTime.startTime, bookingTime.duration),
    [bookingTime.duration, bookingTime.startTime],
  );
  const currentBlockedUntil = useMemo(
    () => findNextAvailableStartForWindow(currentTransactions, currentRequestedStart, currentRequestedEnd),
    [currentRequestedEnd, currentRequestedStart, currentTransactions],
  );

  // Start from now on each open unless the selected lot is busy for the requested slot.
  const initialStart = useMemo(() => {
    const now = new Date();

    if (currentBlockedUntil && currentBlockedUntil.getTime() > now.getTime()) {
      return currentBlockedUntil;
    }

    return now;
  }, [currentBlockedUntil]);
  const initialEnd = useMemo(() => {
    const storedDuration = new Date(bookingTime.duration);
    const nextDuration = new Date(initialStart);

    nextDuration.setHours(storedDuration.getHours(), storedDuration.getMinutes(), 0, 0);
    return nextDuration;
  }, [bookingTime.duration, initialStart]);
  const initialDurationMinutes = Math.max(15, getDurationMinutes(initialEnd));
  const initialTs = [15, 30, 45, 60, 120, 240].includes(initialDurationMinutes) ? initialDurationMinutes : 'other';

  const [date, setDate] = useState(initialStart);
  const [date2, setDate2] = useState(initialEnd);
  const availableMinutes = useMemo(() => {
    if (!currentLot || currentLot?.avlBool === false) {
      return 0;
    }

    return getMinutesUntilNextBooking(currentTransactions, date);
  }, [currentLot, currentTransactions, date]);
  const durationOptions = useMemo(
    () => [15, 30, 45, 60, 120, 240].filter((minutes) => availableMinutes === null || minutes <= availableMinutes),
    [availableMinutes],
  );

  useEffect(() => {
    setTsTab(initialTs);
  }, [initialTs]);

  useEffect(() => {
    setDate(initialStart);
    setDate2(initialEnd);
  }, [initialEnd, initialStart]);

  useEffect(() => {
    if (tsTab === 'other') {
      return;
    }

    if (durationOptions.length === 0) {
      setTsTab('other');
      return;
    }

    if (!durationOptions.includes(tsTab)) {
      setTsTab(durationOptions[durationOptions.length - 1]);
    }
  }, [durationOptions, tsTab]);

  useEffect(() => {
    if (tsTab !== 'other') {
      const nextDate = new Date(date);
      nextDate.setHours(0, tsTab, 0, 0);
      setDate2(nextDate);
    }
  }, [date, tsTab]);

  // Save to Zustand store only when user presses Save/Next
  const recordStartTime = (start, duration) => {
    const endTime = duration || date2 || new Date(start.getTime() + 60 * 60 * 1000);
    setBookingTime(start, endTime);
  };

  const onChangeArr = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed') return;
      if (event?.type === 'set' && selectedDate) {
        setDate(selectedDate);
      }
      return;
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChange2 = (event, selectedDate2) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed') return;
      if (event?.type === 'set' && selectedDate2) {
        setDate2(selectedDate2);
      }
      return;
    }

    if (selectedDate2) {
      setDate2(selectedDate2);
    }
  };

  const handleDurationSave = () => {
    const requestedEnd = getBookingEnd(date, date2);
    const selectedDurationMinutes = getDurationMinutes(date2);

    if (availableMinutes !== null && selectedDurationMinutes > availableMinutes) {
      const alternativeLot = findAvailableAlternative(currentLocation, currentLot?.id, date, requestedEnd);

      setAlternativeState({
        visible: true,
        selectedLotNumber: currentLot?.lotNr ?? null,
        alternativeLotNumber: alternativeLot?.lotNr ?? null,
        alternativeLotId: alternativeLot?.id ?? null,
      });
      return;
    }

    recordStartTime(date, date2);
    setShowTF(false);
  };

  const FooterBtn = ({ val }) => {
    return (
      <View style={{ backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", bottom: 0, width, height: height * 0.12, marginVertical: width * 0.08, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }} >
        <Text style={[styles.exText, { color: '#fff', padding: width * 0.025, fontSize: 18, marginHorizontal: width * 0.03 }]}>{val === 'Duration' ? ('Duration •') : ('Start time & date')}
          <Text style={[styles.exText, { color: '#fff', fontSize: 18 }]}>
            {val === 'Duration' ? ('\n' + date2?.getHours() + ' ' + 'hr' + ' ' + date2?.getMinutes().toString().padStart(2, '0') + ' ' + 'min') : ('\n' + date?.toLocaleString('dk',{ timeStyle: 'short', timeZone: 'Europe/Copenhagen'}) + `  •  ${date?.toLocaleString('dk',{ dateStyle: 'medium', timeZone: 'Europe/Copenhagen' }) }` ) }
          </Text>
        </Text>

        <Pressable style={{ flexDirection:"row", alignItems:"center", backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 5, borderRadius: 10, marginHorizontal: width * 0.05, padding: 12 }}
          hitSlop={20}
          onPress={() => {
            if (val === 'Duration') {
              handleDurationSave();
            } else {
              recordStartTime(date, date2);
              setArrivalTab('Duration');
            }
          }}
        >
          <Text style={[styles.exText, { justifyContent:"center" }]}>{val === 'Duration' ? ('Save') : ('Next')}</Text>
          <MaterialCommunityIcons name="chevron-double-right" size={28} color="white" style={{marginRight:width * 0.025}}/>
        </Pressable>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['rgba(200,0,0,0.05)', 'rgba(20,0,0,1)']}
      style={{ flex: 1 }}
    >
      <View style={{ width, flexGrow: 1 }} >
        <BookingTabs
          headText1={'Time of arrival'}
          headText2={'Duration'}
          time={date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0')}
          duration={date2 ? (date2?.getHours() + ' ' + 'hr' + ' ' + date2?.getMinutes().toString().padStart(2, '0') + ' ' + 'min') : ('')}
          arrivalTab={arrivalTab}
          setArrivalTab={setArrivalTab}
          durationTab={durationTab}
          setDurationTab={setDurationTab}
        />

        {arrivalTab === 'Duration' && <TSlots tsTab={tsTab} setTsTab={setTsTab} options={durationOptions} />}

        {arrivalTab === 'Time of arrival' && (
          <View style={{ flex: 0.65, justifyContent: 'center' }}>
            <DateTimePicker
              testID='ArrivalTimePicker'
              value={date}
              mode={'time'}
              minuteInterval={5}
              minimumDate={new Date()}
              themeVariant='dark'
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              onChange={onChangeArr}
              style={styles.datePicker}
            />
          </View>
        )}

        {tsTab === 'other' && arrivalTab === 'Duration' && (
          <DateTimePicker
            testID='DurationTimePicker'
            value={date2 || new Date()}
            mode={Platform.OS === 'ios' ? 'countdown' : 'time'}
            minuteInterval={15}
            is24Hour={false}
            minimumDate={new Date(new Date().setHours(1, 0, 0, 0))}
            themeVariant='dark'
            display='spinner'
            onChange={onChange2}
            style={styles.datePicker}
          />
        )}
      </View>
      <FooterBtn val={arrivalTab} />

      <BookingAlternativeModal
        visible={alternativeState.visible}
        selectedLotNumber={alternativeState.selectedLotNumber}
        alternativeLotNumber={alternativeState.alternativeLotNumber}
        hasAlternative={Boolean(alternativeState.alternativeLotId)}
        title="This slot gets occupied soon"
        message={alternativeState.alternativeLotId
          ? `There is someone else parking here soon, so this duration would overlap on lot ${alternativeState.selectedLotNumber ?? '?'}. We found you an alternative lot ${alternativeState.alternativeLotNumber ?? '?'}.`
          : `There is someone else parking here soon, so this duration would overlap on lot ${alternativeState.selectedLotNumber ?? '?'}. Please shorten the duration or pick another arrival time.`}
        cardTitle={alternativeState.alternativeLotId ? 'Suggested alternative' : 'Adjust your plan'}
        cardText={alternativeState.alternativeLotId
          ? `Switch to lot ${alternativeState.alternativeLotNumber ?? '?'} and continue from place details.`
          : 'Choose a shorter duration that fits before the next booking, or return and select another lot.'}
        primaryButtonLabel="Use alternative"
        secondaryButtonLabel="Okay"
        onAcceptAlternative={() => {
          const nextLotId = alternativeState.alternativeLotId;

          setAlternativeState((currentState) => ({
            ...currentState,
            visible: false,
          }));

          if (!currentLocation?.id || !nextLotId) {
            return;
          }

          setShowTF(false);
          router.replace({
            pathname: '/driver/placeDetail',
            params: {
              locationId: currentLocation.id,
              lotId: nextLotId,
            },
          });
        }}
        onAcknowledge={() => {
          setAlternativeState((currentState) => ({
            ...currentState,
            visible: false,
          }));
        }}
      />
    </LinearGradient>
  )
}

export default React.memo(TimeReg)
