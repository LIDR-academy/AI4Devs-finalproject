import { useInteractionState } from '@helsoft/hooks';
import { useMemo } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Icon } from '../icon/icon';
import { StateLayer } from '../state-layer/state-layer';

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

export type IconButtonProps = {
  /** Material Symbols icon name. */
  icon: string;
  variant?: IconButtonVariant;
  size?: number;
  /** Selected state renders the icon filled. */
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * IconButton — MD3 icon-only button.
 * Variants: standard | filled | tonal | outlined.
 */
export const IconButton = ({
  icon,
  variant = 'standard',
  size = 40,
  selected = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
}: IconButtonProps) => {
  const { theme } = useUnistyles();
  const { hover, press, handlers } = useInteractionState();

  styles.useVariants({ variant });

  const fgByVariant = useMemo(
    () => ({
      standard: theme.colors.onSurfaceVariant,
      filled: theme.colors.onPrimary,
      tonal: theme.colors.onSecondaryContainer,
      outlined: theme.colors.onSurfaceVariant,
    }),
    [theme],
  );
  const fg = fgByVariant[variant];
  const stateOpacity = useMemo(
    () =>
      disabled
        ? 0
        : press
          ? theme.stateLayerOpacity.press
          : hover
            ? theme.stateLayerOpacity.hover
            : 0,
    [disabled, press, hover, theme],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      {...handlers}
      style={[styles.root(size, disabled), style]}
    >
      <StateLayer color={fg} opacity={stateOpacity} />
      <Icon name={icon} size={Math.round(size * 0.6)} fill={selected} color={fg} />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (size: number, disabled: boolean) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.full,
    opacity: disabled ? theme.disabledOpacity : 1,
    overflow: 'hidden',
    variants: {
      variant: {
        standard: { backgroundColor: 'transparent' },
        filled: { backgroundColor: theme.colors.primary },
        tonal: { backgroundColor: theme.colors.secondaryContainer },
        outlined: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.outline,
        },
      },
    },
  }),
}));
