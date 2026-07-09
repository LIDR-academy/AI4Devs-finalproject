import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useInteractionState } from '../../hooks/use-interaction-state';
import { Icon } from '../icon/icon';
import { StateLayer } from '../state-layer/state-layer';

export type ChipType = 'assist' | 'filter' | 'input' | 'suggestion';

export type ChipProps = {
  label: string;
  type?: ChipType;
  /** Leading Material Symbols icon name. */
  icon?: string;
  /** Filter chips toggle selected. */
  selected?: boolean;
  onPress?: () => void;
  /** Input chips can show a remove affordance. */
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Chip — MD3 compact element. type: assist | filter | input | suggestion.
 */
export const Chip = ({
  label,
  type = 'assist',
  icon,
  selected = false,
  onPress,
  onRemove,
  disabled = false,
  style,
}: ChipProps) => {
  const { theme } = useUnistyles();
  const { hover, handlers } = useInteractionState();
  const isSelected = type === 'filter' && selected;

  const fg = isSelected ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant;
  const padLeft = icon || isSelected ? 12 : 16;
  const padRight = onRemove ? 8 : 16;

  const content = (
    <>
      {onPress && !disabled ? (
        <StateLayer color={fg} opacity={hover ? theme.stateLayerOpacity.hover : 0} />
      ) : null}
      {isSelected ? <Icon name="check" size={18} color={fg} /> : null}
      {icon && !isSelected ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={styles.label(fg)}>{label}</Text>
    </>
  );

  return (
    <View style={[styles.root(padLeft, padRight, isSelected, disabled), style]}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled }}
          disabled={disabled}
          onPress={onPress}
          onHoverIn={handlers.onHoverIn}
          onHoverOut={handlers.onHoverOut}
          style={styles.body}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.body}>{content}</View>
      )}
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          onPress={onRemove}
          hitSlop={4}
        >
          <Icon name="close" size={18} color={fg} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (padLeft: number, padRight: number, selected: boolean, disabled: boolean) => ({
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingLeft: padLeft,
    paddingRight: padRight,
    borderRadius: theme.shape.chip,
    borderWidth: selected ? 0 : 1,
    borderColor: theme.colors.outline,
    backgroundColor: selected ? theme.colors.secondaryContainer : 'transparent',
    opacity: disabled ? theme.disabledOpacity : 1,
    overflow: 'hidden',
    _web: {
      display: 'inline-flex',
    },
  }),
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  label: (color: string) => ({
    ...theme.typography.labelLarge,
    color,
  }),
}));
