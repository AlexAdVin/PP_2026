import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      useNativeModal
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity hitSlop={16} onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <TimeReg onClose={onClose} />
      </View>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  close: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '500',
  },
});