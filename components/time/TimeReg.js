import { Dimensions, Platform, Pressable, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import styles from '../../global/style/styles';
import BookingTabs from '../booking/BookingTabs';
import TSlots from '../home/TSlots';
import { useLocationStore } from '../../src/store';
import { getEffectiveBookingStart } from '../../src/lib/bookingTime';

const { width, height } = Dimensions.get("screen");

const TimeReg = ({ onClose }) => {
  const bookingTime = useLocationStore((state) => state.bookingTime);
  const setBookingTime = useLocationStore((state) => state.setBookingTime);
  
  const [tsTab, setTsTab] = useState(1);
  const [arrivalTab, setArrivalTab] = useState("Time of arrival");
  const [durationTab, setDurationTab] = useState(null);

  const initialStart = React.useMemo(() => getEffectiveBookingStart(bookingTime), [bookingTime]);
  const initialEnd = React.useMemo(() => {
    const storedDuration = new Date(bookingTime.duration);
    const nextDuration = new Date(initialStart);

    nextDuration.setHours(storedDuration.getHours(), storedDuration.getMinutes(), 0, 0);
    return nextDuration;
  }, [bookingTime.duration, initialStart]);
  const initialDurationHours = Math.max(1, initialEnd.getHours());
  const initialTs = [1, 2, 4].includes(initialDurationHours) ? initialDurationHours : 'other';

  const [date, setDate] = useState(initialStart);
  const [date2, setDate2] = useState(initialEnd);

  useEffect(() => {
    setTsTab(initialTs);
  }, [initialTs]);

  useEffect(() => {
    if (tsTab !== 'other') {
      const nextDate = new Date(date);
      nextDate.setHours(tsTab, 0, 0, 0);
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
              recordStartTime(date, date2);
              onClose?.();
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

        {arrivalTab === 'Duration' && <TSlots tsTab={tsTab} setTsTab={setTsTab} />}

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
    </LinearGradient>
  )
}

export default React.memo(TimeReg)
