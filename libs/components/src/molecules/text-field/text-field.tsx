import { useState } from 'react';
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '../../atoms/icon/icon';

export type TextFieldVariant = 'filled' | 'outlined';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  variant?: TextFieldVariant;
  supportingText?: string;
  error?: boolean;
  /** Material Symbols icon names. */
  leadingIcon?: string;
  trailingIcon?: string;
  disabled?: boolean;
  /** Visible lines when multiline. */
  rows?: number;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  /**
   * Forwarded onto the underlying TextInput. Not yet declared on this RN version's
   * `TextInputProps`, but react-native-web's `createDOMProps` forwards it to `aria-invalid` —
   * unlike `accessibilityHint`, which react-native-web does not forward at all (Full-review
   * Round 1, Major 3). Defaults to `error` (Full-review Round 2) — TextField already owns the
   * visual error state, so it derives its own a11y-invalid signal instead of requiring every
   * consumer to pass both in lockstep. Still overridable for the rare case a caller wants to
   * decouple the two.
   */
  accessibilityInvalid?: boolean;
};

/**
 * TextField — MD3 text input. variant: filled | outlined.
 * Supports label, supporting text, leading/trailing icons, error state, multiline.
 */
export const TextField = ({
  label,
  variant = 'filled',
  supportingText,
  error = false,
  leadingIcon,
  trailingIcon,
  disabled = false,
  multiline = false,
  rows = 3,
  fullWidth = true,
  style,
  onFocus,
  onBlur,
  accessibilityInvalid = error,
  ...rest
}: TextFieldProps) => {
  const { theme } = useUnistyles();
  const [focus, setFocus] = useState(false);

  styles.useVariants({ variant });
  const accent = error
    ? theme.colors.error
    : focus
      ? theme.colors.primary
      : theme.colors.onSurfaceVariant;
  const borderColor = error
    ? theme.colors.error
    : focus
      ? theme.colors.primary
      : theme.colors.outline;
  // Not on this RN version's TextInputProps typings (see the prop's own doc comment above), so it
  // has to be merged into `rest` here rather than passed as a named JSX attribute.
  const inputProps = { ...rest, accessibilityInvalid };

  return (
    <View style={[styles.root(fullWidth), style]}>
      {label ? <Text style={styles.label(error)}>{label}</Text> : null}
      <View style={styles.field(accent, borderColor, focus, !!multiline, disabled)}>
        {leadingIcon ? (
          <Icon
            name={leadingIcon}
            size={20}
            color={theme.colors.onSurfaceVariant}
            style={multiline ? styles.multilineIcon : undefined}
          />
        ) : null}
        <TextInput
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          onFocus={(e) => {
            setFocus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            onBlur?.(e);
          }}
          style={styles.input(!!multiline, rows, borderColor)}
          {...inputProps}
        />
        {trailingIcon ? (
          <Icon
            name={trailingIcon}
            size={20}
            color={accent}
            style={multiline ? styles.multilineIcon : undefined}
          />
        ) : null}
      </View>
      {supportingText ? <Text style={styles.supporting(error)}>{supportingText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: (fullWidth: boolean) => ({
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  }),
  label: (error: boolean) => ({
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: 6,
    color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
  }),
  field: (
    accent: string,
    borderColor: string,
    focus: boolean,
    multiline: boolean,
    disabled: boolean,
  ) => ({
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: multiline ? 16 : 0,
    opacity: disabled ? theme.disabledOpacity : 1,
    variants: {
      variant: {
        filled: {
          backgroundColor: theme.colors.surfaceContainerHighest,
          borderBottomWidth: focus ? 2 : 1,
          borderBottomColor: accent,
          borderTopLeftRadius: theme.shape.textField,
          borderTopRightRadius: theme.shape.textField,
        },
        outlined: {
          backgroundColor: 'transparent',
          borderWidth: focus ? 2 : 1,
          borderColor,
          borderRadius: theme.shape.xs,
        },
      },
    },
  }),
  input: (multiline: boolean, rows: number, borderColor: string) => ({
    ...theme.typography.bodyLarge,
    flex: 1,
    color: theme.colors.onSurface,
    paddingVertical: multiline ? 0 : 16,
    minHeight: multiline ? rows * 24 : undefined,
    textAlignVertical: multiline ? 'top' : 'center',
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: borderColor,
  }),
  multilineIcon: {
    marginTop: 2,
  },
  supporting: (error: boolean) => ({
    ...theme.typography.bodySmall,
    marginTop: 4,
    paddingHorizontal: 16,
    color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
  }),
}));
