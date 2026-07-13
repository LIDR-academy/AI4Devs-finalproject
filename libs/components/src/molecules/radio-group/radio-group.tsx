import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type RadioOption = { value: string; label: string };

export type RadioGroupProps = {
  options?: Array<RadioOption | string>;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  direction?: 'column' | 'row';
  style?: StyleProp<ViewStyle>;
  /** Accessible name for the whole group (e.g. "Lesson content") — WCAG 1.3.1/4.1.2, mirrors
   * `LanguageSelector`'s own `accessibilityLabel` prop. */
  accessibilityLabel?: string;
};

/**
 * RadioGroup — MD3 single-select. Renders a list of radio options.
 */
export const RadioGroup = ({
  options = [],
  value,
  onChange,
  disabled = false,
  direction = 'column',
  style,
  accessibilityLabel,
}: RadioGroupProps) => {
  const norm: RadioOption[] = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  );

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group(direction), style]}
    >
      {norm.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            aria-checked={selected}
            disabled={disabled}
            onPress={() => onChange?.(opt.value)}
            style={styles.option(disabled)}
          >
            <View style={styles.ring(selected)}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.label}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: (direction: 'column' | 'row') => ({
    flexDirection: direction,
    gap: direction === 'row' ? 20 : 8,
  }),
  option: (disabled: boolean) => ({
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 12,
    opacity: disabled ? theme.disabledOpacity : 1,
  }),
  ring: (selected: boolean) => ({
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: selected ? theme.colors.primary : theme.colors.onSurfaceVariant,
  }),
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  label: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
  },
}));
