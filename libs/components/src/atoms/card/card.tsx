import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useInteractionState } from '../../hooks/use-interaction-state';
import { StateLayer } from '../state-layer/state-layer';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export type CardProps = {
  children?: ReactNode;
  variant?: CardVariant;
  /** Interactive cards raise elevation and show a state layer on hover. */
  interactive?: boolean;
  padding?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Card — MD3 surface container. variant: elevated | filled | outlined.
 */
export const Card = ({ children, variant = 'elevated', interactive = false, padding = 16, onPress, style }: CardProps) => {
  const { theme } = useUnistyles();
  const { hover, handlers } = useInteractionState();

  styles.useVariants({ variant });
  const pressable = interactive || !!onPress;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.root(padding),
    interactive && hover ? styles.shadowHover : styles.shadowRest,
    style,
  ];

  if (!pressable) {
    return <View style={containerStyle}>{children}</View>;
  }

  return (
    <Pressable onPress={onPress} onHoverIn={handlers.onHoverIn} onHoverOut={handlers.onHoverOut} style={containerStyle}>
      {interactive ? <StateLayer opacity={hover ? theme.stateLayerOpacity.hover : 0} /> : null}
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (padding: number) => ({
    borderRadius: theme.shape.card,
    padding,
    overflow: 'hidden',
    variants: {
      variant: {
        elevated: { backgroundColor: theme.colors.surfaceContainerLow },
        filled: { backgroundColor: theme.colors.surfaceContainerHighest },
        outlined: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
      },
    },
  }),
  shadowRest: {
    variants: {
      variant: {
        elevated: theme.elevation.level1,
        filled: {},
        outlined: {},
      },
    },
  },
  shadowHover: {
    variants: {
      variant: {
        elevated: theme.elevation.level2,
        filled: theme.elevation.level1,
        outlined: theme.elevation.level1,
      },
    },
  },
}));
