import { Text, Dimensions, StyleSheet, View } from 'react-native'
import React from 'react'
import styles from '../../global/style/styles';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticButton } from '../HapticButton';
import { useLocationStore } from '../../src/store';

const { width, height } = Dimensions.get("window");

const FooterActionBar = ({ setShowTPicker, checkedLot, marker, bookingBlocked = false, formattedNextAvailable = '' }) => {
  const router = useRouter();
  const { bookingTime } = useLocationStore();

  const duration = new Date(bookingTime.duration);

  const formattedDuration = `${duration?.getHours()} hr ${duration
  ?.getMinutes()
  .toString()
  .padStart(2, '0')} min`;

  const lotLabel = bookingBlocked && formattedNextAvailable
    ? `This lot opens again from ${formattedNextAvailable}`
    : `Duration\n${formattedDuration}`;

  const primaryLabel = bookingBlocked ? 'Select time' : 'Book now';

  const handlePrimaryPress = () => {
    if (bookingBlocked) {
      setShowTPicker(true);
      return;
    }

    router.push({ pathname: "/driver/pay", params: { hrPrice: marker.hrPrice, locationId: marker.id, lotID: marker.Lots.items[checkedLot].id, startTime: bookingTime.startTime, duration: bookingTime.duration } });
  };

  //console.log("FooterActionBar - checkedLot, lotID", checkedLot, marker.Lots.items[checkedLot].id)

  return (
    <BlurView tint="dark" intensity={70} style={localStyles.footerShell} >
      {bookingBlocked ? (
        <View style={[localStyles.infoCard, localStyles.infoCardBlocked]}>
          <Text style={localStyles.blockedLabel} numberOfLines={2}>
            {lotLabel}
          </Text>
        </View>
      ) : (
        <HapticButton onPress={() => setShowTPicker(true)} style={localStyles.infoCard}>
          <Text style={localStyles.infoTitle}>Duration</Text>
          <View style={localStyles.infoRow}>
            <Text style={localStyles.infoValue}>{formattedDuration}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,255,255,0.7)" />
          </View>
        </HapticButton>
      )}
      <HapticButton 
        hapticStyle="medium"
        style={localStyles.primaryButtonShell}
        onPress={handlePrimaryPress}
      >
        <LinearGradient
          colors={bookingBlocked ? ['#F8FAFC', '#CBD5E1'] : ['#EC4899', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={localStyles.primaryButton}
        >
          <Text style={localStyles.primaryLabel}>{primaryLabel}</Text>
          <MaterialCommunityIcons
            name={bookingBlocked ? 'clock-time-four-outline' : 'chevron-double-right'}
            size={22}
            color={bookingBlocked ? '#0F172A' : '#fff'}
          />
        </LinearGradient>
      </HapticButton>
    </BlurView>
  )
}

const localStyles = StyleSheet.create({
  footerShell: {
    position: 'absolute',
    bottom: 0,
    width,
    minHeight: height * 0.12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(8,12,20,0.58)',
  },
  infoCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  infoCardBlocked: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  infoTitle: {
    ...styles.exText,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoValue: {
    ...styles.exText,
    color: '#FFFFFF',
    fontSize: 18,
  },
  blockedLabel: {
    ...styles.exText,
    color: '#F8FAFC',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButtonShell: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  primaryButton: {
    minWidth: width * 0.34,
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 24,
  },
  primaryLabel: {
    ...styles.exText,
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default FooterActionBar
