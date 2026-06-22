import { Text, Dimensions } from 'react-native'
import React from 'react'
import styles from '../../global/style/styles';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import HapticButton from '../HapticButton';
import { useLocationStore } from '../../src/store';

const { width, height } = Dimensions.get("window");

const FooterActionBar = ({ setShowTPicker, checkedLot, marker, bookingBlocked = false }) => {
  const router = useRouter();
  const { bookingTime } = useLocationStore();

  const duration = new Date(bookingTime.duration);

  const formattedDuration = `${duration?.getHours()} hr ${duration
  ?.getMinutes()
  .toString()
  .padStart(2, '0')} min`;

  const displayText = '\n' + formattedDuration

  //console.log("FooterActionBar - checkedLot, lotID", checkedLot, marker.Lots.items[checkedLot].id)

  return (
    <BlurView tint="dark" intensity={70} style={{ position: "absolute", bottom: 0, width, height: height * 0.12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }} >
      <HapticButton onPress={() => setShowTPicker(true)}>
        <Text style={[styles.exText, { color: 'rgba(255,255,255,0.3)', padding: width * 0.025, fontSize: 18, marginHorizontal: width * 0.03 }]}>Duration
          <MaterialCommunityIcons name="chevron-down" size={24} color="rgba(255,255,255,0.2)" />
        <Text style={[styles.exText, { color: '#fff',fontSize: 18 }]}>
          {displayText}
        </Text>

        </Text>
      </HapticButton>
      <HapticButton 
        hapticStyle="medium"
        style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 5, borderRadius: 10, marginHorizontal: width * 0.05, paddingHorizontal: width * 0.03, paddingVertical: 10, opacity: bookingBlocked ? 0.45 : 1 }}
        onPress={() => {
          if (bookingBlocked) {
            return;
          }

          router.push({ pathname: "/driver/pay", params: { hrPrice: marker.hrPrice, lotID: marker.Lots.items[checkedLot].id, startTime: bookingTime.startTime, duration: bookingTime.duration } });
        }}
      >
        <Text style={[styles.exText, { width: width * 0.27 }]}>{bookingBlocked ? 'Unavailable' : 'Book now'}</Text>
        <MaterialCommunityIcons name="chevron-double-right" size={28} color="white" style={{ marginRight: width * 0.025 }} />
      </HapticButton>
    </BlurView>
  )
}

export default FooterActionBar
