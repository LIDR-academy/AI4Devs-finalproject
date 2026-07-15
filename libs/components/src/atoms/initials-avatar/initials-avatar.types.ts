import type { AccessibilityState, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

export type InitialsAvatarProps = {
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  initials: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};
