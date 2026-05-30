/**
 * useHapticFeedback Hook
 *
 * Provides consistent haptic feedback across the app for navigation and interactions
 * Handles platform differences (iOS vs Android) and gracefully degrades on unsupported platforms
 *
 * @returns {Object} { triggerHaptic }
 *   - triggerHaptic(style): Function to trigger haptic feedback
 *     @param {string} style - 'light' | 'medium' | 'heavy' | 'selection'
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const useHapticFeedback = () => {
  /**
   * Trigger haptic feedback with specified style
   *
   * @param {string} style - The haptic feedback style
   *   - 'light': Light impact (iOS) or selection (Android)
   *   - 'medium': Medium impact (iOS) or selection (Android)
   *   - 'heavy': Heavy impact (iOS) or selection (Android)
   *   - 'selection': Selection feedback (both platforms)
   */
  const triggerHaptic = useCallback(async (style = 'light') => {
    try {
      if (Platform.OS === 'ios') {
        switch (style) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'selection':
            await Haptics.selectionAsync();
            break;
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else if (Platform.OS === 'android') {
        // Android haptic feedback
        switch (style) {
          case 'selection':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Selection);
            break;
          default:
            // Android uses notification feedback for most interactions
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Selection);
        }
      }
    } catch (error) {
      // Haptics not available on this platform or simulator
      console.warn('Haptic feedback not available:', error.message);
    }
  }, []);

  return { triggerHaptic };
};

export default useHapticFeedback;