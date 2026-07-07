import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import LiquidGlassModal from '@/components/modals/LiquidGlassModal';

import TimeReg from './TimeReg';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  heightPercent?: number;
};

export default function BookingTimeSheet({
  visible,
  onClose,
  title = 'Arrival & Duration',
  heightPercent = 0.72,
}: Props) {
  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      heightPercent={heightPercent}
      titleSlot={<Text style={styles.title}>{title}</Text>}
      useNativeModal
    >
      <View style={styles.content}>
        <TimeReg onClose={onClose} />
      </View>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
});