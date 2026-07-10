import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '../../atoms/icon/icon';

export type AnswerOptionState = 'default' | 'selected' | 'correct' | 'incorrect';

export type AnswerOptionProps = {
  label: string;
  /** Letter marker (A/B/C…). */
  marker: string;
  state?: AnswerOptionState;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /**
   * Overrides the computed accessible name (default: `"{marker} {label}"`). Composers that add a
   * feedback icon alongside the label (e.g. the `correct`/`incorrect` states) should pass this
   * explicitly instead of relying on RN's default child-text concatenation — otherwise the icon's
   * internal Material Symbols ligature name (e.g. "check_circle") leaks into the accessible name.
   */
  accessibilityLabel?: string;
};

/**
 * AnswerOption — a selectable quiz answer tile (the core activity-slide control).
 * Feedback loop: default → selected → correct/incorrect. Rust = correct, error-red = incorrect.
 */
export const AnswerOption = ({
  label,
  marker,
  state = 'default',
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: AnswerOptionProps) => {
  const { theme } = useUnistyles();

  // 'default' is unistyles' reserved fallback key, selected by passing undefined.
  styles.useVariants({ state: state === 'default' ? undefined : state });

  const feedbackIcon = state === 'correct' ? 'check_circle' : state === 'incorrect' ? 'cancel' : null;
  const feedbackColor = state === 'correct' ? theme.colors.tertiary : theme.colors.error;
  const locked = disabled || state === 'correct' || state === 'incorrect';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${marker} ${label}`}
      accessibilityState={{ disabled: locked, selected: state === 'selected' }}
      disabled={locked}
      onPress={onPress}
      style={[styles.root, style]}
    >
      <View style={styles.marker}>
        <Text style={styles.markerText}>{marker}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      {feedbackIcon ? <Icon name={feedbackIcon} size={22} fill color={feedbackColor} /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.shape.md,
    variants: {
      state: {
        default: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        selected: {
          backgroundColor: theme.colors.primaryContainer,
          borderWidth: 2,
          borderColor: theme.colors.primary,
        },
        correct: {
          backgroundColor: theme.utils.mixHex(theme.colors.tertiaryContainer, theme.colors.surface, 0.55),
          borderWidth: 2,
          borderColor: theme.colors.tertiary,
        },
        incorrect: {
          backgroundColor: theme.colors.errorContainer,
          borderWidth: 2,
          borderColor: theme.colors.error,
        },
      },
    },
  },
  marker: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    variants: {
      state: {
        default: { backgroundColor: theme.colors.surfaceContainerHighest },
        selected: { backgroundColor: theme.colors.primary },
        correct: { backgroundColor: theme.colors.tertiary },
        incorrect: { backgroundColor: theme.colors.error },
      },
    },
  },
  markerText: {
    fontFamily: theme.fontFamily.brand,
    fontWeight: '700',
    fontSize: 15,
    variants: {
      state: {
        default: { color: theme.colors.onSurfaceVariant },
        selected: { color: theme.colors.onPrimary },
        correct: { color: theme.colors.onTertiary },
        incorrect: { color: theme.colors.onError },
      },
    },
  },
  label: {
    ...theme.typography.bodyLarge,
    flex: 1,
    variants: {
      state: {
        default: { color: theme.colors.onSurface },
        selected: { color: theme.colors.onPrimaryContainer },
        correct: { color: theme.colors.onTertiary },
        incorrect: { color: theme.colors.onErrorContainer },
      },
    },
  },
}));
