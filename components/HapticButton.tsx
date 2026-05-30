import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import useHapticFeedback from '../global/utils/useHapticFeedback';

interface HapticButtonProps extends TouchableOpacityProps {
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'selection';
  children: React.ReactNode;
}

/**
 * Reusable haptic button component for consistent cross-platform haptic feedback
 * Used for navigation and interactive UI elements
 */
export const HapticButton: React.FC<HapticButtonProps> = ({
  hapticStyle = 'light',
  onPress,
  children,
  ...props
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = async (e: any) => {
    await triggerHaptic(hapticStyle);
    onPress?.(e);
  };

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};

export default HapticButton;
