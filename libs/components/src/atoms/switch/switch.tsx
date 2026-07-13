import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '../icon/icon';

export type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

// Track 52×32 with a 2px border; knob offsets are relative to the inner (content) box.
const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const BORDER = 2;
const INNER_WIDTH = TRACK_WIDTH - BORDER * 2;
const INNER_HEIGHT = TRACK_HEIGHT - BORDER * 2;

/**
 * Switch — MD3 on/off toggle. The knob grows and shows a check when on.
 */
export const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  style,
}: SwitchProps) => {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[styles.root(disabled), style]}
    >
      <View style={styles.track(checked)}>
        <View style={styles.knob(checked)}>
          {checked ? <Icon name="check" size={16} color={theme.colors.primary} /> : null}
        </View>
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (disabled: boolean) => ({
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 12,
    minHeight: theme.layout.touchTarget,
    opacity: disabled ? theme.disabledOpacity : 1,
  }),
  track: (checked: boolean) => ({
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: theme.shape.full,
    borderWidth: BORDER,
    borderColor: checked ? theme.colors.primary : theme.colors.outline,
    backgroundColor: checked ? theme.colors.primary : theme.colors.surfaceContainerHighest,
  }),
  knob: (checked: boolean) => {
    const knobSize = checked ? 24 : 16;
    return {
      position: 'absolute',
      top: (INNER_HEIGHT - knobSize) / 2,
      left: checked ? INNER_WIDTH - knobSize - 2 : 4,
      width: knobSize,
      height: knobSize,
      borderRadius: knobSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: checked ? theme.colors.onPrimary : theme.colors.outline,
    };
  },
  label: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
  },
}));
