import { useInteractionState } from '@helsoft/hooks';
import { type ReactNode, useMemo } from 'react';
import { Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { layout, spacing } from '../../theme/spacing';
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

export const BUTTON_STATE_LAYER_TEST_ID = 'button-state-layer';

const HEIGHTS: Record<ButtonSize, number> = {
  small: spacing.s8,
  medium: spacing.s10,
  large: spacing.s14,
};
const PAD_X: Record<ButtonSize, number> = {
  small: spacing.s8,
  medium: spacing.s10,
  large: spacing.s12,
};
const PAD_TEXT = spacing.s3;
const PAD_ICON = spacing.s4;
const PAD_ICON_FULL = spacing.s6;
type Insets = { top: number; bottom: number; left: number; right: number };
/** Expands the tappable area to the project's 48dp touch-target token (WCAG 2.5.5 AAA / HIG)
 * without changing the visual box size — sizes already at/above the token get no extra slop. */
const HIT_SLOP: Record<ButtonSize, Insets> = Object.fromEntries(
  Object.entries(HEIGHTS).map(([size, height]) => {
    const slop = Math.max(0, (layout.touchTarget - height) / 2);
    return [size, { top: slop, bottom: slop, left: slop, right: slop }];
  }),
) as Record<ButtonSize, Insets>;

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
  const { hover, press, focus, handlers } = useInteractionState();

  styles.useVariants({ variant });

  const fgByVariant = useMemo(
    () => ({
      filled: theme.colors.onPrimary,
      tonal: theme.colors.onSecondaryContainer,
      elevated: theme.colors.primary,
      outlined: theme.colors.primary,
      text: theme.colors.primary,
    }),
    [theme],
  );
  const fg = fgByVariant[variant];

  // Precedence mirrors MD3's own state-layer stacking: press > focus (WCAG 2.4.7) > hover.
  const stateOpacity = useMemo(
    () =>
      disabled
        ? 0
        : press
          ? theme.stateLayerOpacity.press
          : focus
            ? theme.stateLayerOpacity.focus
            : hover
              ? theme.stateLayerOpacity.hover
              : 0,
    [disabled, press, focus, hover, theme],
  );
  const hasLabel = children != null;
  const padX = variant === 'text' ? PAD_TEXT : hasLabel ? PAD_X[size] : HEIGHTS[size] / 2;
  const padLeft = icon && hasLabel ? (variant === 'text' ? PAD_ICON : PAD_ICON_FULL) : padX;
  const padRight =
    trailingIcon && hasLabel ? (variant === 'text' ? PAD_ICON : PAD_ICON_FULL) : padX;
  const shadow =
    disabled || variant !== 'elevated'
      ? undefined
      : hover
        ? styles.elevatedShadowHover
        : styles.elevatedShadow;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      hitSlop={HIT_SLOP[size]}
      {...handlers}
      style={[styles.root(padLeft, padRight, fullWidth, disabled, HEIGHTS[size]), shadow, style]}
    >
      <StateLayer testID={BUTTON_STATE_LAYER_TEST_ID} color={fg} opacity={stateOpacity} />
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
  root: (
    padLeft: number,
    padRight: number,
    fullWidth: boolean,
    disabled: boolean,
    minHeight: number,
  ) => ({
    flexDirection: 'row',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s2,
    paddingLeft: padLeft,
    paddingRight: padRight,
    borderRadius: theme.shape.button,
    opacity: disabled ? theme.disabledOpacity : 1,
    overflow: 'hidden',
    // A floor, not a fixed height, so an enlarged Dynamic Type label can grow the box
    // instead of getting clipped (WCAG 1.4.4). `overflow: hidden` stays — it also clips
    // StateLayer's hover/press wash to the button's rounded shape.
    minHeight,
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
    },
  }),
  label: (color: string) => ({
    ...theme.typography.labelLarge,
    color,
  }),
  elevatedShadow: theme.elevation.level1,
  elevatedShadowHover: theme.elevation.level2,
}));
