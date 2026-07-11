import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';

export type ApiKeyRequiredNoticeLabels = {
  /** Inline copy explaining an API key is required (AC10). */
  message: string;
  /** Label for the action that navigates to the account screen. */
  action: string;
};

export type ApiKeyRequiredNoticeProps = {
  onNavigateToAccount: () => void;
  labels: ApiKeyRequiredNoticeLabels;
};

/**
 * ApiKeyRequiredNotice — presentational organism (AC10, @s10/@s14): an inline "an API key is
 * required" message plus an action linking to the account screen. Purely prop-driven — the
 * action is rendered via the Button atom, which sets `accessibilityRole="button"` by
 * construction, so this notice's action always exposes a button role.
 */
export const ApiKeyRequiredNotice = ({ onNavigateToAccount, labels }: ApiKeyRequiredNoticeProps) => (
  <View style={styles.notice}>
    <Text style={styles.message}>{labels.message}</Text>
    <Button onPress={onNavigateToAccount}>{labels.action}</Button>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  notice: {
    gap: theme.spacing.s4,
  },
  message: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
