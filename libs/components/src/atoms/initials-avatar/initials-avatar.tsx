import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { InitialsAvatarProps } from './initials-avatar.types';

export const InitialsAvatar = ({
  accessibilityLabel,
  accessibilityState,
  initials,
  onPress,
  style,
}: InitialsAvatarProps) => {
  const content = <Text style={styles.label}>{initials}</Text>;

  if (!onPress) {
    return <View style={[styles.root, style]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={[styles.root, style]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    width: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    borderRadius: theme.shape.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
  },
  label: {
    ...theme.typography.labelLarge,
    color: theme.colors.onPrimaryContainer,
  },
}));
