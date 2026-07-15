import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

export type InitialsAvatarProps = {
  accessibilityLabel?: string;
  initials: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};
