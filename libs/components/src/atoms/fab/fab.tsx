import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useInteractionState } from '../../hooks/use-interaction-state';
import { spacing } from '../../theme/spacing';
import { Icon } from '../icon/icon';
import { StateLayer } from '../state-layer/state-layer';

export type FabSize = 'small' | 'regular' | 'large';
export type FabColor = 'primary' | 'secondary' | 'tertiary' | 'surface';

export type FabProps = {
  /** Material Symbols icon name. */
  icon?: string;
  /** Extended FAB label. */
  label?: string;
  size?: FabSize;
  color?: FabColor;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const DIMS: Record<FabSize, number> = { small: spacing.s10, regular: spacing.s14, large: spacing.s24 };
const ICON_SIZES: Record<FabSize, number> = { small: 24, regular: 24, large: 36 };

/**
 * Fab — MD3 Floating Action Button. The single most prominent action;
 * one per screen, bottom-right. Passing `label` renders the extended variant.
 */
export const Fab = ({
  icon,
  label,
  size = 'regular',
  color = 'primary',
  onPress,
  accessibilityLabel,
  style,
}: FabProps) => {
  const { theme } = useUnistyles();
  const { hover, press, handlers } = useInteractionState();

  styles.useVariants({ color, size });

  const fgByColor: Record<FabColor, string> = {
    primary: theme.colors.onPrimaryContainer,
    secondary: theme.colors.onSecondaryContainer,
    tertiary: theme.colors.onTertiaryContainer,
    surface: theme.colors.primary,
  };
  const fg = fgByColor[color];
  const extended = !!label;
  const stateOpacity = press ? theme.stateLayerOpacity.press : hover ? theme.stateLayerOpacity.hover : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      {...handlers}
      style={[styles.root(extended ? undefined : DIMS[size], extended), hover ? styles.shadowHover : styles.shadowRest, style]}
    >
      <StateLayer color={fg} opacity={stateOpacity} />
      {icon ? <Icon name={icon} size={ICON_SIZES[size]} color={fg} /> : null}
      {extended ? <Text style={styles.label(fg)}>{label}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (width: number | undefined, extended: boolean) => ({
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width,
    paddingHorizontal: extended ? 20 : 0,
    overflow: 'hidden',
    variants: {
      color: {
        primary: { backgroundColor: theme.colors.primaryContainer },
        secondary: { backgroundColor: theme.colors.secondaryContainer },
        tertiary: { backgroundColor: theme.colors.tertiaryContainer },
        surface: { backgroundColor: theme.colors.surfaceContainerHigh },
      },
      size: {
        small: { height: DIMS.small, borderRadius: theme.shape.fab },
        regular: { height: DIMS.regular, borderRadius: theme.shape.fab },
        large: { height: DIMS.large, borderRadius: theme.shape.xl },
      },
    },
  }),
  label: (color: string) => ({
    ...theme.typography.labelLarge,
    color,
  }),
  shadowRest: theme.elevation.level3,
  shadowHover: theme.elevation.level4,
}));
