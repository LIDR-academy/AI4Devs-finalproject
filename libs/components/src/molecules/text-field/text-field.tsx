import { useState } from 'react';
import { StyleProp, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
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
  ...rest
}: TextFieldProps) => {
  const { theme } = useUnistyles();
  const [focus, setFocus] = useState(false);

  styles.useVariants({ variant });
  const accent = error ? theme.colors.error : focus ? theme.colors.primary : theme.colors.onSurfaceVariant;
  const borderColor = error ? theme.colors.error : focus ? theme.colors.primary : theme.colors.outline;

  return (
    <View style={[styles.root(fullWidth), style]}>
      {label ? <Text style={styles.label(error)}>{label}</Text> : null}
      <View style={styles.field(accent, borderColor, focus, !!multiline, disabled)}>
        {leadingIcon ? (
          <Icon name={leadingIcon} size={20} color={theme.colors.onSurfaceVariant} style={multiline ? styles.multilineIcon : undefined} />
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
          {...rest}
        />
        {trailingIcon ? (
          <Icon name={trailingIcon} size={20} color={accent} style={multiline ? styles.multilineIcon : undefined} />
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
  field: (accent: string, borderColor: string, focus: boolean, multiline: boolean, disabled: boolean) => ({
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
