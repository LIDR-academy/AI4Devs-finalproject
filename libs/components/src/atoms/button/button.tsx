import { ReactNode } from 'react';
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useInteractionState } from '../../hooks/use-interaction-state';
import { spacing } from '../../theme/spacing';
import { Icon } from '../icon/icon';
import { StateLayer } from '../state-layer/state-layer';

export type ButtonVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading Material Symbols icon name. */
  icon?: string;
  trailingIcon?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const HEIGHTS: Record<ButtonSize, number> = { small: spacing.s8, medium: spacing.s10, large: spacing.s14 };
const PAD_X: Record<ButtonSize, number> = { small: spacing.s8, medium: spacing.s10, large: spacing.s12 };

/**
 * Button — Material Design 3 common button.
 * Variants: filled | tonal | elevated | outlined | text.
 */
export const Button = ({
  children,
  variant = 'filled',
  size = 'medium',
  icon,
  trailingIcon,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
}: ButtonProps) => {
  const { theme } = useUnistyles();
  const { hover, press, handlers } = useInteractionState();

  styles.useVariants({ variant, size });

  const fgByVariant: Record<ButtonVariant, string> = {
    filled: theme.colors.onPrimary,
    tonal: theme.colors.onSecondaryContainer,
    elevated: theme.colors.primary,
    outlined: theme.colors.primary,
    text: theme.colors.primary,
  };
  const fg = fgByVariant[variant];

  const stateOpacity = disabled
    ? 0
    : press
      ? theme.stateLayerOpacity.press
      : hover
        ? theme.stateLayerOpacity.hover
        : 0;
  const hasLabel = children != null;
  const padX = variant === 'text' ? 12 : hasLabel ? PAD_X[size] : HEIGHTS[size] / 2;
  const padLeft = icon && hasLabel ? (variant === 'text' ? 16 : 24) : padX;
  const padRight = trailingIcon && hasLabel ? (variant === 'text' ? 16 : 24) : padX;
  const shadow =
    disabled || variant !== 'elevated' ? undefined : hover ? styles.elevatedShadowHover : styles.elevatedShadow;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      {...handlers}
      style={[styles.root(padLeft, padRight, fullWidth, disabled), shadow, style]}
    >
      <StateLayer color={fg} opacity={stateOpacity} />
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      {hasLabel ? (
        <Text numberOfLines={1} style={styles.label(fg)}>
          {children}
        </Text>
      ) : null}
      {trailingIcon ? <Icon name={trailingIcon} size={18} color={fg} /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (padLeft: number, padRight: number, fullWidth: boolean, disabled: boolean) => ({
    flexDirection: 'row',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingLeft: padLeft,
    paddingRight: padRight,
    borderRadius: theme.shape.button,
    opacity: disabled ? theme.disabledOpacity : 1,
    overflow: 'hidden',
    variants: {
      variant: {
        filled: { backgroundColor: theme.colors.primary },
        tonal: { backgroundColor: theme.colors.secondaryContainer },
        elevated: { backgroundColor: theme.colors.surfaceContainerLow },
        outlined: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.outline,
        },
        text: { backgroundColor: 'transparent' },
      },
      size: {
        small: { height: HEIGHTS.small },
        medium: { height: HEIGHTS.medium },
        large: { height: HEIGHTS.large },
      },
    },
  }),
  label: (color: string) => ({
    ...theme.typography.labelLarge,
    color,
  }),
  elevatedShadow: theme.elevation.level1,
  elevatedShadowHover: theme.elevation.level2,
}));
