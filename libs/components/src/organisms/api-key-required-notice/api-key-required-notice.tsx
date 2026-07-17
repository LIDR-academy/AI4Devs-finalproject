import { useLocalization } from '@helsoft/localization';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';

import type { ApiKeyRequiredNoticeProps } from './api-key-required-notice.types';

/**
 * ApiKeyRequiredNotice — presentational organism (AC10, @s10/@s14): an inline "an API key is
 * required" message plus an action linking to the account screen. Purely prop-driven — the
 * action is rendered via the Button atom, which sets `accessibilityRole="button"` by
 * construction, so this notice's action always exposes a button role.
 */
export const ApiKeyRequiredNotice = ({ onNavigateToAccount }: ApiKeyRequiredNoticeProps) => {
  const { t } = useLocalization();

  return (
    <View style={styles.notice}>
      <Text style={styles.message}>{t('upload.apiKeyRequired.message')}</Text>
      <Button onPress={onNavigateToAccount}>{t('upload.apiKeyRequired.action')}</Button>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  notice: {
    gap: theme.spacing.s4,
  },
  message: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
