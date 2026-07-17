import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '../../atoms/icon/icon';

export type LanguageOption = { value: string; label: string };

export type LanguageSelectorProps = {
  /** Languages to choose from; each labelled by the caller in its own name (endonym). */
  options: LanguageOption[];
  /** The currently active language value. */
  value: string;
  /** Called with the chosen value when an option is pressed. */
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Accessible name for the whole group (e.g. "Choose a language"). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * LanguageSelector — presentational single-select list of languages (a molecule,
 * sibling to RadioGroup). Purely controlled via `value` + `onChange`; the active
 * option is indicated by a check icon and heavier label (not color alone, per AC14),
 * plus `accessibilityState.selected` for assistive tech.
 */
export const LanguageSelector = ({
  options,
  value,
  onChange,
  disabled = false,
  accessibilityLabel,
  style,
}: LanguageSelectorProps) => {
  const { theme } = useUnistyles();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group, style]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={styles.option(selected, disabled)}
          >
            <Text style={styles.label(selected)}>{option.label}</Text>
            {selected ? <Icon name="check" color={theme.colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: {
    alignSelf: 'stretch',
    gap: theme.spacing.s2,
  },
  option: (selected: boolean, disabled: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.s4,
    minHeight: theme.layout.touchTarget,
    paddingVertical: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s4,
    borderRadius: theme.shape.sm,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
    backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
    opacity: disabled ? theme.disabledOpacity : 1,
  }),
  label: (selected: boolean) => ({
    ...(selected ? theme.typography.titleMedium : theme.typography.bodyLarge),
    color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
  }),
}));
