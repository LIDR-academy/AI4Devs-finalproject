import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '../icon/icon';

export type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  error?: boolean;
  selectable?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Checkbox — MD3 selection control. Supports indeterminate + label.
 */
export const Checkbox = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  error = false,
  style,
  selectable = false,
}: CheckboxProps) => {
  const { theme } = useUnistyles();
  const active = checked || indeterminate;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[styles.root(disabled, !!label), style]}
    >
      <View style={styles.box(active, error)}>
        {indeterminate ? (
          <Icon name="remove" size={16} color={theme.colors.onPrimary} />
        ) : checked ? (
          <Icon name="check" size={16} color={theme.colors.onPrimary} />
        ) : null}
      </View>
      {label ? <Text style={styles.label} selectable={selectable}>{label}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (disabled: boolean, hasLabel: boolean) => ({
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 10,
    minHeight: theme.layout.touchTarget,
    minWidth: hasLabel ? undefined : theme.layout.touchTarget,
    opacity: disabled ? theme.disabledOpacity : 1,
  }),
  box: (active: boolean, error: boolean) => ({
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    borderWidth: active ? 0 : 2,
    borderColor: error ? theme.colors.error : theme.colors.onSurfaceVariant,
    backgroundColor: active ? (error ? theme.colors.error : theme.colors.primary) : 'transparent',
  }),
  label: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
  },
}));
